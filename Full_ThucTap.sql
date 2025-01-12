USE [master]
GO
/****** Object:  Database [ThucTapTotNghiep]    Script Date: 1/12/2025 9:17:47 AM ******/
CREATE DATABASE [ThucTapTotNghiep]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'ThucTapTotNghiep', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\ThucTapTotNghiep.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'ThucTapTotNghiep_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\ThucTapTotNghiep_log.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [ThucTapTotNghiep] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [ThucTapTotNghiep].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [ThucTapTotNghiep] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET ARITHABORT OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [ThucTapTotNghiep] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [ThucTapTotNghiep] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET  DISABLE_BROKER 
GO
ALTER DATABASE [ThucTapTotNghiep] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [ThucTapTotNghiep] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET RECOVERY FULL 
GO
ALTER DATABASE [ThucTapTotNghiep] SET  MULTI_USER 
GO
ALTER DATABASE [ThucTapTotNghiep] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [ThucTapTotNghiep] SET DB_CHAINING OFF 
GO
ALTER DATABASE [ThucTapTotNghiep] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [ThucTapTotNghiep] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [ThucTapTotNghiep] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [ThucTapTotNghiep] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'ThucTapTotNghiep', N'ON'
GO
ALTER DATABASE [ThucTapTotNghiep] SET QUERY_STORE = ON
GO
ALTER DATABASE [ThucTapTotNghiep] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [ThucTapTotNghiep]
GO
/****** Object:  User [tt.tn]    Script Date: 1/12/2025 9:17:48 AM ******/
CREATE USER [tt.tn] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [tt]    Script Date: 1/12/2025 9:17:48 AM ******/
CREATE USER [tt] FOR LOGIN [tt] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [thuctap]    Script Date: 1/12/2025 9:17:48 AM ******/
CREATE USER [thuctap] FOR LOGIN [thuctap] WITH DEFAULT_SCHEMA=[thuctap]
GO
ALTER ROLE [db_datareader] ADD MEMBER [tt.tn]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [tt.tn]
GO
ALTER ROLE [db_datareader] ADD MEMBER [tt]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [tt]
GO
ALTER ROLE [db_owner] ADD MEMBER [thuctap]
GO
ALTER ROLE [db_datareader] ADD MEMBER [thuctap]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [thuctap]
GO
/****** Object:  Schema [thuctap]    Script Date: 1/12/2025 9:17:48 AM ******/
CREATE SCHEMA [thuctap]
GO
/****** Object:  Table [thuctap].[BacSi]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[BacSi](
	[MaBacSi] [int] IDENTITY(1,1) NOT NULL,
	[HoTen] [nvarchar](100) NOT NULL,
	[ChuyenMon] [nvarchar](100) NOT NULL,
	[PhongKham] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBacSi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[BacSiVTP]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[BacSiVTP](
	[ID] [int] NOT NULL,
	[ChuyenMon] [nvarchar](255) NULL,
	[PhongKham] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[BaoCaoTaiChinh]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[BaoCaoTaiChinh](
	[MaBaoCao] [int] IDENTITY(1,1) NOT NULL,
	[NgayBaoCao] [date] NOT NULL,
	[NoiDung] [nvarchar](max) NULL,
	[TongThu] [decimal](18, 2) NULL,
	[TongChi] [decimal](18, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBaoCao] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[BaoHiem]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[BaoHiem](
	[MaBaoHiem] [int] IDENTITY(1,1) NOT NULL,
	[MaBenhNhan] [int] NULL,
	[MaTheBHYT] [nvarchar](50) NOT NULL,
	[ThoiHan] [date] NOT NULL,
	[NoiDangKy] [nvarchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBaoHiem] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[BaoHiemYTe]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[BaoHiemYTe](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[MaBenhNhan] [nvarchar](50) NULL,
	[DonViCungCap] [nvarchar](100) NULL,
	[SoHopDongBaoHiem] [nvarchar](100) NULL,
	[SoTienBaoHiem] [decimal](18, 2) NOT NULL,
	[NgayHetHanBaoHiem] [date] NULL,
	[TrangThaiBaoHiem] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[BenhNhan]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[BenhNhan](
	[MaBenhNhan] [int] IDENTITY(1,1) NOT NULL,
	[HoTen] [nvarchar](100) NOT NULL,
	[Tuoi] [int] NOT NULL,
	[GioiTinh] [nvarchar](10) NOT NULL,
	[DiaChi] [nvarchar](255) NOT NULL,
	[SoDienThoai] [nvarchar](15) NOT NULL,
	[CMND_CCCD] [nvarchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBenhNhan] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[BenhNhanVTP]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[BenhNhanVTP](
	[ID] [int] NOT NULL,
	[DiaChi] [nvarchar](255) NULL,
	[Tuoi] [int] NULL,
	[GioiTinh] [nvarchar](10) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[ChiPhiBHYT]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[ChiPhiBHYT](
	[MaChiPhiBHYT] [nvarchar](50) NOT NULL,
	[MaSoTheBHYT] [nvarchar](50) NULL,
	[SoTienBHYTChiTra] [decimal](18, 2) NULL,
	[NgayBHYTThanhToan] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaChiPhiBHYT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[DanhMucThuoc]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[DanhMucThuoc](
	[MaDanhMuc] [nvarchar](10) NOT NULL,
	[TenDanhMuc] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDanhMuc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[DieuTri]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[DieuTri](
	[MaDieuTri] [int] IDENTITY(1,1) NOT NULL,
	[MaHoSo] [int] NULL,
	[MoTa] [nvarchar](max) NULL,
	[PhuongPhap] [nvarchar](max) NULL,
	[KetQua] [nvarchar](max) NULL,
	[NgayDieuTri] [date] NULL,
	[DaSuDung] [nvarchar](max) NULL,
	[DaNhapHoaDon] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDieuTri] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[DonThuoc]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[DonThuoc](
	[MaDonThuoc] [int] IDENTITY(1,1) NOT NULL,
	[MaThuoc] [nvarchar](10) NOT NULL,
	[MaHoSo] [int] NOT NULL,
	[SoLuongDonThuoc] [int] NOT NULL,
	[HuongDanSuDung] [nvarchar](max) NOT NULL,
	[DaNhapHoaDon] [int] NOT NULL,
	[NgayNhapHangCuaDonThuoc] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDonThuoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[HoaDon]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[HoaDon](
	[MaHoaDon] [varchar](20) NOT NULL,
	[MaBenhNhan] [varchar](20) NOT NULL,
	[MaBacSi] [varchar](20) NOT NULL,
	[TongTien] [decimal](18, 2) NOT NULL,
	[NgayNhapHoaDon] [datetime] NOT NULL,
	[TrangThai] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaHoaDon] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[HoaDonChiTiet]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[HoaDonChiTiet](
	[MaChiTiet] [int] IDENTITY(1,1) NOT NULL,
	[MaHoaDon] [int] NULL,
	[TenDichVu] [nvarchar](100) NULL,
	[SoLuong] [int] NULL,
	[DonGia] [decimal](10, 2) NULL,
	[ThanhTien]  AS ([SoLuong]*[DonGia]),
	[NgayNhapHoaDonChiTiet] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaChiTiet] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[HoSoBenhAn]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[HoSoBenhAn](
	[MaBenhNhan] [nvarchar](50) NOT NULL,
	[HoVaTen] [nvarchar](255) NOT NULL,
	[NgaySinh] [date] NOT NULL,
	[Tuoi] [int] NOT NULL,
	[GioiTinh] [nvarchar](10) NULL,
	[DanToc] [nvarchar](50) NULL,
	[DiaChiCuTru] [nvarchar](255) NULL,
	[ThonPho] [nvarchar](100) NULL,
	[XaPhuong] [nvarchar](100) NULL,
	[Huyen] [nvarchar](100) NULL,
	[TinhThanhPho] [nvarchar](100) NULL,
	[SoTheBHYT] [nvarchar](20) NULL,
	[SoCCCD_HoChieu] [nvarchar](50) NULL,
	[VaoVien] [date] NOT NULL,
	[RaVien] [date] NULL,
	[ChanDoanVaoVien] [nvarchar](255) NULL,
	[ChanDoanRaVien] [nvarchar](255) NULL,
	[LyDoVaoVien] [nvarchar](255) NULL,
	[TomTatBenhLy] [nvarchar](max) NULL,
	[MaLichHen] [nvarchar](50) NULL,
	[HanhDong] [nvarchar](255) NULL,
	[ID] [int] IDENTITY(1,1) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBenhNhan] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[KiemTraDangNhap]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[KiemTraDangNhap](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[DangDangNhap] [int] NULL,
	[ThoiGianDangNhap] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[LichKham]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[LichKham](
	[MaLichKham] [int] IDENTITY(1,1) NOT NULL,
	[MaBenhNhan] [int] NULL,
	[MaBacSi] [int] NULL,
	[NgayKham] [date] NOT NULL,
	[GioKham] [time](7) NOT NULL,
	[TrangThai] [nvarchar](50) NOT NULL,
	[PhongKham] [nvarchar](50) NULL,
	[MaLichHen] [nvarchar](50) NULL,
	[MaBenhNhanKhamBenh] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaLichKham] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[NguoiDung]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[NguoiDung](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Hinh] [nvarchar](255) NULL,
	[TenDayDu] [nvarchar](100) NOT NULL,
	[Email] [nvarchar](100) NOT NULL,
	[SDT] [nvarchar](15) NULL,
	[CCCD] [nvarchar](15) NULL,
	[NgayTao] [datetime] NULL,
	[VaiTro] [nvarchar](50) NULL,
	[MatKhau] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[PhieuKhamBenh]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[PhieuKhamBenh](
	[MaPhieuKham] [int] IDENTITY(1,1) NOT NULL,
	[MaLichKham] [int] NULL,
	[KetQuaKham] [nvarchar](max) NULL,
	[ChiDinhXetNghiem] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaPhieuKham] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[testTB]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[testTB](
	[ID] [int] NOT NULL,
	[Name] [varchar](100) NULL,
	[Age] [int] NULL,
	[Email] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[ThanhToan]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[ThanhToan](
	[id] [nvarchar](50) NOT NULL,
	[invoiceId] [nvarchar](50) NULL,
	[paymentMethod] [int] NULL,
	[patientId] [nvarchar](50) NULL,
	[amount] [decimal](18, 2) NULL,
	[paymentDate] [datetime] NULL,
	[paymentCreateDate] [datetime] NULL,
	[transactionId] [nvarchar](50) NULL,
	[status] [int] NULL,
	[cccd] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[ThanhToanBaoHiem]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[ThanhToanBaoHiem](
	[MaThanhToan] [int] IDENTITY(1,1) NOT NULL,
	[MaBaoHiem] [int] NULL,
	[ChiPhiBaoHiemChiTra] [decimal](18, 2) NOT NULL,
	[NgayYeuCau] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaThanhToan] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[Thuoc]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[Thuoc](
	[ID] [nvarchar](10) NOT NULL,
	[TenThuoc] [nvarchar](100) NOT NULL,
	[SDT] [nvarchar](15) NULL,
	[MoTa] [nvarchar](255) NULL,
	[SoLuong] [int] NOT NULL,
	[GiaThuoc] [decimal](18, 2) NOT NULL,
	[MaDanhMuc] [nvarchar](10) NULL,
	[NgayNhapHangCuaThuoc] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[TongHopThongTin]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[TongHopThongTin](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Ngay] [date] NULL,
	[SoLuongBenhNhan] [int] NULL,
	[SoLuongBacSi] [int] NULL,
	[SoLuongHoaDon] [int] NULL,
	[DoanhThu] [decimal](18, 2) NULL,
	[ChiPhiBHYT] [decimal](18, 2) NULL,
	[SoLuongXetNghiem] [int] NULL,
	[SoLuongDieuTri] [int] NULL,
	[SoLuongVatTuYTe] [int] NULL,
	[SoLuongHoaDonChiTiet] [int] NULL,
	[SoLuongThuoc] [int] NULL,
	[SoLuongDonThuoc] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[TongHopThongTinKhac]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[TongHopThongTinKhac](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[KhamMoi] [int] NULL,
	[TaiKham] [int] NULL,
	[CapCuu] [int] NULL,
	[TheoDoi] [int] NULL,
	[ChuyenVien] [int] NULL,
	[DieuTriNgoaiTru] [int] NULL,
	[XuatVien] [int] NULL,
	[NhapVien] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[VatTuYTe]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[VatTuYTe](
	[MaVatTu] [varchar](10) NOT NULL,
	[TenVatTu] [nvarchar](100) NOT NULL,
	[LoaiVatTu] [nvarchar](255) NOT NULL,
	[DonViTinh] [nvarchar](50) NOT NULL,
	[SoLuong] [int] NOT NULL,
	[GiaTien] [decimal](18, 2) NOT NULL,
	[NgayNhapHang] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaVatTu] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[VienPhi]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[VienPhi](
	[MaHoaDon] [int] IDENTITY(1,1) NOT NULL,
	[MaBenhNhan] [nvarchar](50) NULL,
	[MaBacSi] [nvarchar](50) NULL,
	[MaHoSo] [nvarchar](50) NULL,
	[TongTien] [decimal](18, 2) NOT NULL,
	[TinhTrang] [nvarchar](50) NOT NULL,
	[NgayLapHoaDon] [date] NULL,
	[NgayThanhToan] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaHoaDon] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [thuctap].[XetNghiem]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [thuctap].[XetNghiem](
	[MaXetNghiem] [int] IDENTITY(1,1) NOT NULL,
	[MaHoSo] [int] NOT NULL,
	[TenXetNghiem] [nvarchar](100) NOT NULL,
	[KetQua] [nvarchar](max) NOT NULL,
	[NgayXetNghiem] [date] NOT NULL,
	[DaNhapHoaDon] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaXetNghiem] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [thuctap].[ChiPhiBHYT] ADD  DEFAULT (getdate()) FOR [NgayBHYTThanhToan]
GO
ALTER TABLE [thuctap].[DieuTri] ADD  DEFAULT (getdate()) FOR [NgayDieuTri]
GO
ALTER TABLE [thuctap].[DieuTri] ADD  DEFAULT ((0)) FOR [DaNhapHoaDon]
GO
ALTER TABLE [thuctap].[DonThuoc] ADD  DEFAULT ((0)) FOR [DaNhapHoaDon]
GO
ALTER TABLE [thuctap].[DonThuoc] ADD  DEFAULT (getdate()) FOR [NgayNhapHangCuaDonThuoc]
GO
ALTER TABLE [thuctap].[HoaDonChiTiet] ADD  DEFAULT (getdate()) FOR [NgayNhapHoaDonChiTiet]
GO
ALTER TABLE [thuctap].[KiemTraDangNhap] ADD  DEFAULT (getdate()) FOR [ThoiGianDangNhap]
GO
ALTER TABLE [thuctap].[NguoiDung] ADD  DEFAULT (getdate()) FOR [NgayTao]
GO
ALTER TABLE [thuctap].[NguoiDung] ADD  DEFAULT ('12345') FOR [MatKhau]
GO
ALTER TABLE [thuctap].[ThanhToan] ADD  DEFAULT (getdate()) FOR [paymentDate]
GO
ALTER TABLE [thuctap].[ThanhToan] ADD  DEFAULT (getdate()) FOR [paymentCreateDate]
GO
ALTER TABLE [thuctap].[Thuoc] ADD  DEFAULT (getdate()) FOR [NgayNhapHangCuaThuoc]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [SoLuongBenhNhan]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [SoLuongBacSi]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [SoLuongHoaDon]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [DoanhThu]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [ChiPhiBHYT]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [SoLuongXetNghiem]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [SoLuongDieuTri]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [SoLuongVatTuYTe]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [SoLuongHoaDonChiTiet]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [SoLuongThuoc]
GO
ALTER TABLE [thuctap].[TongHopThongTin] ADD  DEFAULT ((0)) FOR [SoLuongDonThuoc]
GO
ALTER TABLE [thuctap].[TongHopThongTinKhac] ADD  DEFAULT ((0)) FOR [KhamMoi]
GO
ALTER TABLE [thuctap].[TongHopThongTinKhac] ADD  DEFAULT ((0)) FOR [TaiKham]
GO
ALTER TABLE [thuctap].[TongHopThongTinKhac] ADD  DEFAULT ((0)) FOR [CapCuu]
GO
ALTER TABLE [thuctap].[TongHopThongTinKhac] ADD  DEFAULT ((0)) FOR [TheoDoi]
GO
ALTER TABLE [thuctap].[TongHopThongTinKhac] ADD  DEFAULT ((0)) FOR [ChuyenVien]
GO
ALTER TABLE [thuctap].[TongHopThongTinKhac] ADD  DEFAULT ((0)) FOR [DieuTriNgoaiTru]
GO
ALTER TABLE [thuctap].[TongHopThongTinKhac] ADD  DEFAULT ((0)) FOR [XuatVien]
GO
ALTER TABLE [thuctap].[TongHopThongTinKhac] ADD  DEFAULT ((0)) FOR [NhapVien]
GO
ALTER TABLE [thuctap].[VatTuYTe] ADD  DEFAULT (getdate()) FOR [NgayNhapHang]
GO
ALTER TABLE [thuctap].[VienPhi] ADD  DEFAULT (getdate()) FOR [NgayLapHoaDon]
GO
ALTER TABLE [thuctap].[VienPhi] ADD  DEFAULT (getdate()) FOR [NgayThanhToan]
GO
ALTER TABLE [thuctap].[XetNghiem] ADD  DEFAULT ((0)) FOR [DaNhapHoaDon]
GO
ALTER TABLE [thuctap].[BacSiVTP]  WITH CHECK ADD FOREIGN KEY([ID])
REFERENCES [thuctap].[NguoiDung] ([ID])
GO
ALTER TABLE [thuctap].[BaoHiem]  WITH CHECK ADD FOREIGN KEY([MaBenhNhan])
REFERENCES [thuctap].[BenhNhan] ([MaBenhNhan])
GO
ALTER TABLE [thuctap].[BaoHiem]  WITH CHECK ADD  CONSTRAINT [FK_BaoHiem_BenhNhan] FOREIGN KEY([MaBenhNhan])
REFERENCES [thuctap].[BenhNhan] ([MaBenhNhan])
GO
ALTER TABLE [thuctap].[BaoHiem] CHECK CONSTRAINT [FK_BaoHiem_BenhNhan]
GO
ALTER TABLE [thuctap].[BenhNhanVTP]  WITH CHECK ADD FOREIGN KEY([ID])
REFERENCES [thuctap].[NguoiDung] ([ID])
GO
ALTER TABLE [thuctap].[ThanhToanBaoHiem]  WITH CHECK ADD FOREIGN KEY([MaBaoHiem])
REFERENCES [thuctap].[BaoHiem] ([MaBaoHiem])
GO
ALTER TABLE [thuctap].[ThanhToanBaoHiem]  WITH CHECK ADD  CONSTRAINT [FK_ThanhToanBaoHiem_BaoHiem] FOREIGN KEY([MaBaoHiem])
REFERENCES [thuctap].[BaoHiem] ([MaBaoHiem])
GO
ALTER TABLE [thuctap].[ThanhToanBaoHiem] CHECK CONSTRAINT [FK_ThanhToanBaoHiem_BaoHiem]
GO
/****** Object:  StoredProcedure [thuctap].[SapXepVatTu]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 CREATE PROCEDURE [thuctap].[SapXepVatTu]
    @SortBy NVARCHAR(50), -- Cột cần sắp xếp (Ví dụ: 'GiaTien' hoặc 'SoLuong')
    @SortOrder NVARCHAR(4) -- Thứ tự sắp xếp ('ASC' hoặc 'DESC')
AS
BEGIN
    DECLARE @SQL NVARCHAR(MAX);

    SET @SQL = 'SELECT * FROM VatTuYTe ORDER BY ' + @SortBy + ' ' + @SortOrder;
    EXEC sp_executesql @SQL;
END;
GO
/****** Object:  StoredProcedure [thuctap].[SuaVatTu]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create procedure [thuctap].[SuaVatTu]
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
GiaTien = @GiaTien,
NgayNhapHang = GETDATE()
  where MaVatTu = @MaVatTu;
end;
GO
/****** Object:  StoredProcedure [thuctap].[Them]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create procedure [thuctap].[Them]
@TenVatTu nvarchar(100),
@LoaiVatTu nvarchar(255),
@DonViTinh nvarchar(50),
@SoLuong int ,
@GiaTien Decimal(18,2)
as
begin 
insert into VatTuYTe(TenVatTu,LoaiVatTu,DonViTinh,SoLuong,GiaTien)
values (@TenVatTu,@LoaiVatTu, @DonViTinh, @SoLuong,@GiaTien);
end;
GO
/****** Object:  StoredProcedure [thuctap].[ThemVatTu]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create procedure [thuctap].[ThemVatTu]
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
GO
/****** Object:  StoredProcedure [thuctap].[TimVatTu]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create procedure [thuctap].[TimVatTu]
 @key nvarchar(250)

 as 
 begin 
 select * from VatTuYTe  
 where TenVatTu like '%' + @key + '%'
 or LoaiVatTu like '%' + @key + '%'
 end;
GO
/****** Object:  StoredProcedure [thuctap].[XoaVatTu]    Script Date: 1/12/2025 9:17:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
---------- xóa Vật tư ----------------
create procedure [thuctap].[XoaVatTu]
@MaVatTu VarChar(10) 
as
begin 
delete from VatTuYTe 
 Where MaVatTu = @MaVatTu;
end;
GO
USE [master]
GO
ALTER DATABASE [ThucTapTotNghiep] SET  READ_WRITE 
GO
