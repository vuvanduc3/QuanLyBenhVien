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

// // Validate code format
// if (!code.match(/^T\d{3}$/)) {
//     return res.status(400).json({
//         success: false,
//         message: "Mã thuốc không đúng định dạng (phải là T và 3 số)",
//     });
// }


// API: Xóa người dùng
app.delete("/api/nguoidung/:id", async (req, res) => {
    const { id } = req.params;

    const transaction = new sql.Transaction(pool);

    try {
        console.log("ID để xóa:", id);

        // Kiểm tra ID tồn tại trong cơ sở dữ liệu
        const checkUser = await pool
            .request()
            .input("ID", sql.Int, id)
            .query(`SELECT 1 AS UserExists FROM NguoiDung WHERE ID = @ID`);

        if (checkUser.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tồn tại.",
            });
        }

        // Bắt đầu giao dịch
        await transaction.begin();

        // Xóa thông tin liên quan từ bảng phụ thuộc
        await transaction.request()
            .input("ID", sql.Int, id)
            .query(`
                DELETE FROM BenhNhanVTP WHERE ID = @ID;
            `);

        await transaction.request()
            .input("ID", sql.Int, id)
            .query(`
                DELETE FROM BacSiVTP WHERE ID = @ID;
            `);

        // Xóa người dùng từ bảng chính
        const result = await transaction.request()
            .input("ID", sql.Int, id)
            .query(`
                DELETE FROM NguoiDung WHERE ID = @ID;
            `);

        // Commit giao dịch nếu mọi thứ thành công
        await transaction.commit();

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({
                success: true,
                message: "Người dùng đã được xóa thành công.",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Không thể xóa người dùng.",
            });
        }
    } catch (err) {
        console.error("❌ Lỗi khi xóa người dùng:", err.message);

        // Rollback giao dịch nếu có lỗi
        if (transaction._acquiredConnection) {
            await transaction.rollback();
        }

        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi xóa người dùng: " + err.message,
        });
    }
});




// // Insert new medicine
// const insertResult = await pool
//     .request()
//     .input("code", sql.VarChar(10), code)
//     .input("name", sql.NVarChar(100), name)
//     .input("phone", sql.VarChar(15), phone || null)
//     .input("description", sql.NVarChar(255), description || null)
//     .input("quantity", sql.Int, Number(quantity))
//     .input("price", sql.Decimal(18, 2), Number(price)).query(`
//         DELETE FROM NguoiDung
//         WHERE ID = @ID;
//     `);

// } else {
//     res.status(404).json({
//         success: false,
//         message: "Mã thuốc đã tồn tại trong hệ thống",
//     });
// }

// res.status(500).json({
//     success: false,
//     message: "Lỗi khi xóa hồ sơ bệnh án: " + err.message,
// });




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
// API: Lấy danh sách thuốc (kèm thông tin danh mục)
app.get("/api/thuoc", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT t.*, d.TenDanhMuc 
            FROM Thuoc t
            LEFT JOIN DanhMucThuoc d ON t.MaDanhMuc = d.MaDanhMuc
            ORDER BY t.ID DESC
        `);
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

// API: Thêm thuốc mới
app.post("/api/thuoc", async (req, res) => {
    try {
        const { code, name, phone, description, quantity, price, maDanhMuc } = req.body;

        // Validate input
        if (!code || !name || !quantity || !price || !maDanhMuc) {
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

        // Kiểm tra danh mục tồn tại
        const categoryCheck = await pool
            .request()
            .input("maDanhMuc", sql.NVarChar(10), maDanhMuc)
            .query("SELECT MaDanhMuc FROM DanhMucThuoc WHERE MaDanhMuc = @maDanhMuc");

        if (categoryCheck.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Danh mục thuốc không tồn tại",
            });
        }

        // Kiểm tra mã thuốc đã tồn tại
        const checkResult = await pool
            .request()
            .input("code", sql.NVarChar(10), code)
            .query("SELECT ID FROM Thuoc WHERE ID = @code");

        if (checkResult.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Mã thuốc ${code} đã tồn tại trong hệ thống`,
            });
        }

        // Thêm thuốc mới
        const insertResult = await pool
            .request()
            .input("code", sql.NVarChar(10), code)
            .input("name", sql.NVarChar(100), name)
            .input("phone", sql.NVarChar(15), phone || null)
            .input("description", sql.NVarChar(255), description || null)
            .input("quantity", sql.Int, Number(quantity))
            .input("price", sql.Decimal(18, 2), Number(price))
            .input("maDanhMuc", sql.NVarChar(10), maDanhMuc)
            .query(`
                INSERT INTO Thuoc (ID, TenThuoc, SDT, MoTa, SoLuong, GiaThuoc, MaDanhMuc)
                VALUES (@code, @name, @phone, @description, @quantity, @price, @maDanhMuc)
            `);

        res.status(201).json({
            success: true,
            message: "Thêm thuốc thành công",
            data: { code, name, phone, description, quantity, price, maDanhMuc },
        });
    } catch (err) {
        console.error("Error adding medicine:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi thêm thuốc: " + err.message,
        });
    }
});

// API: Cập nhật thuốc
app.put("/api/thuoc/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, description, quantity, price, maDanhMuc } = req.body;

        // Validate input
        if (!name || !quantity || !price || !maDanhMuc) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin bắt buộc",
            });
        }

        // Kiểm tra danh mục tồn tại
        const categoryCheck = await pool
            .request()
            .input("maDanhMuc", sql.NVarChar(10), maDanhMuc)
            .query("SELECT MaDanhMuc FROM DanhMucThuoc WHERE MaDanhMuc = @maDanhMuc");

        if (categoryCheck.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Danh mục thuốc không tồn tại",
            });
        }

        // Kiểm tra thuốc tồn tại
        const checkResult = await pool
            .request()
            .input("id", sql.NVarChar(10), id)
            .query("SELECT ID FROM Thuoc WHERE ID = @id");

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy thuốc với mã ${id}`,
            });
        }

        // Cập nhật thuốc
        await pool
            .request()
            .input("id", sql.NVarChar(10), id)
            .input("name", sql.NVarChar(100), name)
            .input("phone", sql.NVarChar(15), phone || null)
            .input("description", sql.NVarChar(255), description || null)
            .input("quantity", sql.Int, Number(quantity))
            .input("price", sql.Decimal(18, 2), Number(price))
            .input("maDanhMuc", sql.NVarChar(10), maDanhMuc)
            .query(`
                UPDATE Thuoc 
                SET TenThuoc = @name,
                    SDT = @phone,
                    MoTa = @description,
                    SoLuong = @quantity,
                    GiaThuoc = @price,
                    MaDanhMuc = @maDanhMuc
                WHERE ID = @id
            `);

        res.status(200).json({
            success: true,
            message: "Cập nhật thuốc thành công",
            data: { id, name, phone, description, quantity, price, maDanhMuc },
        });
    } catch (err) {
        console.error("Error updating medicine:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật thuốc: " + err.message,
        });
    }
});

// API: Xóa thuốc
app.delete("/api/thuoc/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra thuốc tồn tại
        const checkResult = await pool
            .request()
            .input("id", sql.NVarChar(10), id)
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
            .input("id", sql.NVarChar(10), id)
            .query("DELETE FROM Thuoc WHERE ID = @id");

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

// API: Lấy chi tiết thuốc theo ID
app.get("/api/thuoc/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool
            .request()
            .input("id", sql.NVarChar(10), id)
            .query(`
                SELECT t.*, d.TenDanhMuc 
                FROM Thuoc t
                LEFT JOIN DanhMucThuoc d ON t.MaDanhMuc = d.MaDanhMuc
                WHERE t.ID = @id
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

