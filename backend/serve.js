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
        encrypt: true,
        trustServerCertificate: true,
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
    if (req.method !== 'GET') {
        console.log('Request Body:', req.body);
    }
    next();
});

// Database connection
let pool;
async function connectToDatabase() {
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ Kết nối SQL Server thành công!');
        
        // Kiểm tra kết nối và structure của bảng Thuoc
        const tableCheck = await pool.request().query(`
            SELECT TOP 1 ID, TenThuoc, SDT, MoTa, SoLuong, GiaThuoc 
            FROM Thuoc 
            ORDER BY ID DESC
        `);
        console.log('Database structure check passed');
        console.log('Last record:', tableCheck.recordset[0]);
    } catch (err) {
        console.error('❌ Kết nối SQL Server thất bại:', err.message);
        process.exit(1);
    }
}
connectToDatabase();

// API: Lấy danh sách thuốc
app.get('/api/thuoc', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Thuoc ORDER BY ID DESC');
        res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (err) {
        console.error('❌ Lỗi lấy dữ liệu thuốc:', err.message);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu từ database: ' + err.message
        });
    }
});

// API: Add new medicine
app.post('/api/thuoc', async (req, res) => {
    try {
        console.log('Received request to add medicine:', req.body);
        
        const { code, name, phone, description, quantity, price } = req.body;

        // Input validation
        if (!code || !name || !quantity || !price) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Validate code format
        if (!code.match(/^T\d{3}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Mã thuốc không đúng định dạng (phải là T và 3 số)'
            });
        }

        // Check for existing medicine
        const checkResult = await pool.request()
            .input('code', sql.VarChar(10), code)
            .query('SELECT ID FROM Thuoc WHERE ID = @code');

        if (checkResult.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Mã thuốc ${code} đã tồn tại trong hệ thống`
            });
        }

        // Insert new medicine
        const insertResult = await pool.request()
            .input('code', sql.VarChar(10), code)
            .input('name', sql.NVarChar(100), name)
            .input('phone', sql.VarChar(15), phone || null)
            .input('description', sql.NVarChar(255), description || null)
            .input('quantity', sql.Int, Number(quantity))
            .input('price', sql.Decimal(18, 2), Number(price))
            .query(`
                INSERT INTO Thuoc (ID, TenThuoc, SDT, MoTa, SoLuong, GiaThuoc)
                VALUES (@code, @name, @phone, @description, @quantity, @price)
            `);

        console.log('Medicine added successfully:', code);
        
        res.status(201).json({
            success: true,
            message: 'Thêm thuốc thành công',
            data: { code, name, phone, description, quantity, price }
        });
        
    } catch (err) {
        console.error('Error adding medicine:', err);
        
        if (err.number === 2627) {
            return res.status(400).json({
                success: false,
                message: 'Mã thuốc đã tồn tại trong hệ thống'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm thuốc: ' + err.message
        });
    }
});

// API: Lấy mã thuốc tiếp theo
app.get('/api/thuoc/next-code', async (req, res) => {
    try {
        console.log('Fetching next medicine code...');
        
        const result = await pool.request()
            .query('SELECT TOP 1 ID FROM Thuoc ORDER BY ID DESC');
            
        console.log('Query result:', result.recordset);
        
        let nextCode = 'T005'; // Mã mặc định nếu không có dữ liệu
        
        if (result.recordset && result.recordset.length > 0) {
            const lastCode = result.recordset[0].ID;
            console.log('Last code found:', lastCode);
            
            // Xử lý cho cả hai format T0004 và T004
            if (lastCode && lastCode.startsWith('T')) {
                // Lấy phần số và loại bỏ các số 0 ở đầu
                const numPart = parseInt(lastCode.substring(1).replace(/^0+/, ''));
                if (!isNaN(numPart)) {
                    // Format mới: Txxx (không có số 0 ở đầu)
                    nextCode = `T${String(numPart + 1).padStart(3, '0')}`;
                    console.log('Generated next code:', nextCode);
                }
            }
        }
        
        res.status(200).json({
            success: true,
            nextCode: nextCode
        });
        
    } catch (err) {
        console.error('Error in next-code API:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy mã thuốc tiếp theo: ' + err.message
        });
    }
});
// API: Delete medicine
app.delete('/api/thuoc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting medicine with ID:', id);

        // Kiểm tra thuốc tồn tại
        const checkResult = await pool.request()
            .input('id', sql.VarChar(10), id)
            .query('SELECT ID FROM Thuoc WHERE ID = @id');

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy thuốc với mã ${id}`
            });
        }

        // Thực hiện xóa
        await pool.request()
            .input('id', sql.VarChar(10), id)
            .query('DELETE FROM Thuoc WHERE ID = @id');

        console.log('Medicine deleted successfully:', id);
        
        res.status(200).json({
            success: true,
            message: 'Xóa thuốc thành công'
        });
        
    } catch (err) {
        console.error('Error deleting medicine:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa thuốc: ' + err.message
        });
    }
});
// API: Get medicine detail by ID
app.get('/api/thuoc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.request()
            .input('id', sql.VarChar(10), id)
            .query(`
                SELECT * FROM Thuoc 
                WHERE ID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thuốc'
            });
        }

        res.status(200).json({
            success: true,
            data: result.recordset[0]
        });
        
    } catch (err) {
        console.error('Error fetching medicine detail:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin thuốc'
        });
    }
});
// API: Update medicine
app.put('/api/thuoc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, description, quantity, price } = req.body;

        // Input validation
        if (!name || !quantity || !price) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Check if medicine exists
        const checkResult = await pool.request()
            .input('id', sql.VarChar(10), id)
            .query('SELECT ID FROM Thuoc WHERE ID = @id');

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy thuốc với mã ${id}`
            });
        }

        // Update medicine
        await pool.request()
            .input('id', sql.VarChar(10), id)
            .input('name', sql.NVarChar(100), name)
            .input('phone', sql.NVarChar(15), phone || null)
            .input('description', sql.NVarChar(255), description || null)
            .input('quantity', sql.Int, Number(quantity))
            .input('price', sql.Decimal(18, 2), Number(price))
            .query(`
                UPDATE Thuoc 
                SET TenThuoc = @name,
                    SDT = @phone,
                    MoTa = @description,
                    SoLuong = @quantity,
                    GiaThuoc = @price
                WHERE ID = @id
            `);

        res.status(200).json({
            success: true,
            message: 'Cập nhật thuốc thành công',
            data: { id, name, phone, description, quantity, price }
        });
        
    } catch (err) {
        console.error('Error updating medicine:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thuốc: ' + err.message
        });
    }
});
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});