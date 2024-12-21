const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

// SQL Server configuration
const dbConfig = {
    user: 'sa',
    password: '123',
    server: 'DESKTOP-PNANGIK',
    database: 'QuanLyBenhVien',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    }
};

const app = express();

// Middleware
app.use(express.json()); // Use express.json instead of bodyParser
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
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
        console.log('Connected to SQL Server');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}
connectToDatabase();

// API: Get medicines
app.get('/api/thuoc', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Thuoc');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu từ database'
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
        await pool.request()
            .input('code', sql.VarChar(10), code)
            .input('name', sql.NVarChar(100), name)
            .input('phone', sql.NVarChar(15), phone || null)
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
        
        // Handle specific SQL errors
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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});