// GET: Lấy danh sách danh mục thuốc
app.get("/api/danhmucthuoc", async (req, res) => {
    try {
        const result = await pool
            .request()
            .query("SELECT * FROM DanhMucThuoc ORDER BY MaDanhMuc");

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error getting categories:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách danh mục: " + err.message
        });
    }
});

// GET: Lấy chi tiết một danh mục thuốc
app.get("/api/danhmucthuoc/:id", async (req, res) => {
    try {
        const result = await pool
            .request()
            .input('MaDanhMuc', sql.NVarChar(10), req.params.id)
            .query("SELECT * FROM DanhMucThuoc WHERE MaDanhMuc = @MaDanhMuc");

        if (result.recordset.length > 0) {
            res.json({
                success: true,
                data: result.recordset[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục thuốc"
            });
        }
    } catch (err) {
        console.error("Error getting category:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin danh mục: " + err.message
        });
    }
});

// POST: Thêm danh mục thuốc mới
app.post("/api/danhmucthuoc", async (req, res) => {
    try {
        const { MaDanhMuc, TenDanhMuc } = req.body;

        // Validate input
        if (!MaDanhMuc || !TenDanhMuc) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ mã và tên danh mục"
            });
        }

        // Validate MaDanhMuc format (DM + 3 số)
        if (!MaDanhMuc.match(/^DM\d{3}$/)) {
            return res.status(400).json({
                success: false,
                message: "Mã danh mục không đúng định dạng (phải là DM và 3 số)"
            });
        }

        // Kiểm tra mã danh mục đã tồn tại
        const checkResult = await pool
            .request()
            .input("MaDanhMuc", sql.NVarChar(10), MaDanhMuc)
            .query("SELECT MaDanhMuc FROM DanhMucThuoc WHERE MaDanhMuc = @MaDanhMuc");

        if (checkResult.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Mã danh mục ${MaDanhMuc} đã tồn tại trong hệ thống`
            });
        }

        // Thêm danh mục mới
        await pool
            .request()
            .input("MaDanhMuc", sql.NVarChar(10), MaDanhMuc)
            .input("TenDanhMuc", sql.NVarChar(100), TenDanhMuc)
            .query(`
                INSERT INTO DanhMucThuoc (MaDanhMuc, TenDanhMuc)
                VALUES (@MaDanhMuc, @TenDanhMuc)
            `);

        res.status(201).json({
            success: true,
            message: "Thêm danh mục thuốc thành công",
            data: { MaDanhMuc, TenDanhMuc }
        });
    } catch (err) {
        console.error("Error adding category:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi thêm danh mục: " + err.message
        });
    }
});

// PUT: Cập nhật danh mục thuốc
app.put("/api/danhmucthuoc/:id", async (req, res) => {
    try {
        const { TenDanhMuc } = req.body;
        const MaDanhMuc = req.params.id;

        // Validate input
        if (!TenDanhMuc) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền tên danh mục"
            });
        }

        // Kiểm tra danh mục tồn tại
        const checkResult = await pool
            .request()
            .input("MaDanhMuc", sql.NVarChar(10), MaDanhMuc)
            .query("SELECT MaDanhMuc FROM DanhMucThuoc WHERE MaDanhMuc = @MaDanhMuc");

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục thuốc"
            });
        }

        // Cập nhật danh mục
        await pool
            .request()
            .input("MaDanhMuc", sql.NVarChar(10), MaDanhMuc)
            .input("TenDanhMuc", sql.NVarChar(100), TenDanhMuc)
            .query(`
                UPDATE DanhMucThuoc 
                SET TenDanhMuc = @TenDanhMuc 
                WHERE MaDanhMuc = @MaDanhMuc
            `);

        res.json({
            success: true,
            message: "Cập nhật danh mục thuốc thành công",
            data: { MaDanhMuc, TenDanhMuc }
        });
    } catch (err) {
        console.error("Error updating category:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật danh mục: " + err.message
        });
    }
});

// DELETE: Xóa danh mục thuốc
app.delete("/api/danhmucthuoc/:id", async (req, res) => {
    try {
        const MaDanhMuc = req.params.id;

        // Kiểm tra danh mục có đang được sử dụng
        const checkUsageResult = await pool
            .request()
            .input("MaDanhMuc", sql.NVarChar(10), MaDanhMuc)
            .query("SELECT TOP 1 ID FROM Thuoc WHERE MaDanhMuc = @MaDanhMuc");

        if (checkUsageResult.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa danh mục đang có thuốc"
            });
        }

        // Xóa danh mục
        const deleteResult = await pool
            .request()
            .input("MaDanhMuc", sql.NVarChar(10), MaDanhMuc)
            .query("DELETE FROM DanhMucThuoc WHERE MaDanhMuc = @MaDanhMuc");

        if (deleteResult.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục thuốc"
            });
        }

        res.json({
            success: true,
            message: "Xóa danh mục thuốc thành công"
        });
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa danh mục: " + err.message
        });
    }
});

//-----------------------//
// API: Lấy mã bệnh nhân tiếp theo
app.get("/api/medical-records/next-patient-code",   async (req, res) => {
    try {
        const result = await pool
            .request()
            .query("SELECT TOP 1 MaBenhNhan FROM HoSoBenhAn ORDER BY MaBenhNhan DESC");

        let nextCode = "BN001"; // Mã mặc định nếu không có dữ liệu

        if (result.recordset && result.recordset.length > 0) {
            const lastCode = result.recordset[0].MaBenhNhan;
            if (lastCode && lastCode.startsWith("BN")) {
                const numPart = parseInt(lastCode.substring(2));
                if (!isNaN(numPart)) {
                    nextCode = `BN${String(numPart + 1).padStart(3, "0")}`;
                }
            }
        }

        res.status(200).json({
            success: true,
            nextCode: nextCode
        });
    } catch (err) {
        console.error("Error generating next patient code:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo mã bệnh nhân mới"
        });
    }
});

// API: Lấy mã lịch hẹn tiếp theo
app.get("/api/medical-records/next-appointment-code",   async (req, res) => {
    try {
        const result = await pool
            .request()
            .query("SELECT TOP 1 MaLichHen FROM HoSoBenhAn ORDER BY MaLichHen DESC");

        let nextCode = "LH001"; // Mã mặc định nếu không có dữ liệu

        if (result.recordset && result.recordset.length > 0) {
            const lastCode = result.recordset[0].MaLichHen;
            if (lastCode && lastCode.startsWith("LH")) {
                const numPart = parseInt(lastCode.substring(2));
                if (!isNaN(numPart)) {
                    nextCode = `LH${String(numPart + 1).padStart(3, "0")}`;
                }
            }
        }

        res.status(200).json({
            success: true,
            nextCode: nextCode
        });
    } catch (err) {
        console.error("Error generating next appointment code:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo mã lịch hẹn mới"
        });
    }
});

// API: Lấy danh sách tất cả hồ sơ bệnh án với phân trang và tìm kiếm
app.get("/api/medical-records",   async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            searchTerm = '',
            sortBy = 'VaoVien',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // Xây dựng câu query với điều kiện tìm kiếm
        let query = `
            SELECT *
            FROM HoSoBenhAn
            WHERE 
                MaBenhNhan LIKE @searchTerm OR
                HoVaTen LIKE @searchTerm OR
                SoTheBHYT LIKE @searchTerm OR
                SoCCCD_HoChieu LIKE @searchTerm
            ORDER BY ${sortBy} ${sortOrder}
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY;

            SELECT COUNT(*) as totalCount
            FROM HoSoBenhAn
            WHERE 
                MaBenhNhan LIKE @searchTerm OR
                HoVaTen LIKE @searchTerm OR
                SoTheBHYT LIKE @searchTerm OR
                SoCCCD_HoChieu LIKE @searchTerm;
        `;

        const result = await pool
            .request()
            .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, parseInt(limit))
            .query(query);

        const records = result.recordsets[0];
        const totalCount = result.recordsets[1][0].totalCount;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            data: records,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRecords: totalCount,
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error("Error fetching medical records:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách hồ sơ bệnh án: " + err.message
        });
    }
});

// API: Lấy chi tiết hồ sơ bệnh án theo mã bệnh nhân
app.get("/api/medical-records/:maBenhNhan",   async (req, res) => {
    try {
        const { maBenhNhan } = req.params;

        const result = await pool
            .request()
            .input("maBenhNhan", sql.NVarChar(50), maBenhNhan)
            .query("SELECT * FROM HoSoBenhAn WHERE MaBenhNhan = @maBenhNhan");

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hồ sơ bệnh án"
            });
        }

        res.status(200).json({
            success: true,
            data: result.recordset[0]
        });
    } catch (err) {
        console.error("Error fetching medical record:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thông tin hồ sơ bệnh án: " + err.message
        });
    }
});

// API: Tạo mới hồ sơ bệnh án
app.post("/api/medical-records",   async (req, res) => {
    try {
        const {
            maBenhNhan,
            hoVaTen,
            ngaySinh,
            tuoi,
            gioiTinh,
            danToc,
            diaChiCuTru,
            thonPho,
            xaPhuong,
            huyen,
            tinhThanhPho,
            soTheBHYT,
            soCCCD_HoChieu,
            vaoVien,
            raVien,
            chanDoanVaoVien,
            chanDoanRaVien,
            lyDoVaoVien,
            tomTatBenhLy,
            maLichHen,
            hanhDong
        } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!maBenhNhan || !hoVaTen || !ngaySinh || !tuoi || !gioiTinh || !vaoVien) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin bắt buộc"
            });
        }

        // Kiểm tra giới tính hợp lệ
        if (!['Nam', 'Nữ'].includes(gioiTinh)) {
            return res.status(400).json({
                success: false,
                message: "Giới tính không hợp lệ. Chỉ chấp nhận 'Nam' hoặc 'Nữ'"
            });
        }

        // Kiểm tra mã bệnh nhân đã tồn tại
        const checkExisting = await pool
            .request()
            .input("maBenhNhan", sql.NVarChar(50), maBenhNhan)
            .query("SELECT MaBenhNhan FROM HoSoBenhAn WHERE MaBenhNhan = @maBenhNhan");

        if (checkExisting.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Mã bệnh nhân đã tồn tại"
            });
        }

        // Thêm mới hồ sơ bệnh án
        const result = await pool
            .request()
            .input("maBenhNhan", sql.NVarChar(50), maBenhNhan)
            .input("hoVaTen", sql.NVarChar(255), hoVaTen)
            .input("ngaySinh", sql.Date, new Date(ngaySinh))
            .input("tuoi", sql.Int, tuoi)
            .input("gioiTinh", sql.NVarChar(10), gioiTinh)
            .input("danToc", sql.NVarChar(50), danToc)
            .input("diaChiCuTru", sql.NVarChar(255), diaChiCuTru)
            .input("thonPho", sql.NVarChar(100), thonPho)
            .input("xaPhuong", sql.NVarChar(100), xaPhuong)
            .input("huyen", sql.NVarChar(100), huyen)
            .input("tinhThanhPho", sql.NVarChar(100), tinhThanhPho)
            .input("soTheBHYT", sql.NVarChar(20), soTheBHYT)
            .input("soCCCD_HoChieu", sql.NVarChar(50), soCCCD_HoChieu)
            .input("vaoVien", sql.Date, new Date(vaoVien))
            .input("raVien", sql.Date, raVien ? new Date(raVien) : null)
            .input("chanDoanVaoVien", sql.NVarChar(255), chanDoanVaoVien)
            .input("chanDoanRaVien", sql.NVarChar(255), chanDoanRaVien)
            .input("lyDoVaoVien", sql.NVarChar(255), lyDoVaoVien)
            .input("tomTatBenhLy", sql.NVarChar(sql.MAX), tomTatBenhLy)
            .input("maLichHen", sql.NVarChar(50), maLichHen)
            .input("hanhDong", sql.NVarChar(255), hanhDong)
            .query(`
                INSERT INTO HoSoBenhAn (
                    MaBenhNhan, HoVaTen, NgaySinh, Tuoi, GioiTinh, DanToc,
                    DiaChiCuTru, ThonPho, XaPhuong, Huyen, TinhThanhPho,
                    SoTheBHYT, SoCCCD_HoChieu, VaoVien, RaVien,
                    ChanDoanVaoVien, ChanDoanRaVien, LyDoVaoVien,
                    TomTatBenhLy, MaLichHen, HanhDong
                )
                VALUES (
                    @maBenhNhan, @hoVaTen, @ngaySinh, @tuoi, @gioiTinh, @danToc,
                    @diaChiCuTru, @thonPho, @xaPhuong, @huyen, @tinhThanhPho,
                    @soTheBHYT, @soCCCD_HoChieu, @vaoVien, @raVien,
                    @chanDoanVaoVien, @chanDoanRaVien, @lyDoVaoVien,
                    @tomTatBenhLy, @maLichHen, @hanhDong
                );

                SELECT * FROM HoSoBenhAn WHERE MaBenhNhan = @maBenhNhan;
            `);

        res.status(201).json({
            success: true,
            message: "Thêm hồ sơ bệnh án thành công",
            data: result.recordset[0]
        });
    } catch (err) {
        console.error("Error creating medical record:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm hồ sơ bệnh án: " + err.message
        });
    }
});

// API: Cập nhật hồ sơ bệnh án
app.put("/api/medical-records/:maBenhNhan",   async (req, res) => {
    try {
        const { maBenhNhan } = req.params;
        const {
            hoVaTen,
            ngaySinh,
            tuoi,
            gioiTinh,
            danToc,
            diaChiCuTru,
            thonPho,
            xaPhuong,
            huyen,
            tinhThanhPho,
            soTheBHYT,
            soCCCD_HoChieu,
            vaoVien,
            raVien,
            chanDoanVaoVien,
            chanDoanRaVien,
            lyDoVaoVien,
            tomTatBenhLy,
            maLichHen,
            hanhDong
        } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!hoVaTen || !ngaySinh || !tuoi || !gioiTinh || !vaoVien) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin bắt buộc"
            });
        }

        // Kiểm tra giới tính hợp lệ
        if (!['Nam', 'Nữ'].includes(gioiTinh)) {
            return res.status(400).json({
                success: false,
                message: "Giới tính không hợp lệ. Chỉ chấp nhận 'Nam' hoặc 'Nữ'"
            });
        }

        // Kiểm tra hồ sơ tồn tại
        const checkResult = await pool
            .request()
            .input("maBenhNhan", sql.NVarChar(50), maBenhNhan)
            .query("SELECT MaBenhNhan FROM HoSoBenhAn WHERE MaBenhNhan = @maBenhNhan");

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hồ sơ bệnh án"
            });
        }

        // Cập nhật hồ sơ bệnh án
        const result = await pool
            .request()
            .input("maBenhNhan", sql.NVarChar(50), maBenhNhan)
            .input("hoVaTen", sql.NVarChar(255), hoVaTen)
            .input("ngaySinh", sql.Date, new Date(ngaySinh))
            .input("tuoi", sql.Int, tuoi)
            .input("gioiTinh", sql.NVarChar(10), gioiTinh)
            .input("danToc", sql.NVarChar(50), danToc)
            .input("diaChiCuTru", sql.NVarChar(255), diaChiCuTru)
            .input("thonPho", sql.NVarChar(100), thonPho)
            .input("xaPhuong", sql.NVarChar(100), xaPhuong)
            .input("huyen", sql.NVarChar(100), huyen)
            .input("tinhThanhPho", sql.NVarChar(100), tinhThanhPho)
            .input("soTheBHYT", sql.NVarChar(20), soTheBHYT)
            .input("soCCCD_HoChieu", sql.NVarChar(50), soCCCD_HoChieu)
            .input("vaoVien", sql.Date, new Date(vaoVien))
            .input("raVien", sql.Date, raVien ? new Date(raVien) : null)
            .input("chanDoanVaoVien", sql.NVarChar(255), chanDoanVaoVien)
            .input("chanDoanRaVien", sql.NVarChar(255), chanDoanRaVien)
            .input("lyDoVaoVien", sql.NVarChar(255), lyDoVaoVien)
            .input("tomTatBenhLy", sql.NVarChar(sql.MAX), tomTatBenhLy)
            .input("maLichHen", sql.NVarChar(50), maLichHen)
            .input("hanhDong", sql.NVarChar(255), hanhDong)
            .query(`
                UPDATE HoSoBenhAn 
                SET HoVaTen = @hoVaTen,
                    NgaySinh = @ngaySinh,
                    Tuoi = @tuoi,
                    GioiTinh = @gioiTinh,
                    DanToc = @danToc,
                    DiaChiCuTru = @diaChiCuTru,
                    ThonPho = @thonPho,
                    XaPhuong = @xaPhuong,
                    Huyen = @huyen,
                    TinhThanhPho = @tinhThanhPho,
                    SoTheBHYT = @soTheBHYT,
                    SoCCCD_HoChieu = @soCCCD_HoChieu,
                    VaoVien = @vaoVien,
                    RaVien = @raVien,
                    ChanDoanVaoVien = @chanDoanVaoVien,
                    ChanDoanRaVien = @chanDoanRaVien,
                    LyDoVaoVien = @lyDoVaoVien,
                    TomTatBenhLy = @tomTatBenhLy,
                    MaLichHen = @maLichHen,
                    HanhDong = @hanhDong
                WHERE MaBenhNhan = @maBenhNhan;

                SELECT * FROM HoSoBenhAn WHERE MaBenhNhan = @maBenhNhan;
            `);

        res.status(200).json({
            success: true,
            message: "Cập nhật hồ sơ bệnh án thành công",
            data: result.recordset[0]
        });
    } catch (err) {
        console.error("Error updating medical record:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật hồ sơ bệnh án: " + err.message
        });
    }
});

// API: Xóa hồ sơ bệnh án
app.delete("/api/medical-records/:maBenhNhan",   async (req, res) => {
    try {
        const { maBenhNhan } = req.params;

        // Kiểm tra hồ sơ tồn tại
        const checkResult = await pool
            .request()
            .input("maBenhNhan", sql.NVarChar(50), maBenhNhan)
            .query("SELECT MaBenhNhan FROM HoSoBenhAn WHERE MaBenhNhan = @maBenhNhan");

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hồ sơ bệnh án"
            });
        }

        // Xóa hồ sơ bệnh án
        await pool
            .request()
            .input("maBenhNhan", sql.NVarChar(50), maBenhNhan)
            .query("DELETE FROM HoSoBenhAn WHERE MaBenhNhan = @maBenhNhan");

        res.status(200).json({
            success: true,
            message: "Xóa hồ sơ bệnh án thành công"
        });
    } catch (err) {
        console.error("Error deleting medical record:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa hồ sơ bệnh án: " + err.message
        });
    }
});

// API: Thống kê hồ sơ bệnh án
app.get("/api/medical-records/statistics/overview",   async (req, res) => {
    try {
        const result = await pool
            .request()
            .query(`
                SELECT
                    COUNT(*) as totalRecords,
                    COUNT(CASE WHEN RaVien IS NULL THEN 1 END) as currentInPatients,
                    COUNT(CASE WHEN RaVien IS NOT NULL THEN 1 END) as discharged,
                    COUNT(DISTINCT MaBenhNhan) as uniquePatients,
                    COUNT(DISTINCT MaLichHen) as totalAppointments
                FROM HoSoBenhAn;

                SELECT TOP 5
                    DATEPART(MONTH, VaoVien) as month,
                    DATEPART(YEAR, VaoVien) as year,
                    COUNT(*) as admissionCount
                FROM HoSoBenhAn
                WHERE VaoVien >= DATEADD(MONTH, -12, GETDATE())
                GROUP BY DATEPART(MONTH, VaoVien), DATEPART(YEAR, VaoVien)
                ORDER BY year DESC, month DESC;

                SELECT TOP 5
                    GioiTinh,
                    COUNT(*) as count,
                    AVG(CAST(Tuoi as FLOAT)) as averageAge
                FROM HoSoBenhAn
                GROUP BY GioiTinh;
            `);

        res.status(200).json({
            success: true,
            data: {
                overview: result.recordsets[0][0],
                recentAdmissions: result.recordsets[1],
                demographicStats: result.recordsets[2]
            }
        });
    } catch (err) {
        console.error("Error fetching statistics:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thống kê: " + err.message
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
                message: `Không tìm thấy vật tư với mã ${id}`,
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
            message: "Xóa vật tư thành công",
        });
    } catch (err) {
        console.error("Error deleting medicine:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa vật tư: " + err.message,
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
            message: "Lỗi khi lấy thông tin vật tư",
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
            .query("SELECT HDCT.MaChiTiet,HDCT.MaHoaDon, HDCT.TenDichVu, HDCT.SoLuong, HDCT.DonGia, HDCT.ThanhTien,VP.MaBenhNhan, VP.MaBacSi FROM HoaDonChiTiet AS HDCT LEFT JOIN VienPhi AS VP ON HDCT.MaHoaDon = VP.MaHoaDon ORDER BY MaChiTiet DESC");
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
        } else if (paymentDate && statusInt === 1) {
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

// API: Lấy danh sách đơn thuốc chi tiết
app.get("/api/donthuoc", async (req, res) => {
    try {
        // Câu truy vấn SQL kết hợp bảng DonThuoc, Thuoc và HoSoBenhAn
        const query = `
SELECT *
            FROM DonThuoc AS DT
            LEFT JOIN Thuoc AS T ON DT.MaThuoc = T.ID
            LEFT JOIN HoSoBenhAn AS HS ON DT.MaHoSo = HS.ID

            ORDER BY DT.MaDonThuoc DESC;
        `;

        // Thực hiện truy vấn SQL
        const result = await pool.request().query(query);

        // Trả về dữ liệu nếu thành công
        res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (err) {
        // Xử lý lỗi và trả về phản hồi lỗi
        console.error("❌ Lỗi lấy thông tin đơn thuốc:", err.message);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu từ database: " + err.message,
        });
    }
});

// API Thêm Đơn Thuốc (POST)
app.post("/api/donthuoc", async (req, res) => {
    const { MaThuoc, MaHoSo, SoLuongDonThuoc, HuongDanSuDung, DaNhapHoaDon } = req.body; // Lấy dữ liệu từ body

    try {
        const result = await pool
            .request()
            .input("MaThuoc", sql.NVarChar(10), MaThuoc)
            .input("MaHoSo", sql.Int, MaHoSo)
            .input("SoLuongDonThuoc", sql.Int, SoLuongDonThuoc)
            .input("HuongDanSuDung", sql.NVarChar(sql.MAX), HuongDanSuDung)
            .input("DaNhapHoaDon", sql.Int, DaNhapHoaDon)
            .query(`
                INSERT INTO DonThuoc (MaThuoc, MaHoSo, SoLuongDonThuoc, HuongDanSuDung, DaNhapHoaDon)
                VALUES (@MaThuoc, @MaHoSo, @SoLuongDonThuoc, @HuongDanSuDung, @DaNhapHoaDon)
            `);

        res.status(201).json({ success: true, message: "Thêm đơn thuốc thành công!" });
    } catch (err) {
        console.error("❌ Lỗi thêm đơn thuốc:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi thêm đơn thuốc: " + err.message });
    }
});

app.put("/api/donthuoc/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL
    const { MaThuoc, MaHoSo, SoLuongDonThuoc, HuongDanSuDung, DaNhapHoaDon } = req.body; // Thêm TrangThai từ body

    try {
        const result = await pool
            .request()
            .input("MaDonThuoc", sql.Int, id)
            .input("MaThuoc", sql.NVarChar(10), MaThuoc)
            .input("MaHoSo", sql.Int, MaHoSo)
            .input("SoLuongDonThuoc", sql.Int, SoLuongDonThuoc)
            .input("HuongDanSuDung", sql.NVarChar(sql.MAX), HuongDanSuDung)
            .input("DaNhapHoaDon", sql.Int, DaNhapHoaDon) // Nhận thêm giá trị TrangThai
            .query(`
                UPDATE DonThuoc
                SET MaThuoc = @MaThuoc,
                    MaHoSo = @MaHoSo,
                    SoLuongDonThuoc = @SoLuongDonThuoc,
                    HuongDanSuDung = @HuongDanSuDung,
                    DaNhapHoaDon = @DaNhapHoaDon -- Cập nhật cột mới
                WHERE MaDonThuoc = @MaDonThuoc
            `);

        res.status(200).json({ success: true, message: "Cập nhật đơn thuốc thành công!" });
    } catch (err) {
        console.error("❌ Lỗi sửa đơn thuốc:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi sửa đơn thuốc: " + err.message });
    }
});

// GET: Lấy danh sách hóa đơn
app.get("/api/invoices", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM HoaDon ORDER BY NgayNhapHoaDon DESC");

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách hóa đơn"
    });
  }
});

// GET: Lấy chi tiết hóa đơn
app.get("/api/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool
      .request()
      .input("id", sql.VarChar(20), id)
      .query("SELECT * FROM HoaDon WHERE MaHoaDon = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn"
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin hóa đơn"
    });
  }
});

// POST: Thêm hóa đơn mới
app.post("/api/invoices", async (req, res) => {
  try {
    const { MaHoaDon, MaBenhNhan, MaBacSi, TongTien, TrangThai } = req.body;

    // Check if invoice exists
    const checkResult = await pool
      .request()
      .input("MaHoaDon", sql.VarChar(20), MaHoaDon)
      .query("SELECT MaHoaDon FROM HoaDon WHERE MaHoaDon = @MaHoaDon");

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Mã hóa đơn đã tồn tại"
      });
    }

    await pool
      .request()
      .input("MaHoaDon", sql.VarChar(20), MaHoaDon)
      .input("MaBenhNhan", sql.VarChar(20), MaBenhNhan)
      .input("MaBacSi", sql.VarChar(20), MaBacSi)
      .input("TongTien", sql.Decimal(18, 2), TongTien)
      .input("NgayNhapHoaDon", sql.DateTime, new Date())
      .input("TrangThai", sql.NVarChar(50), TrangThai)
      .query(`
        INSERT INTO HoaDon (MaHoaDon, MaBenhNhan, MaBacSi, TongTien, NgayNhapHoaDon, TrangThai)
        VALUES (@MaHoaDon, @MaBenhNhan, @MaBacSi, @TongTien, @NgayNhapHoaDon, @TrangThai)
      `);

    res.status(201).json({
      success: true,
      message: "Thêm hóa đơn thành công"
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm hóa đơn"
    });
  }
});

// PUT: Cập nhật hóa đơn
app.put("/api/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { MaBenhNhan, MaBacSi, TongTien, TrangThai } = req.body;

    // Check if invoice exists
    const checkResult = await pool
      .request()
      .input("id", sql.VarChar(20), id)
      .query("SELECT MaHoaDon FROM HoaDon WHERE MaHoaDon = @id");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn"
      });
    }

    await pool
      .request()
      .input("id", sql.VarChar(20), id)
      .input("MaBenhNhan", sql.VarChar(20), MaBenhNhan)
      .input("MaBacSi", sql.VarChar(20), MaBacSi)
      .input("TongTien", sql.Decimal(18, 2), TongTien)
      .input("TrangThai", sql.NVarChar(50), TrangThai)
      .query(`
        UPDATE HoaDon 
        SET MaBenhNhan = @MaBenhNhan,
            MaBacSi = @MaBacSi,
            TongTien = @TongTien,
            TrangThai = @TrangThai
        WHERE MaHoaDon = @id
      `);

    res.json({
      success: true,
      message: "Cập nhật hóa đơn thành công"
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật hóa đơn"
    });
  }
});

// DELETE: Xóa hóa đơn
app.delete("/api/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if invoice exists
    const checkResult = await pool
      .request()
      .input("id", sql.VarChar(20), id)
      .query("SELECT MaHoaDon FROM HoaDon WHERE MaHoaDon = @id");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn"
      });
    }

    await pool
      .request()
      .input("id", sql.VarChar(20), id)
      .query("DELETE FROM HoaDon WHERE MaHoaDon = @id");

    res.json({
      success: true,
      message: "Xóa hóa đơn thành công"
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa hóa đơn"
    });
  }
});


app.delete("/api/donthuoc/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL

    try {
        await pool
            .request()
            .input("MaDonThuoc", sql.Int, id)
            .query(`
                DELETE FROM DonThuoc WHERE MaDonThuoc = @MaDonThuoc
            `);

        res.status(200).json({ success: true, message: "Xóa đơn thuốc thành công!" });
    } catch (err) {
        console.error("❌ Lỗi xóa đơn thuốc:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi xóa đơn thuốc: " + err.message });
    }
});

// API: Lấy danh sách xét nghiệm chi tiết
app.get("/api/xetnghiem", async (req, res) => {
    try {
        // Câu truy vấn SQL kết hợp bảng XetNghiem, HoSoBenhAn, và BenhNhanVTP
        const query = `
            SELECT *
            FROM XetNghiem AS XT
            LEFT JOIN HoSoBenhAn AS HS ON XT.MaHoSo = HS.ID
            LEFT JOIN BenhNhanVTP AS BN ON BN.ID = HS.MaBenhNhan
            ORDER BY XT.MaXetNghiem DESC;
        `;

        // Thực hiện truy vấn SQL
        const result = await pool.request().query(query);

        // Trả về dữ liệu nếu thành công
        res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (err) {
        // Xử lý lỗi và trả về phản hồi lỗi
        console.error("❌ Lỗi lấy thông tin xét nghiệm:", err.message);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu từ database: " + err.message,
        });
    }
});

// API Thêm Xét Nghiệm (POST)
app.post("/api/xetnghiem", async (req, res) => {
    const { MaHoSo, TenXetNghiem, KetQua, NgayXetNghiem, DaNhapHoaDon } = req.body; // Lấy dữ liệu từ body

    try {
        const result = await pool
            .request()
            .input("MaHoSo", sql.Int, MaHoSo)
            .input("TenXetNghiem", sql.NVarChar(100), TenXetNghiem)
            .input("KetQua", sql.NVarChar(sql.MAX), KetQua)
            .input("NgayXetNghiem", sql.Date, NgayXetNghiem)
            .input("DaNhapHoaDon", sql.Bit, DaNhapHoaDon)
            .query(`
                INSERT INTO XetNghiem (MaHoSo, TenXetNghiem, KetQua, NgayXetNghiem, DaNhapHoaDon)
                VALUES (@MaHoSo, @TenXetNghiem, @KetQua, @NgayXetNghiem, @DaNhapHoaDon)
            `);

        res.status(201).json({ success: true, message: "Thêm xét nghiệm thành công!" });
    } catch (err) {
        console.error("❌ Lỗi thêm xét nghiệm:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi thêm xét nghiệm: " + err.message });
    }
});

// API Sửa Xét Nghiệm (PUT)
app.put("/api/xetnghiem/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL
    const { MaHoSo, TenXetNghiem, KetQua, NgayXetNghiem, DaNhapHoaDon } = req.body; // Lấy dữ liệu từ body

    try {
        const result = await pool
            .request()
            .input("MaXetNghiem", sql.Int, id)
            .input("MaHoSo", sql.Int, MaHoSo)
            .input("TenXetNghiem", sql.NVarChar(100), TenXetNghiem)
            .input("KetQua", sql.NVarChar(sql.MAX), KetQua)
            .input("NgayXetNghiem", sql.Date, NgayXetNghiem)
            .input("DaNhapHoaDon", sql.Bit, DaNhapHoaDon)
            .query(`
                UPDATE XetNghiem
                SET MaHoSo = @MaHoSo,
                    TenXetNghiem = @TenXetNghiem,
                    KetQua = @KetQua,
                    NgayXetNghiem = @NgayXetNghiem,
                    DaNhapHoaDon = @DaNhapHoaDon
                WHERE MaXetNghiem = @MaXetNghiem
            `);

        res.status(200).json({ success: true, message: "Cập nhật xét nghiệm thành công!" });
    } catch (err) {
        console.error("❌ Lỗi sửa xét nghiệm:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi sửa xét nghiệm: " + err.message });
    }
});

// API Xóa Xét Nghiệm (DELETE)
app.delete("/api/xetnghiem/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL

    try {
        await pool
            .request()
            .input("MaXetNghiem", sql.Int, id)
            .query(`
                DELETE FROM XetNghiem WHERE MaXetNghiem = @MaXetNghiem
            `);

        res.status(200).json({ success: true, message: "Xóa xét nghiệm thành công!" });
    } catch (err) {
        console.error("❌ Lỗi xóa xét nghiệm:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi xóa xét nghiệm: " + err.message });
    }
});

// API Sửa Đơn Thuốc (PUT)
app.put("/api/donthuocnhapHD/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL
    const {  DaNhapHoaDon } = req.body; // Lấy dữ liệu từ body

    try {
        const result = await pool
            .request()
            .input("MaDonThuoc", sql.Int, id)
            .input("DaNhapHoaDon", sql.Int, DaNhapHoaDon)
            .query(`
                UPDATE DonThuoc
                SET
                DaNhapHoaDon = @DaNhapHoaDon
                WHERE MaDonThuoc = @MaDonThuoc
            `);

        res.status(200).json({ success: true, message: "Cập nhật đơn thuốc thành công!" });
    } catch (err) {
        console.error("❌ Lỗi sửa đơn thuốc:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi sửa đơn thuốc: " + err.message });
    }
});


// API Sửa Xét Nghiệm (PUT)
app.put("/api/xetnghiemnhapHD/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL
    const {  DaNhapHoaDon } = req.body; // Lấy dữ liệu từ body

    try {
        const result = await pool
            .request()
            .input("MaXetNghiem", sql.Int, id)
            .input("DaNhapHoaDon", sql.Int, DaNhapHoaDon)
            .query(`
                UPDATE XetNghiem
                SET
                DaNhapHoaDon = @DaNhapHoaDon
                WHERE MaXetNghiem = @MaXetNghiem
            `);

        res.status(200).json({ success: true, message: "Cập nhật xét nghiệm thành công!" });
    } catch (err) {
        console.error("❌ Lỗi sửa xét nghiệm:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi sửa xét nghiệm: " + err.message });
    }
});

// Endpoint: Cập nhật tổng tiền
app.put("/api/updatetongtienvienphi", async (req, res) => {
    try {
        const result = await pool
            .request()
            .query(`
                UPDATE VP
                      SET VP.TongTien = ISNULL(CT.TongTien, 0)
                      FROM VienPhi AS VP
                      LEFT JOIN (
                          SELECT MaHoaDon, SUM(SoLuong * DonGia) AS TongTien
                          FROM HoaDonChiTiet
                          GROUP BY MaHoaDon
                      ) AS CT ON VP.MaHoaDon = CT.MaHoaDon;
            `);

        res.status(200).json({ success: true, message: "✅ Cập nhật tổng tiền thành công!" });
    } catch (err) {
        console.error("❌ Lỗi sửa tổng tiền:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi cập nhập tổng tiền: " + err.message });
    }
});

// Endpoint: Lấy dữ liệu chi tiết
app.get("/api/vienphi", async (req, res) => {
    try {
        // Câu truy vấn SQL kết hợp bảng XetNghiem, HoSoBenhAn, và BenhNhanVTP
        const query = `
           SELECT
                  *
                 FROM VienPhi AS VP
                 LEFT JOIN BenhNhanVTP AS BN ON BN.ID = VP.MaBenhNhan
                 LEFT JOIN BacSiVTP AS BS ON BS.ID = VP.MaBacSi
           	   ORDER BY VP.MaHoaDon DESC;
        `;

        // Thực hiện truy vấn SQL
        const result = await pool.request().query(query);

        // Trả về dữ liệu nếu thành công
        res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (err) {
        // Xử lý lỗi và trả về phản hồi lỗi
        console.error("❌ Lỗi lấy thông tin hóa đơn:", err.message);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu từ database: " + err.message,
        });
    }
});

//1. API Thêm Hóa Đơn (POST)
app.post("/api/vienphi", async (req, res) => {
    const { MaBenhNhan, MaBacSi, TongTien, TinhTrang, NgayLapHoaDon, NgayThanhToan } = req.body; // Lấy dữ liệu từ body

    try {
        const result = await pool
            .request()
            .input("MaBenhNhan", sql.Int, MaBenhNhan)
                  .input("MaBacSi", sql.Int, MaBacSi)
                  .input("TongTien", sql.Decimal(18, 2), TongTien)
                  .input("TinhTrang", sql.NVarChar(50), TinhTrang)
                  .input("NgayLapHoaDon", sql.Date, NgayLapHoaDon || new Date()) // Nếu không có, dùng ngày hiện tại
                  .input("NgayThanhToan", sql.Date, NgayThanhToan || new Date()) // Nếu không có, dùng ngày hiện tại
                  .query(`
                    INSERT INTO VienPhi (MaBenhNhan, MaBacSi, TongTien, TinhTrang, NgayLapHoaDon, NgayThanhToan)
                    VALUES (@MaBenhNhan, @MaBacSi, @TongTien, @TinhTrang, @NgayLapHoaDon, @NgayThanhToan);
                  `);

        res.status(201).json({ success: true, message: "Thêm xét nghiệm thành công!" });
    } catch (err) {
        console.error("❌ Lỗi thêm xét nghiệm:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi thêm xét nghiệm: " + err.message });
    }
});

 //2.API Sửa Hóa Đơn (PUT)
 app.put("/api/vienphi/:id", async (req, res) => {
   const { id } = req.params; // Lấy ID từ URL
   const { MaBenhNhan, MaBacSi, TongTien, TinhTrang, NgayLapHoaDon, NgayThanhToan } = req.body;

   try {
      const result = await pool
       .request()
       .input("MaHoaDon", sql.Int, id) // ID hóa đơn
       .input("MaBenhNhan", sql.Int, MaBenhNhan)
       .input("MaBacSi", sql.Int, MaBacSi)
       .input("TongTien", sql.Decimal(18, 2), TongTien)
       .input("TinhTrang", sql.NVarChar(50), TinhTrang)
       .input("NgayLapHoaDon", sql.Date, NgayLapHoaDon)
       .input("NgayThanhToan", sql.Date, NgayThanhToan)
       .query(`
         UPDATE VienPhi
         SET MaBenhNhan = @MaBenhNhan,
             MaBacSi = @MaBacSi,
             TongTien = @TongTien,
             TinhTrang = @TinhTrang,
             NgayLapHoaDon = @NgayLapHoaDon,
             NgayThanhToan = @NgayThanhToan
         WHERE MaHoaDon = @MaHoaDon;
       `);

     res.status(200).json({ success: true, message: "Cập nhật hóa đơn thành công!" });
   } catch (err) {
     console.error("❌ Lỗi sửa hóa đơn:", err.message);
     res.status(500).json({ success: false, message: "Lỗi khi sửa hóa đơn: " + err.message });
   }
 });

//3. API Xóa Hóa Đơn (DELETE)
app.delete("/api/vienphi/:id", async (req, res) => {
  const { id } = req.params; // Lấy ID từ URL

  try {
     const result = await pool
      .request()
      .input("MaHoaDon", sql.Int, id) // ID hóa đơn
      .query(`
        DELETE FROM VienPhi WHERE MaHoaDon = @MaHoaDon;
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Hóa đơn không tồn tại!" });
    }

    res.status(200).json({ success: true, message: "Xóa hóa đơn thành công!" });
  } catch (err) {
    console.error("❌ Lỗi xóa hóa đơn:", err.message);
    res.status(500).json({ success: false, message: "Lỗi khi xóa hóa đơn: " + err.message });
  }
});

