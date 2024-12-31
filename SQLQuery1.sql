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
