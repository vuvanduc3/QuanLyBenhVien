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
  if (req.method !== "GET") {
    console.log("Request Body:", req.body);
  }
  next();
});

// Database connection
let pool;
async function connectToDatabase() {
  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ Kết nối SQL Server thành công!");
    await ensureUserTableExists(); // Kiểm tra và tạo bảng NguoiDung nếu cần

    // Kiểm tra kết nối và structure của bảng Thuoc
    const tableCheck = await pool.request().query(`
            SELECT TOP 1 MaVatTu, TenVatTu, LoaiVatTu,DonViTinh,SoLuong,GiaTien
            FROM VatTuYTe 
            ORDER BY MaVatTu DESC
        `);
    console.log("Database structure check passed");
    console.log("Last record:", tableCheck.recordset[0]);
  } catch (err) {
    console.error("❌ Kết nối SQL Server thất bại:", err.message);
    process.exit(1);
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
    console.log("✅ Bảng NguoiDung đã được đảm bảo tồn tại!");
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra hoặc tạo bảng NguoiDung:", err.message);
  }
}
// API: Lấy danh sách người dùng
app.get("/api/nguoidung", async (req, res) => {
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
    console.error("❌ Lỗi lấy dữ liệu người dùng:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu từ database: " + err.message,
    });
  }
});

// API: Thêm người dùng mới
app.post("/api/nguoidung", async (req, res) => {
  const {
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
    PhongKham,
  } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!Hinh || !TenDayDu || !Email || !SDT || !CCCD || !VaiTro) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền đầy đủ thông tin!",
    });
  }

  try {
    // Kiểm tra xem Email hoặc CCCD đã tồn tại hay chưa
    const checkResult = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .input("CCCD", sql.NVarChar, CCCD).query(`
                SELECT * FROM NguoiDung 
                WHERE Email = @Email OR CCCD = @CCCD
            `);

    if (checkResult.recordset.length > 0) {
      const existingUser = checkResult.recordset[0];
      if (existingUser.Email === Email) {
        return res.status(400).json({
          success: false,
          message: "Email đã tồn tại!",
        });
      } else if (existingUser.CCCD === CCCD) {
        return res.status(400).json({
          success: false,
          message: "CCCD đã tồn tại!",
        });
      }
    }

    // Thực hiện thêm người dùng mới
    const result = await pool
      .request()
      .input("Hinh", sql.NVarChar, Hinh)
      .input("TenDayDu", sql.NVarChar, TenDayDu)
      .input("Email", sql.NVarChar, Email)
      .input("SDT", sql.NVarChar, SDT)
      .input("CCCD", sql.NVarChar, CCCD)
      .input("VaiTro", sql.NVarChar, VaiTro).query(`
                INSERT INTO NguoiDung (Hinh, TenDayDu, Email, SDT, CCCD, VaiTro)
                OUTPUT INSERTED.ID
                VALUES (@Hinh, @TenDayDu, @Email, @SDT, @CCCD, @VaiTro);
            `);

    const newUserId = result.recordset[0].ID;

    // Thêm thông tin chi tiết dựa trên vai trò
    if (VaiTro === "Bệnh nhân") {
      await pool
        .request()
        .input("ID", sql.Int, newUserId)
        .input("DiaChi", sql.NVarChar, DiaChi)
        .input("Tuoi", sql.Int, Tuoi)
        .input("GioiTinh", sql.NVarChar, GioiTinh).query(`
                    INSERT INTO BenhNhanVTP (ID, DiaChi, Tuoi, GioiTinh)
                    VALUES (@ID, @DiaChi, @Tuoi, @GioiTinh);
                `);
    } else if (VaiTro === "Bác sĩ") {
      await pool
        .request()
        .input("ID", sql.Int, newUserId)
        .input("ChuyenMon", sql.NVarChar, ChuyenMon)
        .input("PhongKham", sql.NVarChar, PhongKham).query(`
                    INSERT INTO BacSiVTP (ID, ChuyenMon, PhongKham)
                    VALUES (@ID, @ChuyenMon, @PhongKham);
                `);
    }

    res.status(201).json({
      success: true,
      message: "Người dùng đã được thêm thành công",
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
        PhongKham,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm người dùng:", err);

    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi thêm người dùng.",
    });
  }
});

