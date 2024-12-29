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
        const result = await pool.request().query(`
            SELECT 
                nd.ID, 
                nd.Hinh, 
                nd.TenDayDu, 
                nd.Email, 
                nd.SDT, 
                nd.CCCD, 
                nd.VaiTro,
                COALESCE(bn.DiaChi, 'Không có địa chỉ') AS DiaChi,
                COALESCE(bn.Tuoi, 0) AS Tuoi,
                COALESCE(bn.GioiTinh, 'Không xác định') AS GioiTinh,
                COALESCE(bs.ChuyenMon, 'Không có chuyên môn') AS ChuyenMon,
                COALESCE(bs.PhongKham, 'Không có phòng khám') AS PhongKham
            FROM NguoiDung nd
            LEFT JOIN BenhNhanVTP bn 
                ON nd.ID = bn.ID
            LEFT JOIN BacSiVTP bs 
                ON nd.ID = bs.ID
        `);

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
    const { Hinh, TenDayDu, Email, SDT, CCCD, VaiTro, DiaChi, Tuoi, GioiTinh, ChuyenMon, PhongKham } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!Hinh || !TenDayDu || !Email || !SDT || !CCCD || !VaiTro) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin!',
        });
    }

    try {
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

        // Thực hiện thêm người dùng mới
        const result = await pool
            .request()
            .input('Hinh', sql.NVarChar, Hinh)
            .input('TenDayDu', sql.NVarChar, TenDayDu)
            .input('Email', sql.NVarChar, Email)
            .input('SDT', sql.NVarChar, SDT)
            .input('CCCD', sql.NVarChar, CCCD)
            .input('VaiTro', sql.NVarChar, VaiTro)
            .query(`
                INSERT INTO NguoiDung (Hinh, TenDayDu, Email, SDT, CCCD, VaiTro)
                OUTPUT INSERTED.ID
                VALUES (@Hinh, @TenDayDu, @Email, @SDT, @CCCD, @VaiTro);
            `);

        const newUserId = result.recordset[0].ID;

        // Thêm thông tin chi tiết dựa trên vai trò
        if (VaiTro === 'Bệnh nhân') {
            await pool
                .request()
                .input('ID', sql.Int, newUserId)
                .input('DiaChi', sql.NVarChar, DiaChi)
                .input('Tuoi', sql.Int, Tuoi)
                .input('GioiTinh', sql.NVarChar, GioiTinh)
                .query(`
                    INSERT INTO BenhNhanVTP (ID, DiaChi, Tuoi, GioiTinh)
                    VALUES (@ID, @DiaChi, @Tuoi, @GioiTinh);
                `);
        } else if (VaiTro === 'Bác sĩ') {
            await pool
                .request()
                .input('ID', sql.Int, newUserId)
                .input('ChuyenMon', sql.NVarChar, ChuyenMon)
                .input('PhongKham', sql.NVarChar, PhongKham)
                .query(`
                    INSERT INTO BacSiVTP (ID, ChuyenMon, PhongKham)
                    VALUES (@ID, @ChuyenMon, @PhongKham);
                `);
        }

        res.status(201).json({
            success: true,
            message: 'Người dùng đã được thêm thành công',
            data: {
                ID: newUserId,
                Hinh,
                TenDayDu,
                Email,
                SDT,
                CCCD,
                VaiTro,
                DiaChi,
                Tuoi,
                GioiTinh,
                ChuyenMon,
                PhongKham
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
    const { Hinh, TenDayDu, Email, SDT, CCCD, VaiTro, DiaChi, Tuoi, GioiTinh, ChuyenMon, PhongKham } = req.body;

    if (!Hinh || !TenDayDu || !Email || !SDT || !CCCD || !VaiTro) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin!',
        });
    }

    try {
        // Kiểm tra xem Email hoặc CCCD đã tồn tại hay chưa cho người dùng khác
        const checkResult = await pool
            .request()
            .input('Email', sql.NVarChar, Email)
            .input('CCCD', sql.NVarChar, CCCD)
            .input('ID', sql.Int, id) // Thêm input ID để sử dụng trong truy vấn
            .query(`
                SELECT * FROM NguoiDung 
                WHERE (Email = @Email OR CCCD = @CCCD) AND ID != @ID
            `);

        if (checkResult.recordset.length > 0) {
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

        // Cập nhật thông tin người dùng
        const result = await pool
            .request()
            .input('ID', sql.Int, id)
            .input('Hinh', sql.NVarChar, Hinh)
            .input('TenDayDu', sql.NVarChar, TenDayDu)
            .input('Email', sql.NVarChar, Email)
            .input('SDT', sql.NVarChar, SDT)
            .input('CCCD', sql.NVarChar, CCCD)
            .input('VaiTro', sql.NVarChar, VaiTro)
            .query(`
                UPDATE NguoiDung
                SET Hinh = @Hinh, TenDayDu = @TenDayDu, Email = @Email, SDT = @SDT, CCCD = @CCCD, VaiTro = @VaiTro
                WHERE ID = @ID;
            `);

        // Cập nhật thông tin chi tiết dựa trên vai trò
        if (VaiTro === 'Bệnh nhân') {
            await pool
                .request()
                .input('ID', sql.Int, id)
                .input('DiaChi', sql.NVarChar, DiaChi)
                .input('Tuoi', sql.Int, Tuoi)
                .input('GioiTinh', sql.NVarChar, GioiTinh)
                .query(`
                    MERGE INTO BenhNhanVTP AS target
                    USING (SELECT @ID AS ID) AS source
                    ON target.ID = source.ID
                    WHEN MATCHED THEN
                        UPDATE SET DiaChi = @DiaChi, Tuoi = @Tuoi, GioiTinh = @GioiTinh
                    WHEN NOT MATCHED THEN
                        INSERT (ID, DiaChi, Tuoi, GioiTinh)
                        VALUES (@ID, @DiaChi, @Tuoi, @GioiTinh);
                `);
        } else if (VaiTro === 'Bác sĩ') {
            await pool
                .request()
                .input('ID', sql.Int, id)
                .input('ChuyenMon', sql.NVarChar, ChuyenMon)
                .input('PhongKham', sql.NVarChar, PhongKham)
                .query(`
                        MERGE INTO BacSiVTP AS target
                        USING (SELECT @ID AS ID) AS source
                        ON target.ID = source.ID
                        WHEN MATCHED THEN
                            UPDATE SET ChuyenMon = @ChuyenMon, PhongKham = @PhongKham
                        WHEN NOT MATCHED THEN
                            INSERT (ID, ChuyenMon, PhongKham)
                            VALUES (@ID, @ChuyenMon, @PhongKham);
                    `);
        }

        console.log('Kết quả truy vấn cập nhật:', result);

        if (result.rowsAffected[0] > 0) {
            const updatedUser = await pool.request()
                .input('ID', sql.Int, id)
                .query(`SELECT ID, Hinh, TenDayDu, Email, SDT, CCCD, VaiTro FROM NguoiDung WHERE ID = @ID`);

            // Lấy thông tin chi tiết dựa trên vai trò
            let additionalInfo = {};
            if (VaiTro === 'Bệnh nhân') {
                const patientInfo = await pool.request()
                    .input('ID', sql.Int, id)
                    .query(`SELECT DiaChi, Tuoi, GioiTinh FROM BenhNhanVTP WHERE ID = @ID`);
                additionalInfo = patientInfo.recordset[0];
            } else if (VaiTro === 'Bác sĩ') {
                const doctorInfo = await pool.request()
                    .input('ID', sql.Int, id)
                    .query(`SELECT ChuyenMon, PhongKham FROM BacSiVTP WHERE ID = @ID`);
                additionalInfo = doctorInfo.recordset[0];
            }

            res.status(200).json({
                success: true,
                message: 'Người dùng đã được cập nhật thành công',
                data: {
                    ...updatedUser.recordset[0],
                    ...additionalInfo
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng với ID này',
            });
        }
    } catch (err) {
        console.error('❌ Lỗi khi cập nhật người dùng:', err);

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
