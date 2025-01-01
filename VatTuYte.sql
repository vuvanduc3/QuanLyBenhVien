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
