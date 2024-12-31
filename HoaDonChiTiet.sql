create database QuanLyBenhVien
-- Tạo bảng Bệnh nhân
CREATE TABLE BenhNhan (
    MaBenhNhan INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    Tuoi INT NOT NULL,
    GioiTinh NVARCHAR(10) NOT NULL,
    DiaChi NVARCHAR(255) NOT NULL,
    SoDienThoai NVARCHAR(15) NOT NULL,
    CMND_CCCD NVARCHAR(20) NOT NULL
);

-- Tạo bảng Hồ sơ bệnh án
CREATE TABLE HoSoBenhAn (
    MaHoSo INT IDENTITY(1,1) PRIMARY KEY,
    MaBenhNhan INT FOREIGN KEY REFERENCES BenhNhan(MaBenhNhan),
    TienSuBenhLy NVARCHAR(MAX),
    KetQuaKham NVARCHAR(MAX),
    KeHoachDieuTri NVARCHAR(MAX),
    LichSuDieuTri NVARCHAR(MAX)
);

-- Tạo bảng Lịch khám
CREATE TABLE LichKham (
    MaLichKham INT IDENTITY(1,1) PRIMARY KEY,
    MaBenhNhan INT FOREIGN KEY REFERENCES BenhNhan(MaBenhNhan),
    MaBacSi INT,
    NgayKham DATE NOT NULL,
    GioKham TIME NOT NULL,
    TrangThai NVARCHAR(50) NOT NULL
);

-- Tạo bảng Bác sĩ
CREATE TABLE BacSi (
    MaBacSi INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    ChuyenMon NVARCHAR(100) NOT NULL,
    PhongKham NVARCHAR(100) NOT NULL
);

-- Tạo bảng Phiếu khám bệnh
CREATE TABLE PhieuKhamBenh (
    MaPhieuKham INT IDENTITY(1,1) PRIMARY KEY,
    MaLichKham INT FOREIGN KEY REFERENCES LichKham(MaLichKham),
    KetQuaKham NVARCHAR(MAX),
    ChiDinhXetNghiem NVARCHAR(MAX)
);

-- Tạo bảng Viện phí
CREATE TABLE VienPhi (
    MaHoaDon INT IDENTITY(1,1) PRIMARY KEY,
    MaBenhNhan INT FOREIGN KEY REFERENCES BenhNhan(MaBenhNhan),
    TongTien DECIMAL(18,2) NOT NULL,
    TinhTrang NVARCHAR(50) NOT NULL,
    NgayThanhToan DATE
);

-- Tạo bảng Bảo hiểm
CREATE TABLE BaoHiem (
    MaBaoHiem INT IDENTITY(1,1) PRIMARY KEY,
    MaBenhNhan INT FOREIGN KEY REFERENCES BenhNhan(MaBenhNhan),
    MaTheBHYT NVARCHAR(50) NOT NULL,
    ThoiHan DATE NOT NULL,
    NoiDangKy NVARCHAR(255) NOT NULL
);

-- Tạo bảng Thanh toán bảo hiểm
CREATE TABLE ThanhToanBaoHiem (
    MaThanhToan INT IDENTITY(1,1) PRIMARY KEY,
    MaBaoHiem INT FOREIGN KEY REFERENCES BaoHiem(MaBaoHiem),
    ChiPhiBaoHiemChiTra DECIMAL(18,2) NOT NULL,
    NgayYeuCau DATE NOT NULL
);

-- Tạo bảng Báo cáo tài chính
CREATE TABLE BaoCaoTaiChinh (
    MaBaoCao INT IDENTITY(1,1) PRIMARY KEY,
    NgayBaoCao DATE NOT NULL,
    NoiDung NVARCHAR(MAX),
    TongThu DECIMAL(18,2),
    TongChi DECIMAL(18,2)
);

-- Cập nhật bảng Lịch khám: Liên kết với bảng Bác sĩ
ALTER TABLE LichKham
ADD CONSTRAINT FK_LichKham_BacSi FOREIGN KEY (MaBacSi) REFERENCES BacSi(MaBacSi);

-- Cập nhật bảng Hồ sơ bệnh án: Liên kết với bảng Bệnh nhân
ALTER TABLE HoSoBenhAn
ADD CONSTRAINT FK_HoSoBenhAn_BenhNhan FOREIGN KEY (MaBenhNhan) REFERENCES BenhNhan(MaBenhNhan);

-- Cập nhật bảng Phiếu khám bệnh: Liên kết với bảng Lịch khám
ALTER TABLE PhieuKhamBenh
ADD CONSTRAINT FK_PhieuKhamBenh_LichKham FOREIGN KEY (MaLichKham) REFERENCES LichKham(MaLichKham);

-- Cập nhật bảng Viện phí: Liên kết với bảng Bệnh nhân
ALTER TABLE VienPhi
ADD CONSTRAINT FK_VienPhi_BenhNhan FOREIGN KEY (MaBenhNhan) REFERENCES BenhNhan(MaBenhNhan);

-- Cập nhật bảng Bảo hiểm: Liên kết với bảng Bệnh nhân
ALTER TABLE BaoHiem
ADD CONSTRAINT FK_BaoHiem_BenhNhan FOREIGN KEY (MaBenhNhan) REFERENCES BenhNhan(MaBenhNhan);

-- Cập nhật bảng Thanh toán bảo hiểm: Liên kết với bảng Bảo hiểm
ALTER TABLE ThanhToanBaoHiem
ADD CONSTRAINT FK_ThanhToanBaoHiem_BaoHiem FOREIGN KEY (MaBaoHiem) REFERENCES BaoHiem(MaBaoHiem);

