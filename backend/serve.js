const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Đọc cấu hình từ file config.txt
const configFilePath = path.join(__dirname, 'config.txt');
function loadConfig(filePath) {
    const config = {};
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    lines.forEach(line => {
        const [key, value] = line.split('=').map(item => item.trim());
        if (key && value) {
            config[key] = value;
        }
    });

    return config;
}
const config = loadConfig(configFilePath);

// SQL Server configuration
const dbConfig = {
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    server: config.DB_SERVER,
    database: config.DB_DATABASE,
    options: {
        encrypt: false, // Bật mã hóa
        trustServerCertificate: true, // Bypass xác thực chứng chỉ nếu server nội bộ
    }
};

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});

// Response header middleware
app.use((req, res, next) => {
    res.header('Content-Type', 'application/json');
    next();
});

// Database connection
let pool;
async function connectToDatabase() {
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ Kết nối SQL Server thành công!');
        await ensureUserTableExists(); // Kiểm tra và tạo bảng NguoiDung nếu cần
    } catch (err) {
        console.error('❌ Lỗi kết nối SQL Server:', err);
        if (err.code === 'ELOGIN') {
            console.error('Lỗi đăng nhập: Kiểm tra lại tên người dùng và mật khẩu.');
        } else if (err.code === 'ETIMEOUT') {
            console.error('Lỗi timeout: Kiểm tra kết nối mạng hoặc cổng.');
        } else {
            console.error('Lỗi khác:', err.message);
        }
        process.exit(1); // Dừng server nếu kết nối thất bại
    }
}
connectToDatabase();

// Kiểm tra và tạo bảng NguoiDung nếu chưa tồn tại
async function ensureUserTableExists() {
    try {
        const tableCheckQuery = `
            IF NOT EXISTS (
                SELECT * FROM sysobjects WHERE name='NguoiDung' AND xtype='U'
            )
            BEGIN
                CREATE TABLE NguoiDung (
                    ID INT IDENTITY(1,1) PRIMARY KEY, -- ID tự tăng
                    Hinh NVARCHAR(255),              -- URL hoặc đường dẫn hình ảnh
                    TenDayDu NVARCHAR(100) NOT NULL, -- Tên đầy đủ
                    Email NVARCHAR(100) UNIQUE NOT NULL, -- Email
                    SDT NVARCHAR(15),                -- Số điện thoại
                    CCCD NVARCHAR(15),               -- Chứng minh nhân dân/Căn cước công dân
                    NgayTao DATETIME DEFAULT GETDATE() -- Ngày tạo
                )
            END
        `;

        await pool.request().query(tableCheckQuery);
        console.log('✅ Bảng NguoiDung đã được đảm bảo tồn tại!');
    } catch (err) {
        console.error('❌ Lỗi khi kiểm tra hoặc tạo bảng NguoiDung:', err.message);
    }
}

// API: Lấy danh sách người dùng
app.get('/api/nguoidung', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT ID, Hinh, TenDayDu, Email, SDT, CCCD FROM NguoiDung');
        res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (err) {
        console.error('❌ Lỗi lấy dữ liệu người dùng:', err.message);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu từ database',
        });
    }
});

// API: Thêm người dùng mới
app.post('/api/nguoidung', async (req, res) => {
    const { Hinh, TenDayDu, Email, SDT, CCCD } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!Hinh || !TenDayDu || !Email || !SDT || !CCCD) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin!',
        });
    }

    try {
        console.log('Dữ liệu đầu vào:', { Hinh, TenDayDu, Email, SDT, CCCD });

        // Kiểm tra xem Email hoặc CCCD đã tồn tại hay chưa
        const checkResult = await pool
            .request()
            .input('Email', sql.NVarChar, Email)
            .input('CCCD', sql.NVarChar, CCCD)
            .query(`
                SELECT * FROM NguoiDung 
                WHERE Email = @Email OR CCCD = @CCCD
            `);

        if (checkResult.recordset.length > 0) {
            // Kiểm tra xem trùng Email hay CCCD
            const existingUser = checkResult.recordset[0];
            if (existingUser.Email === Email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã tồn tại!',
                });
            } else if (existingUser.CCCD === CCCD) {
                return res.status(400).json({
                    success: false,
                    message: 'CCCD đã tồn tại!',
                });
            }
        }

        // Thực hiện thêm người dùng mới nếu không trùng
        const result = await pool
            .request()
            .input('Hinh', sql.NVarChar, Hinh)
            .input('TenDayDu', sql.NVarChar, TenDayDu)
            .input('Email', sql.NVarChar, Email)
            .input('SDT', sql.NVarChar, SDT)
            .input('CCCD', sql.NVarChar, CCCD)
            .query(`
                INSERT INTO NguoiDung (Hinh, TenDayDu, Email, SDT, CCCD)
                OUTPUT INSERTED.ID
                VALUES (@Hinh, @TenDayDu, @Email, @SDT, @CCCD);
            `);

        const newUserId = result.recordset[0].ID;
        console.log('Kết quả thêm người dùng:', result);

        res.status(201).json({
            success: true,
            message: 'Người dùng đã được thêm thành công',
            data: {
                ID: newUserId,
                Hinh,
                TenDayDu,
                Email,
                SDT,
                CCCD
            },
        });
    } catch (err) {
        console.error('❌ Lỗi khi thêm người dùng:', err);

        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi thêm người dùng.',
        });
    }
});


// API: Chỉnh sửa người dùng
app.put('/api/nguoidung/:id', async (req, res) => {
    const { id } = req.params;
    const { Hinh, TenDayDu, Email, SDT, CCCD } = req.body;

    if (!Hinh || !TenDayDu || !Email || !SDT || !CCCD) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin!',
        });
    }

    try {
        console.log('ID để chỉnh sửa:', id);
        console.log('Dữ liệu cập nhật:', { Hinh, TenDayDu, Email, SDT, CCCD });

        const result = await pool
            .request()
            .input('ID', sql.Int, id)
            .input('Hinh', sql.NVarChar, Hinh)
            .input('TenDayDu', sql.NVarChar, TenDayDu)
            .input('Email', sql.NVarChar, Email)
            .input('SDT', sql.NVarChar, SDT)
            .input('CCCD', sql.NVarChar, CCCD)
            .query(`
                UPDATE NguoiDung
                SET Hinh = @Hinh, TenDayDu = @TenDayDu, Email = @Email, SDT = @SDT, CCCD = @CCCD
                WHERE ID = @ID;
            `);

        console.log('Kết quả truy vấn:', result);

        if (result.rowsAffected[0] > 0) {
            const updatedUser = await pool.request()
                .input('ID', sql.Int, id)
                .query(`SELECT ID, Hinh, TenDayDu, Email, SDT, CCCD FROM NguoiDung WHERE ID = @ID`);

            res.status(200).json({
                success: true,
                message: 'Người dùng đã được cập nhật thành công',
                data: updatedUser.recordset[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng với ID này',
            });
        }
    } catch (err) {
        console.error('❌ Lỗi khi cập nhật người dùng:', err.message);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật người dùng.',
        });
    }
});

// API: Xóa người dùng
app.delete('/api/nguoidung/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log('ID để xóa:', id);

        const result = await pool
            .request()
            .input('ID', sql.Int, id)
            .query(`
                DELETE FROM NguoiDung
                WHERE ID = @ID;
            `);

        console.log('Kết quả xóa:', result);

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({
                success: true,
                message: 'Người dùng đã được xóa thành công',
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng với ID này',
            });
        }
    } catch (err) {
        console.error('❌ Lỗi khi xóa người dùng:', err.message);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa người dùng.',
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