// Endpoint: Lấy dữ liệu chi tiết
app.get("/api/LichKham", async (req, res) => {
    try {
        // Câu truy vấn SQL kết hợp bảng XetNghiem, HoSoBenhAn, và BenhNhanVTP
        const query = `
           select * from LichKham ORDER by LichKham.MaLichKham DESC;
        `;

        // Thực hiện truy vấn SQL
        const result = await pool.request().query(query);

        // Trả về dữ liệu nếu thành công
        res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (err) {
        // Xử lý lỗi và trả về phản hồi lỗi
        console.error("❌ Lỗi lấy thông tin hóa đơn:", err.message);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu từ database: " + err.message,
        });
    }
});

// Kiểm tra định dạng GioKham trước khi thực hiện truy vấn SQL
app.post("/api/LichKham", async (req, res) => {
    const { MaBenhNhan, MaBacSi, NgayKham, GioKham, TrangThai, PhongKham } = req.body;

    // Kiểm tra xem GioKham có hợp lệ không
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (!timeRegex.test(GioKham)) {
        return res.status(400).json({
            success: false,
            message: "Định dạng thời gian không hợp lệ. Định dạng hợp lệ là HH:MM:SS.",
        });
    }

    const query = `
        INSERT INTO LichKham (MaBenhNhan, MaBacSi, NgayKham, GioKham, TrangThai, PhongKham)
        VALUES (@MaBenhNhan, @MaBacSi, @NgayKham, @GioKham, @TrangThai, @PhongKham);
    `;

    try {
        // Chuyển GioKham thành đối tượng thời gian hợp lệ (Date) nếu cần
        const time = new Date('1970-01-01T' + GioKham + 'Z'); // Dùng '1970-01-01' làm ngày cố định

        await pool.request()
            .input('MaBenhNhan', sql.Int, MaBenhNhan)
            .input('MaBacSi', sql.Int, MaBacSi)
            .input('NgayKham', sql.Date, NgayKham)
            .input('GioKham', sql.Time, time)  // Truyền kiểu dữ liệu thời gian hợp lệ
            .input('TrangThai', sql.NVarChar, TrangThai)
            .input('PhongKham', sql.NVarChar, PhongKham)
            .query(query);

        res.status(201).json({
            success: true,
            message: "Lịch khám đã được thêm thành công.",
        });
    } catch (err) {
        console.error("❌ Lỗi thêm Lịch khám:", err.message);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm dữ liệu vào database: " + err.message,
        });
    }
});