// API: Chỉnh sửa người dùng
app.put("/api/nguoidung/:id", async (req, res) => {
  const { id } = req.params;
  const {
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
    PhongKham,
  } = req.body;

  if (!Hinh || !TenDayDu || !Email || !SDT || !CCCD || !VaiTro) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền đầy đủ thông tin!",
    });
  }

  try {
    // Validate code format
    if (!code.match(/^T\d{3}$/)) {
      return res.status(400).json({
        success: false,
        message: "Mã thuốc không đúng định dạng (phải là T và 3 số)",
      });
    }

    // Kiểm tra xem Email hoặc CCCD đã tồn tại hay chưa cho người dùng khác
    const checkResult = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .input("CCCD", sql.NVarChar, CCCD)
      .input("ID", sql.Int, id) // Thêm input ID để sử dụng trong truy vấn
      .query(`
                SELECT * FROM NguoiDung 
                WHERE (Email = @Email OR CCCD = @CCCD) AND ID != @ID
            `);

    if (checkResult.recordset.length > 0) {
      const existingUser = checkResult.recordset[0];
      if (existingUser.Email === Email) {
        return res.status(400).json({
          success: false,
          message: "Email đã tồn tại!",
        });
      } else if (existingUser.CCCD === CCCD) {
        return res.status(400).json({
          success: false,
          message: "CCCD đã tồn tại!",
        });
      }
    }

    // Cập nhật thông tin người dùng
    const result = await pool
      .request()
      .input("ID", sql.Int, id)
      .input("Hinh", sql.NVarChar, Hinh)
      .input("TenDayDu", sql.NVarChar, TenDayDu)
      .input("Email", sql.NVarChar, Email)
      .input("SDT", sql.NVarChar, SDT)
      .input("CCCD", sql.NVarChar, CCCD)
      .input("VaiTro", sql.NVarChar, VaiTro).query(`
                UPDATE NguoiDung
                SET Hinh = @Hinh, TenDayDu = @TenDayDu, Email = @Email, SDT = @SDT, CCCD = @CCCD, VaiTro = @VaiTro
                WHERE ID = @ID;
            `);

    // Cập nhật thông tin chi tiết dựa trên vai trò
    if (VaiTro === "Bệnh nhân") {
      await pool
        .request()
        .input("ID", sql.Int, id)
        .input("DiaChi", sql.NVarChar, DiaChi)
        .input("Tuoi", sql.Int, Tuoi)
        .input("GioiTinh", sql.NVarChar, GioiTinh).query(`
                    MERGE INTO BenhNhanVTP AS target
                    USING (SELECT @ID AS ID) AS source
                    ON target.ID = source.ID
                    WHEN MATCHED THEN
                        UPDATE SET DiaChi = @DiaChi, Tuoi = @Tuoi, GioiTinh = @GioiTinh
                    WHEN NOT MATCHED THEN
                        INSERT (ID, DiaChi, Tuoi, GioiTinh)
                        VALUES (@ID, @DiaChi, @Tuoi, @GioiTinh);
                `);
    } else if (VaiTro === "Bác sĩ") {
      await pool
        .request()
        .input("ID", sql.Int, id)
        .input("ChuyenMon", sql.NVarChar, ChuyenMon)
        .input("PhongKham", sql.NVarChar, PhongKham).query(`
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

    console.log("Kết quả truy vấn cập nhật:", result);

    if (result.rowsAffected[0] > 0) {
      const updatedUser = await pool
        .request()
        .input("ID", sql.Int, id)
        .query(
          `SELECT ID, Hinh, TenDayDu, Email, SDT, CCCD, VaiTro FROM NguoiDung WHERE ID = @ID`
        );

      // Lấy thông tin chi tiết dựa trên vai trò
      let additionalInfo = {};
      if (VaiTro === "Bệnh nhân") {
        const patientInfo = await pool
          .request()
          .input("ID", sql.Int, id)
          .query(
            `SELECT DiaChi, Tuoi, GioiTinh FROM BenhNhanVTP WHERE ID = @ID`
          );
        additionalInfo = patientInfo.recordset[0];
      } else if (VaiTro === "Bác sĩ") {
        const doctorInfo = await pool
          .request()
          .input("ID", sql.Int, id)
          .query(`SELECT ChuyenMon, PhongKham FROM BacSiVTP WHERE ID = @ID`);
        additionalInfo = doctorInfo.recordset[0];
      }

      res.status(200).json({
        success: true,
        message: "Người dùng đã được cập nhật thành công",
        data: {
          ...updatedUser.recordset[0],
          ...additionalInfo,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với ID này",
      });
    }
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật người dùng:", err);

    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi cập nhật người dùng.",
    });
  }
});

// API: Xóa người dùng
app.delete("/api/nguoidung/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log("ID để xóa:", id);

    const result = await pool.request().input("ID", sql.Int, id);

    // Insert new medicine
    const insertResult = await pool
      .request()
      .input("code", sql.VarChar(10), code)
      .input("name", sql.NVarChar(100), name)
      .input("phone", sql.VarChar(15), phone || null)
      .input("description", sql.NVarChar(255), description || null)
      .input("quantity", sql.Int, Number(quantity))
      .input("price", sql.Decimal(18, 2), Number(price)).query(`
                DELETE FROM NguoiDung
                WHERE ID = @ID;
            `);

    console.log("Kết quả xóa:", result);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({
        success: true,
        message: "Người dùng đã được xóa thành công",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Mã thuốc đã tồn tại trong hệ thống",
      });
    }
  } catch (err) {
    console.error("❌ Lỗi khi xóa người dùng:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa hồ sơ bệnh án: " + err.message,
    });
  }
});
// API: Lấy danh sách thuốc
app.get("/api/thuoc", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM Thuoc ORDER BY ID DESC");
    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu thuốc:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu từ database: " + err.message,
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

    // Validate code format
    if (!code.match(/^T\d{3}$/)) {
      return res.status(400).json({
        success: false,
        message: "Mã thuốc không đúng định dạng (phải là T và 3 số)",
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
    const insertResult = await pool
      .request()
      .input("code", sql.VarChar(10), code)
      .input("name", sql.NVarChar(100), name)
      .input("phone", sql.VarChar(15), phone || null)
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

// API: Lấy mã thuốc tiếp theo
app.get("/api/thuoc/next-code", async (req, res) => {
  try {
    console.log("Fetching next medicine code...");

    const result = await pool
      .request()
      .query("SELECT TOP 1 ID FROM Thuoc ORDER BY ID DESC");

    console.log("Query result:", result.recordset);

    let nextCode = "T005"; // Mã mặc định nếu không có dữ liệu

    if (result.recordset && result.recordset.length > 0) {
      const lastCode = result.recordset[0].ID;
      console.log("Last code found:", lastCode);

      // Xử lý cho cả hai format T0004 và T004
      if (lastCode && lastCode.startsWith("T")) {
        // Lấy phần số và loại bỏ các số 0 ở đầu
        const numPart = parseInt(lastCode.substring(1).replace(/^0+/, ""));
        if (!isNaN(numPart)) {
          // Format mới: Txxx (không có số 0 ở đầu)
          nextCode = `T${String(numPart + 1).padStart(3, "0")}`;
          console.log("Generated next code:", nextCode);
        }
      }
    }

    res.status(200).json({
      success: true,
      nextCode: nextCode,
    });
  } catch (err) {
    console.error("Error in next-code API:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy mã thuốc tiếp theo: " + err.message,
    });
  }
});
// API: Delete medicine
app.delete("/api/thuoc/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting medicine with ID:", id);

    // Kiểm tra thuốc tồn tại
    const checkResult = await pool
      .request()
      .input("id", sql.VarChar(10), id)
      .query("SELECT ID FROM Thuoc WHERE ID = @id");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thuốc với mã ${id}`,
      });
    }

    // Thực hiện xóa
    await pool
      .request()
      .input("id", sql.VarChar(10), id)
      .query("DELETE FROM Thuoc WHERE ID = @id");

    console.log("Medicine deleted successfully:", id);

    res.status(200).json({
      success: true,
      message: "Xóa thuốc thành công",
    });
  } catch (err) {
    console.error("Error deleting medicine:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa thuốc: " + err.message,
    });
  }
});
// API: Get medicine detail by ID
app.get("/api/thuoc/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.request().input("id", sql.VarChar(10), id).query(`
                SELECT * FROM Thuoc 
                WHERE ID = @id
            `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thuốc",
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    console.error("Error fetching medicine detail:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin thuốc",
    });
  }
});
// API: Update medicine
app.put("/api/thuoc/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, description, quantity, price } = req.body;

    // Input validation
    if (!name || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Check if medicine exists
    const checkResult = await pool
      .request()
      .input("id", sql.VarChar(10), id)
      .query("SELECT ID FROM Thuoc WHERE ID = @id");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thuốc với mã ${id}`,
      });
    }

    // Update medicine
    await pool
      .request()
      .input("id", sql.VarChar(10), id)
      .input("name", sql.NVarChar(100), name)
      .input("phone", sql.NVarChar(15), phone || null)
      .input("description", sql.NVarChar(255), description || null)
      .input("quantity", sql.Int, Number(quantity))
      .input("price", sql.Decimal(18, 2), Number(price)).query(`
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
      message: "Cập nhật thuốc thành công",
      data: { id, name, phone, description, quantity, price },
    });
  } catch (err) {
    console.error("Error updating medicine:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật thuốc: " + err.message,
    });
  }
});
// API: Lấy mã bệnh nhân tiếp theo
app.get("/api/medical-records/next-patient-code", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query(
        "SELECT TOP 1 MaBenhNhan FROM HoSoBenhAn ORDER BY MaBenhNhan DESC"
      );

    let nextCode = "BN048"; // Mã mặc định nếu không có dữ liệu

    if (result.recordset && result.recordset.length > 0) {
      const lastCode = result.recordset[0].MaBenhNhan;
      if (lastCode && lastCode.startsWith("BN")) {
        // Lấy phần số và tăng lên 1
        const numPart = parseInt(lastCode.substring(2));
        if (!isNaN(numPart)) {
          nextCode = `BN${String(numPart + 1).padStart(3, "0")}`;
        }
      }
    }

    res.status(200).json({
      success: true,
      nextCode: nextCode,
    });
  } catch (err) {
    console.error("Error generating next patient code:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo mã bệnh nhân mới",
    });
  }
});
// API: Lấy mã lịch hẹn tiếp theo (đặt trước các routes khác)
app.get("/api/medical-records/next-appointment-code", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT TOP 1 MaLichHen FROM HoSoBenhAn ORDER BY MaLichHen DESC");

    let nextCode = "LH049"; // Bắt đầu từ LH049

    if (result.recordset && result.recordset.length > 0) {
      const lastCode = result.recordset[0].MaLichHen;
      console.log("Last appointment code:", lastCode);

      if (lastCode && lastCode.startsWith("LH")) {
        const numPart = parseInt(lastCode.substring(2));
        if (!isNaN(numPart)) {
          nextCode = `LH${String(numPart + 1).padStart(3, "0")}`;
          console.log("Generated next appointment code:", nextCode);
        }
      }
    }

    res.status(200).json({
      success: true,
      nextCode: nextCode,
    });
  } catch (err) {
    console.error("Error generating next appointment code:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo mã lịch hẹn mới",
    });
  }
});
// API: Get all medical records
app.get("/api/medical-records", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM HoSoBenhAn ORDER BY NgayLap DESC");

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error("Error fetching medical records:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách hồ sơ bệnh án: " + err.message,
    });
  }
});

// API: Get medical record by ID
app.get("/api/medical-records/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM HoSoBenhAn WHERE ID = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hồ sơ bệnh án",
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    console.error("Error fetching medical record:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin hồ sơ bệnh án: " + err.message,
    });
  }
});

// API: Create new medical record
app.post("/api/medical-records", async (req, res) => {
  try {
    const { maBenhNhan, maLichHen, bacSi, chanDoan, ngayLap, action } =
      req.body;

    // Input validation
    if (
      !maBenhNhan ||
      !maLichHen ||
      !bacSi ||
      !chanDoan ||
      !ngayLap ||
      !action
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    const result = await pool
      .request()
      .input("maBenhNhan", sql.NVarChar(50), maBenhNhan)
      .input("maLichHen", sql.NVarChar(50), maLichHen)
      .input("bacSi", sql.NVarChar(100), bacSi)
      .input("chanDoan", sql.NVarChar(sql.MAX), chanDoan)
      .input("ngayLap", sql.Date, new Date(ngayLap))
      .input("action", sql.NVarChar(50), action).query(`
                INSERT INTO HoSoBenhAn (MaBenhNhan, MaLichHen, BacSi, ChanDoan, NgayLap, Action)
                VALUES (@maBenhNhan, @maLichHen, @bacSi, @chanDoan, @ngayLap, @action);
                SELECT SCOPE_IDENTITY() AS ID;
            `);

    res.status(201).json({
      success: true,
      message: "Thêm hồ sơ bệnh án thành công",
      data: {
        id: result.recordset[0].ID,
        maBenhNhan,
        maLichHen,
        bacSi,
        chanDoan,
        ngayLap,
        action,
      },
    });
  } catch (err) {
    console.error("Error creating medical record:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm hồ sơ bệnh án: " + err.message,
    });
  }
});

// API: Update medical record
app.put("/api/medical-records/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { maBenhNhan, maLichHen, bacSi, chanDoan, ngayLap, action } =
      req.body;

    // Input validation
    if (
      !maBenhNhan ||
      !maLichHen ||
      !bacSi ||
      !chanDoan ||
      !ngayLap ||
      !action
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Check if record exists
    const checkResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT ID FROM HoSoBenhAn WHERE ID = @id");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hồ sơ bệnh án",
      });
    }

    // Update record
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("maBenhNhan", sql.NVarChar(50), maBenhNhan)
      .input("maLichHen", sql.NVarChar(50), maLichHen)
      .input("bacSi", sql.NVarChar(100), bacSi)
      .input("chanDoan", sql.NVarChar(sql.MAX), chanDoan)
      .input("ngayLap", sql.Date, new Date(ngayLap))
      .input("action", sql.NVarChar(50), action).query(`
                UPDATE HoSoBenhAn 
                SET MaBenhNhan = @maBenhNhan,
                    MaLichHen = @maLichHen,
                    BacSi = @bacSi,
                    ChanDoan = @chanDoan,
                    NgayLap = @ngayLap,
                    Action = @action
                WHERE ID = @id
            `);

    res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ bệnh án thành công",
      data: {
        id,
        maBenhNhan,
        maLichHen,
        bacSi,
        chanDoan,
        ngayLap,
        action,
      },
    });
  } catch (err) {
    console.error("Error updating medical record:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật hồ sơ bệnh án: " + err.message,
    });
  }
});

// API: Delete medical record
app.delete("/api/medical-records/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if record exists
    const checkResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT ID FROM HoSoBenhAn WHERE ID = @id");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hồ sơ bệnh án",
      });
    }

    // Delete record
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM HoSoBenhAn WHERE ID = @id");

    res.status(200).json({
      success: true,
      message: "Xóa hồ sơ bệnh án thành công",
    });
  } catch (err) {
    console.error("Error deleting medical record:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa hồ sơ bệnh án: " + err.message,
    });
  }
});

//-----------------------//
// API: Lấy danh sách vật tư
app.get("/api/vattu", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM VatTuYTe ORDER BY MaVatTu DESC");
    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu Vật tư:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu từ database: " + err.message,
    });
  }
});

// API: Thêm vật tư
app.post("/api/vattu", async (req, res) => {
  try {
    console.log("Received request to add vật tư:", req.body);

    const { code, tenVatTu, loaiVatTu, donViTinh, soLuong, giaTien } = req.body;

    // Input validation
    if (
      !code ||
      !tenVatTu ||
      !loaiVatTu ||
      !donViTinh ||
      !soLuong ||
      !giaTien
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Validate data types
    if (typeof soLuong !== "number" || soLuong <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải là số dương",
      });
    }

    if (typeof giaTien !== "number" || giaTien <= 0) {
      return res.status(400).json({
        success: false,
        message: "Giá tiền phải là số dương",
      });
    }

    // Insert new vật tư
    const insertResult = await pool
      .request()
      .input("code", sql.VarChar(10), code)
      .input("tenVatTu", sql.NVarChar(100), tenVatTu)
      .input("loaiVatTu", sql.NVarChar(255), loaiVatTu)
      .input("donViTinh", sql.NVarChar(50), donViTinh)
      .input("soLuong", sql.Int, soLuong)
      .input("giaTien", sql.Decimal(18, 2), giaTien).query(`
                INSERT INTO VatTuYTe (MaVatTu,TenVatTu, LoaiVatTu, DonViTinh, SoLuong, GiaTien)
                VALUES (@code,@tenVatTu, @loaiVatTu, @donViTinh, @soLuong, @giaTien)
            `);

    console.log("Vật tư added successfully:", tenVatTu);

    res.status(201).json({
      success: true,
      message: "Thêm vật tư thành công",
      data: { code, tenVatTu, loaiVatTu, donViTinh, soLuong, giaTien },
    });
  } catch (err) {
    console.error("Error adding vật tư:", err);

    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm vật tư: " + err.message,
    });
  }
});

app.get("/api/vattu/next-code", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT TOP 1 MaVatTu FROM VatTuYTe ORDER BY MaVatTu DESC");

    let nextCode = "VT005"; // Default code
    if (result.recordset.length > 0) {
      const lastCode = result.recordset[0].MaVatTu;
      const numericPart = parseInt(lastCode.substring(2), 10);
      nextCode = `VT${String(numericPart + 1).padStart(3, "0")}`;
    }

    res.status(200).json({ success: true, nextCode });
  } catch (err) {
    console.error("Error fetching next code:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// API: Delete medicine
app.delete("/api/vattu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting medicine with ID:", id);

    // Kiểm tra thuốc tồn tại
    const checkResult = await pool
      .request()
      .input("id", sql.VarChar(10), id)
      .query("SELECT MaVatTu FROM VatTuYTe WHERE MaVatTu = @id");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thuốc với mã ${id}`,
      });
    }

    // Thực hiện xóa
    await pool
      .request()
      .input("id", sql.VarChar(10), id)
      .query("DELETE FROM VatTuYTe WHERE MaVatTu = @id");

    console.log("Medicine deleted successfully:", id);

    res.status(200).json({
      success: true,
      message: "Xóa thuốc thành công",
    });
  } catch (err) {
    console.error("Error deleting medicine:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa thuốc: " + err.message,
    });
  }
});
// API: Get medicine detail by ID
app.get("/api/vattu/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.request().input("id", sql.VarChar(10), id).query(`
                SELECT * FROM VatTuYTe 
                WHERE MaVatTu = @id
            `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vật tư",
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    console.error("Error fetching medicine detail:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin thuốc",
    });
  }
});

// API: Cập nhật vật tư

app.put("/api/vattu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tenvattu, loaivattu, donvitinh, soluong, giatien } = req.body;

    // Input validation
    if (!tenvattu || !loaivattu || !donvitinh || !soluong || !giatien) {
      console.log("Missing fields in request body:", req.body);
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Check if medicine exists
    const checkResult = await pool
      .request()
      .input("id", sql.VarChar(10), id)
      .query("SELECT MaVatTu FROM VatTuYTe WHERE MaVatTu = @id");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thuốc với mã ${id}`,
      });
    }

    // Update medicine
    await pool
      .request()
      .input("id", sql.VarChar(10), id)
      .input("tenvattu", sql.NVarChar(100), tenvattu)
      .input("loaivattu", sql.NVarChar(255), loaivattu)
      .input("donvitinh", sql.NVarChar(50), donvitinh)
      .input("soluong", sql.Int, Number(soluong))
      .input("giatien", sql.Decimal(18, 2), Number(giatien)).query(`
                UPDATE VatTuYTe 
                SET TenVatTu = @tenvattu,
                    LoaiVatTu = @loaivattu,
                    DonViTinh = @donvitinh,
                    SoLuong = @soluong,
                    GiaTien = @giatien
                WHERE MaVatTu = @id
            `);

    res.status(200).json({
      success: true,
      message: "Cập nhật thuốc thành công",
      data: {
        id,
        name: tenvattu,
        phone: loaivattu,
        description: donvitinh,
        quantity: soluong,
        price: giatien,
      },
    });
  } catch (err) {
    console.error("Error updating medicine:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật thuốc: " + err.message,
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// API: Lấy danh sách thuốc
app.get("/api/hoadonchitiet", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM HoaDonChiTiet ORDER BY MaChiTiet DESC");
    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu thuốc:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu từ database: " + err.message,
    });
  }
});

