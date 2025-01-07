CREATE TABLE Thuoc (
    ID NVARCHAR(10) PRIMARY KEY,  -- Mã thuốc, khóa chính
    TenThuoc NVARCHAR(100) NOT NULL,  -- Tên thuốc, bắt buộc
    SDT NVARCHAR(15),              -- Số điện thoại liên hệ (nếu có)
    MoTa NVARCHAR(MAX),            -- Mô tả thuốc
    SoLuong INT NOT NULL,          -- Số lượng tồn kho, bắt buộc
    GiaThuoc DECIMAL(18, 2) NOT NULL -- Giá thuốc, bắt buộc
);

CREATE TABLE DonThuoc (
    MaDonThuoc INT PRIMARY KEY IDENTITY(1,1), -- Mã đơn thuốc
    MaThuoc NVARCHAR(10) NOT NULL, -- Mã thuốc (FOREIGN KEY nếu có bảng Thuoc)
    MaHoSo INT NOT NULL, -- Mã hồ sơ bệnh nhân (FOREIGN KEY nếu có bảng HoSo)
    SoLuongDonThuoc INT NOT NULL, -- Số lượng thuốc
    HuongDanSuDung NVARCHAR(MAX) NOT NULL, -- Hướng dẫn sử dụng thuốc
    DaNhapHoaDon INT NOT NULL DEFAULT 0 -- 0: chưa nhập hóa đơn, 1: đã nhập hóa đơn
);
go

CREATE TABLE XetNghiem (
    MaXetNghiem INT PRIMARY KEY IDENTITY(1,1), -- Mã xét nghiệm
    MaHoSo INT NOT NULL, -- Mã hồ sơ bệnh nhân (FOREIGN KEY nếu có bảng HoSo)
    TenXetNghiem NVARCHAR(100) NOT NULL, -- Tên xét nghiệm
    KetQua NVARCHAR(MAX) NOT NULL, -- Kết quả xét nghiệm
    NgayXetNghiem DATE NOT NULL, -- Ngày xét nghiệm
    DaNhapHoaDon INT NOT NULL DEFAULT 0 -- 0: chưa nhập hóa đơn, 1: đã nhập hóa đơn
);
go



-- Thêm dữ liệu mẫu vào bảng Đơn Thuốc
INSERT INTO DonThuoc (MaThuoc, MaHoSo, SoLuongDonThuoc, HuongDanSuDung, DaNhapHoaDon)
VALUES 
('T001', 1, 2, N'Sử dụng 2 lần mỗi ngày sau bữa ăn', 0),
('T002', 2, 1, N'Uống 1 viên trước khi ngủ', 1),
('T003', 3, 5, N'Dùng mỗi 6 giờ', 0);

-- Thêm dữ liệu mẫu vào bảng Xét Nghiệm
INSERT INTO XetNghiem (MaHoSo, TenXetNghiem, KetQua, NgayXetNghiem, DaNhapHoaDon)
VALUES 
(1, N'Xét nghiệm máu', N'Bình thường', '2025-01-01', 0),
(2, N'Chụp X-quang', N'Tổn thương phổi', '2025-01-02', 1),
(3, N'Siêu âm', N'Không có dấu hiệu bất thường', '2025-01-03', 0);

SELECT *
            FROM DonThuoc AS DT
            LEFT JOIN Thuoc AS T ON DT.MaThuoc = T.ID
            LEFT JOIN HoSoBenhAn AS HS ON DT.MaHoSo = HS.ID
            LEFT JOIN BenhNhan AS BN ON HS.MaBenhNhan = BN.MaBenhNhan
            ORDER BY DT.MaDonThuoc DESC

CREATE TABLE Thuoc (
    ID NVARCHAR(10) PRIMARY KEY,  -- Mã thuốc, khóa chính
    TenThuoc NVARCHAR(100) NOT NULL,  -- Tên thuốc, bắt buộc
    SDT NVARCHAR(15),              -- Số điện thoại liên hệ (nếu có)
    MoTa NVARCHAR(255),            -- Mô tả thuốc
    SoLuong INT NOT NULL,          -- Số lượng tồn kho, bắt buộc
    GiaThuoc DECIMAL(18, 2) NOT NULL -- Giá thuốc, bắt buộc
);