create table VatTuYTe (
MaVatTu VarChar(10) primary key,
TenVatTu nvarchar(100) not null,
LoaiVatTu NVARCHAR(255) NOT NULL,
DonViTinh NVARCHAR(50) NOT NULL,
SoLuong INT NOT NULL,
GiaTien DECIMAL(18,2) NOT NULL
)

--------Them vật tư --------------
create procedure ThemVatTu
@MaVatTu VarChar(10), 
@TenVatTu nvarchar(100),
@LoaiVatTu nvarchar(255),
@DonViTinh nvarchar(50),
@SoLuong int,
@GiaTien Decimal(18,2)
as
begin 
    insert into VatTuYTe(MaVatTu, TenVatTu, LoaiVatTu, DonViTinh, SoLuong, GiaTien)
    values (@MaVatTu, @TenVatTu, @LoaiVatTu, @DonViTinh, @SoLuong, @GiaTien);
end;




---------- xóa Vật tư ----------------
create procedure XoaVatTu
@MaVatTu VarChar(10) 
as
begin 
delete from VatTuYTe 
 Where MaVatTu = @MaVatTu;
end;

----------- Sửa Vật tư ------------------
create procedure SuaVatTu
@MaVatTu VarChar(10),
@TenVatTu nvarchar(100),
@LoaiVatTu nvarchar(255),
@DonViTinh nvarchar(50),
@SoLuong int ,
@GiaTien Decimal(18,2)
as
begin 
Update VatTuYTe
set   
TenVatTu = @TenVatTu,
LoaiVatTu = @LoaiVatTu,
DonViTinh = @DonViTinh,
SoLuong = @SoLuong,
GiaTien = @GiaTien
  where MaVatTu = @MaVatTu;
end;

--------- Tìm vật tư ---------------

create procedure TimVatTu
 @key nvarchar(250)

 as 
 begin 
 select * from VatTuYTe  
 where TenVatTu like '%' + @key + '%'
 or LoaiVatTu like '%' + @key + '%'
 end;

 ----------sắp xếp --------------

 CREATE PROCEDURE SapXepVatTu
    @SortBy NVARCHAR(50), -- Cột cần sắp xếp (Ví dụ: 'GiaTien' hoặc 'SoLuong')
    @SortOrder NVARCHAR(4) -- Thứ tự sắp xếp ('ASC' hoặc 'DESC')
AS
BEGIN
    DECLARE @SQL NVARCHAR(MAX);

    SET @SQL = 'SELECT * FROM VatTuYTe ORDER BY ' + @SortBy + ' ' + @SortOrder;
    EXEC sp_executesql @SQL;
END;
--------------------------------------------------
exec ThemVatTu 'VT001', 'khẩu trang', 'y tế', 'Hộp', 100, 2000.00;
exec ThemVatTu 'VT002', 'Cồn', 'y tế', 'Lọ', 100, 2000.00;
exec ThemVatTu 'VT003', 'Máy đo huyết áp', 'y tế', 'Cái', 100, 2000.00;
exec ThemVatTu 'VT004', 'Máy thở', 'y tế', 'Cái', 100, 2000.00;
exec ThemVatTu 'VT005', 'khẩu trang', 'y te', 'Hộp', 100, 2000.00;

exec ThemVatTu 'VT006', 'khau trang', 'y te', 'Hop', 100, 2000.00;
 ---------- 
select * from VatTuYTe


DROP PROCEDURE IF EXISTS SuaVatTu;

CREATE TABLE VienPhi (
    MaHoaDon INT IDENTITY(1,1) PRIMARY KEY,
    MaBenhNhan INT FOREIGN KEY REFERENCES BenhNhan(MaBenhNhan),
    TongTien DECIMAL(18,2) NOT NULL,
    TinhTrang NVARCHAR(50) NOT NULL,
    NgayThanhToan DATE
);

INSERT INTO VienPhi (MaBenhNhan, TongTien, TinhTrang, NgayThanhToan)
VALUES 
(1, 500000, N'Đã thanh toán', '2024-12-31'),
(2, 300000, N'Chưa thanh toán', NULL),
(3, 450000, N'Đã thanh toán', '2024-12-30');


--31/12/2024
CREATE TABLE HoaDonChiTiet (
    MaChiTiet INT PRIMARY KEY IDENTITY(1,1), -- Mã chi tiết (khóa chính, tự động tăng)
    MaHoaDon INT,                           -- Mã hóa đơn (khóa ngoại)
    TenDichVu NVARCHAR(100),                -- Tên thuốc/dịch vụ
    SoLuong INT,                            -- Số lượng
    DonGia DECIMAL(10, 2),                  -- Đơn giá
    ThanhTien AS (SoLuong * DonGia)         -- Thành tiền (cột tính toán)
);



-- Thêm dữ liệu vào bảng HoaDonChiTiet
INSERT INTO HoaDonChiTiet (MaHoaDon, TenDichVu, SoLuong, DonGia)
VALUES 
    (1, N'Thuốc giảm đau', 2, 50000.00),   -- 2 hộp thuốc giảm đau, giá 50,000/hộp
    (1, N'Dịch vụ xét nghiệm máu', 1, 200000.00), -- 1 lần xét nghiệm máu, giá 200,000
    (2, N'Thuốc cảm cúm', 3, 35000.00),    -- 3 hộp thuốc cảm cúm, giá 35,000/hộp
    (2, N'Tiêm phòng', 1, 150000.00);      -- 1 lần tiêm phòng, giá 150,000