// API thêm hóa đơn chi tiết
app.post("/api/hoadonchitiet", async (req, res) => {
  const { MaHoaDon, TenDichVu, SoLuong, DonGia } = req.body;
  try {
    await pool
      .request()
      .input("MaHoaDon", MaHoaDon)
      .input("TenDichVu", TenDichVu)
      .input("SoLuong", SoLuong)
      .input("DonGia", DonGia)
      .query(
        "INSERT INTO HoaDonChiTiet (MaHoaDon, TenDichVu, SoLuong, DonGia) VALUES (@MaHoaDon, @TenDichVu, @SoLuong, @DonGia)"
      );

    res
      .status(201)
      .json({ success: true, message: "Thêm hóa đơn chi tiết thành công!" });
  } catch (err) {
    console.error("❌ Lỗi thêm hóa đơn chi tiết:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi thêm hóa đơn chi tiết: " + err.message,
      });
  }
});

// API sửa hóa đơn chi tiết
app.put("/api/hoadonchitiet/:id", async (req, res) => {
  const { id } = req.params;
  const { TenDichVu, SoLuong, DonGia } = req.body;
  try {
    await pool
      .request()
      .input("MaChiTiet", id)
      .input("TenDichVu", TenDichVu)
      .input("SoLuong", SoLuong)
      .input("DonGia", DonGia)
      .query(
        "UPDATE HoaDonChiTiet SET TenDichVu = @TenDichVu, SoLuong = @SoLuong, DonGia = @DonGia WHERE MaChiTiet = @MaChiTiet"
      );

    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật hóa đơn chi tiết thành công!",
      });
  } catch (err) {
    console.error("❌ Lỗi sửa hóa đơn chi tiết:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi sửa hóa đơn chi tiết: " + err.message,
      });
  }
});

