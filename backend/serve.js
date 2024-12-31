const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const fs = require("fs");
const path = require("path");

// Đọc cấu hình từ file config.txt
const configFilePath = path.join(__dirname, "config.txt");
function loadConfig(filePath) {
  const config = {};
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");

  lines.forEach((line) => {
    const [key, value] = line.split("=").map((item) => item.trim());
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
    encrypt: true, // Bật mã hóa
    trustServerCertificate: true, // Bypass xác thực chứng chỉ nếu server nội bộ
  },
};

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Request Body:", req.body);
  next();
});

// Response header middleware
app.use((req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
});

// Database connection
let pool;
async function connectToDatabase() {
  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ Kết nối SQL Server thành công!");
  } catch (err) {
    console.error("❌ Kết nối SQL Server thất bại:", err.message);
    process.exit(1); // Dừng server nếu kết nối thất bại
  }
}
connectToDatabase();

// API: Lấy danh sách thuốc
app.get("/api/thuoc", async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM Thuoc");
    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu thuốc:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu từ database",
    });
  }
});

// API: Get medicines
app.get("/api/thuoc", async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM Thuoc");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu từ database",
    });
  }
});

// API: Add new medicine
app.post("/api/thuoc", async (req, res) => {
  try {
    console.log("Received request to add medicine:", req.body);

    const { code, name, phone, description, quantity, price } = req.body;

    // Input validation
    if (!code || !name || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Check for existing medicine
    const checkResult = await pool
      .request()
      .input("code", sql.VarChar(10), code)
      .query("SELECT ID FROM Thuoc WHERE ID = @code");

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Mã thuốc ${code} đã tồn tại trong hệ thống`,
      });
    }

    // Insert new medicine
    await pool
      .request()
      .input("code", sql.VarChar(10), code)
      .input("name", sql.NVarChar(100), name)
      .input("phone", sql.NVarChar(15), phone || null)
      .input("description", sql.NVarChar(255), description || null)
      .input("quantity", sql.Int, Number(quantity))
      .input("price", sql.Decimal(18, 2), Number(price)).query(`
                INSERT INTO Thuoc (ID, TenThuoc, SDT, MoTa, SoLuong, GiaThuoc)
                VALUES (@code, @name, @phone, @description, @quantity, @price)
            `);

    console.log("Medicine added successfully:", code);

    res.status(201).json({
      success: true,
      message: "Thêm thuốc thành công",
      data: { code, name, phone, description, quantity, price },
    });
  } catch (err) {
    console.error("Error adding medicine:", err);

    // Handle specific SQL errors
    if (err.number === 2627) {
      return res.status(400).json({
        success: false,
        message: "Mã thuốc đã tồn tại trong hệ thống",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm thuốc: " + err.message,
    });
  }
});

app.get("/api/ThanhToan", async (req, res) => {
  const { page = 1, limit = 5, status } = req.query;
  try {
    const offset = (page - 1) * limit;
    let whereClause = "";
    if (status !== undefined) {
      whereClause = `WHERE status = ${status}`;
    }

    const query = `
            SELECT * FROM ThanhToan
            ${whereClause}
            ORDER BY paymentCreateDate DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${limit} ROWS ONLY;
        `;

    const totalQuery = `
            SELECT COUNT(*) AS total
            FROM ThanhToan
            ${whereClause};
        `;

    const result = await pool.request().query(query);
    const total = await pool.request().query(totalQuery);

    res.status(200).json({
      success: true,
      data: result.recordset,
      total: total.recordset[0].total,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu từ database",
    });
  }
});

// API lấy một ThanhToan theo paymentId
app.get("/api/ChiTietThanhToan/:paymentId", async (req, res) => {
  const paymentId = req.params.paymentId;
  try {
    const query = `SELECT * FROM ThanhToan WHERE id = @paymentId`;

    // Thực hiện truy vấn
    const result = await pool
      .request()
      .input("paymentId", sql.Int, paymentId)
      .query(query);

    if (result.recordset.length > 0) {
      res.json({ success: true, data: result.recordset[0] });
    } else {
      res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy thanh toán với ID đã cho",
        });
    }
  } catch (err) {
    console.error("Lỗi truy vấn:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