// Endpoint: Xóa Lịch khám
app.delete("/api/LichKham/:id", async (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM LichKham WHERE MaLichKham = @MaLichKham;
    `;

    try {
        const result = await pool.request()
            .input('MaLichKham', sql.Int, id)
            .query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Lịch khám với ID này.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Lịch khám đã được xóa thành công.",
        });
    } catch (err) {
        console.error("❌ Lỗi xóa Lịch khám:", err.message);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa dữ liệu từ database: " + err.message,
        });
    }
});

// Endpoint: Sửa Lịch khám
app.put("/api/LichKham/:id", async (req, res) => {
    const { MaBenhNhan, MaBacSi, NgayKham, GioKham, TrangThai, PhongKham } = req.body;
    const { id } = req.params;  // Lấy MaLichKham từ URL (ví dụ: /api/LichKham/1)

    // Kiểm tra định dạng thời gian
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (!timeRegex.test(GioKham)) {
        return res.status(400).json({
            success: false,
            message: "Định dạng thời gian không hợp lệ. Định dạng hợp lệ là HH:MM:SS.",
        });
    }

    const query = `
        UPDATE LichKham
        SET
            MaBenhNhan = @MaBenhNhan,
            MaBacSi = @MaBacSi,
            NgayKham = @NgayKham,
            GioKham = @GioKham,
            TrangThai = @TrangThai,
            PhongKham = @PhongKham
        WHERE MaLichKham = @MaLichKham;
    `;

    try {
        // Chuyển GioKham thành đối tượng thời gian hợp lệ (Date) nếu cần
        const time = new Date('1970-01-01T' + GioKham + 'Z'); // Dùng '1970-01-01' làm ngày cố định

        await pool.request()
            .input('MaBenhNhan', sql.Int, MaBenhNhan)
            .input('MaBacSi', sql.Int, MaBacSi)
            .input('NgayKham', sql.Date, NgayKham)
            .input('GioKham', sql.Time, time)  // Truyền kiểu dữ liệu thời gian hợp lệ
            .input('TrangThai', sql.NVarChar, TrangThai)
            .input('PhongKham', sql.NVarChar, PhongKham)
            .input('MaLichKham', sql.Int, id)  // Thêm điều kiện WHERE theo MaLichKham
            .query(query);

        res.status(200).json({
            success: true,
            message: "Cập nhật lịch khám thành công.",
        });
    } catch (err) {
        console.error("❌ Lỗi cập nhật Lịch khám:", err.message);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật dữ liệu vào database: " + err.message,
        });
    }
});

// Endpoint: Lấy dữ liệu điều trị
app.get("/api/DieuTri", async (req, res) => {
    try {
        // Câu truy vấn SQL kết hợp bảng XetNghiem, HoSoBenhAn, và BenhNhanVTP
        const query = `
           select * from DieuTri
           LEFT JOIN HoSoBenhAn ON DieuTri.MaHoSo = HoSoBenhAn.ID
           ORDER by DieuTri.MaDieuTri DESC;
        `;

        // Thực hiện truy vấn SQL
        const result = await pool.request().query(query);

        // Trả về dữ liệu nếu thành công
        res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (err) {
        // Xử lý lỗi và trả về phản hồi lỗi
        console.error("❌ Lỗi lấy thông tin hóa đơn:", err.message);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu từ database: " + err.message,
        });
    }
});

// Thêm điều trị mới
app.post("/api/dieutri", async (req, res) => {
    const { MaHoSo, MoTa, PhuongPhap, KetQua, NgayDieuTri, DaSuDung } = req.body; // Lấy dữ liệu từ body

    try {
        const result = await pool
            .request()
            .input("MaHoSo", sql.Int, MaHoSo)
            .input("MoTa", sql.NVarChar(sql.MAX), MoTa)
            .input("PhuongPhap", sql.NVarChar(sql.MAX), PhuongPhap)
            .input("KetQua", sql.NVarChar(sql.MAX), KetQua)
            .input("NgayDieuTri", sql.Date, NgayDieuTri || new Date()) // Nếu không có, dùng ngày hiện tại
            .input("DaSuDung", sql.NVarChar(sql.MAX), DaSuDung)
            .query(`
                INSERT INTO DieuTri (MaHoSo, MoTa, PhuongPhap, KetQua, NgayDieuTri, DaSuDung)
                VALUES (@MaHoSo, @MoTa, @PhuongPhap, @KetQua, @NgayDieuTri, @DaSuDung);
            `);

        res.status(201).json({ success: true, message: "Thêm điều trị thành công!" });
    } catch (err) {
        console.error("❌ Lỗi thêm điều trị:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi thêm điều trị: " + err.message });
    }
});


// Sửa điều trị
app.put("/api/dieutri/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL
    const { MaHoSo, MoTa, PhuongPhap, KetQua, NgayDieuTri, DaSuDung } = req.body; // Lấy dữ liệu từ body

    try {
        const result = await pool
            .request()
            .input("MaHoSo", sql.Int, MaHoSo)
            .input("MoTa", sql.NVarChar(sql.MAX), MoTa)
            .input("PhuongPhap", sql.NVarChar(sql.MAX), PhuongPhap)
            .input("KetQua", sql.NVarChar(sql.MAX), KetQua)
            .input("NgayDieuTri", sql.Date, NgayDieuTri || new Date())
            .input("DaSuDung", sql.NVarChar(sql.MAX), DaSuDung)
            .input("MaDieuTri", sql.Int, id)
            .query(`
                UPDATE DieuTri
                SET MaHoSo = @MaHoSo,
                    MoTa = @MoTa,
                    PhuongPhap = @PhuongPhap,
                    KetQua = @KetQua,
                    NgayDieuTri = @NgayDieuTri,
                    DaSuDung = @DaSuDung
                WHERE MaDieuTri = @MaDieuTri;
            `);

        res.status(200).json({ success: true, message: "Cập nhật điều trị thành công!" });
    } catch (err) {
        console.error("❌ Lỗi sửa điều trị:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi sửa điều trị: " + err.message });
    }
});


// Xóa điều trị
app.delete("/api/dieutri/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL

    try {
        const result = await pool
            .request()
            .input("MaDieuTri", sql.Int, id)
            .query(`
                DELETE FROM DieuTri WHERE MaDieuTri = @MaDieuTri;
            `);

        res.status(200).json({ success: true, message: "Điều trị đã được xóa thành công!" });
    } catch (err) {
        console.error("❌ Lỗi xóa điều trị:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi xóa điều trị: " + err.message });
    }
});

// API Sửa Viện Phí Nhập Hóa Đơn
app.put("/api/dieutrinhapHD/:id", async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL
    const {  DaNhapHoaDon } = req.body; // Lấy dữ liệu từ body

    try {
        const result = await pool
            .request()
            .input("MaDieuTri", sql.Int, id)
            .input("DaNhapHoaDon", sql.Int, DaNhapHoaDon)
            .query(`
                UPDATE DieuTri
                               SET
                               DaNhapHoaDon = @DaNhapHoaDon
                               WHERE MaDieuTri = @MaDieuTri
            `);

        res.status(200).json({ success: true, message: "Cập nhật điều trị thành công!" });
    } catch (err) {
        console.error("❌ Lỗi sửa viện phí:", err.message);
        res.status(500).json({ success: false, message: "Lỗi khi sửa điều trị: " + err.message });
    }
});