// API xóa hóa đơn chi tiết
app.delete("/api/hoadonchitiet/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool
      .request()
      .input("MaChiTiet", id)
      .query("DELETE FROM HoaDonChiTiet WHERE MaChiTiet = @MaChiTiet");

    res
      .status(200)
      .json({ success: true, message: "Xóa hóa đơn chi tiết thành công!" });
  } catch (err) {
    console.error("❌ Lỗi xóa hóa đơn chi tiết:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi xóa hóa đơn chi tiết: " + err.message,
      });
  }
});

// API lấy danh sách ThanhToan với phân trang
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

    // Thực hiện truy vấn
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
  const paymentId = req.params.paymentId; // Lấy paymentId từ tham số URL

  try {
    // Truy vấn cơ sở dữ liệu để lấy thanh toán với paymentId
    const query = `SELECT * FROM ThanhToan WHERE id = @paymentId`;

    // Thực hiện truy vấn
    const result = await pool
      .request()
      .input("paymentId", sql.Int, paymentId) // Dùng SQL Injection bảo vệ
      .query(query);

    // Kiểm tra nếu có kết quả
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

app.put("/api/ChiTietThanhToan/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  const { paymentMethod, transactionId, status, cccd, paymentDate } = req.body;

  try {
    // Kiểm tra xem có tồn tại thông tin thanh toán với paymentId không
    const result = await pool
      .request()
      .input("id", paymentId)
      .query("SELECT * FROM ThanhToan WHERE id = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin thanh toán với paymentId này!",
      });
    }

    // Chuyển status từ chuỗi sang số nếu cần
    const statusInt = parseInt(status, 10);

    // Kiểm tra nếu không có paymentDate và status = 1, gán thời gian hiện tại
    let updatedPaymentDate = null;
    if (!paymentDate || paymentDate.trim() === "") {
      if (statusInt === 1) {
        // Lấy thời gian hiện tại với định dạng "YYYY-MM-DD HH:mm:ss"
        updatedPaymentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
      } else {
        updatedPaymentDate = null;
      }
    } else if(paymentDate && statusInt === 1){
      // Chuyển đổi paymentDate từ định dạng "DD/MM/YYYY HH:mm:ss" sang "YYYY-MM-DD HH:mm:ss"
      const dateParts = paymentDate.split(" ");
      const date = dateParts[0].split("/"); // [DD, MM, YYYY]
      const time = dateParts[1]; // HH:mm:ss
    
      // Chuyển thành định dạng "YYYY-MM-DD HH:mm:ss"
      updatedPaymentDate = `${date[2]}-${date[1]}-${date[0]} ${time}`;
    }

    // Cập nhật thông tin thanh toán
    const updateResult = await pool
      .request()
      .input("paymentMethod", paymentMethod)
      .input("transactionId", transactionId)
      .input("status", statusInt) // Dùng status là số nguyên
      .input("cccd", cccd)
      .input("paymentDate", updatedPaymentDate)
      .input("id", paymentId)
      .query(`
        UPDATE ThanhToan
        SET paymentMethod = @paymentMethod,
            transactionId = @transactionId,
            status = @status,
            cccd = @cccd,
            paymentDate = @paymentDate
        WHERE id = @id
      `);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thanh toán với paymentId này!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Thông tin thanh toán đã được cập nhật thành công!",
    });
  } catch (err) {
    console.error("❌ Lỗi cập nhật thanh toán:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật thanh toán: " + err.message,
    });
  }
});


