import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDThuoc.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';
import { useNavigate, useLocation } from 'react-router-dom';


const CRUDTraCuuVaNhapHoaDonChiTiet = () => {
     const { state } = useLocation();
         const navigate = useNavigate();
     const { MaHoaDon, action, item } = state || {};

    const [quantity, setQuantity] = useState(1); // Mặc định số lượng là 1
    const [price, setPrice] = useState(item.GiaThuoc || 1); // Giá mặc định từ item.MaThuoc nếu có
    const [thanhTien, setThanhTien] = useState(quantity * price); // Thành tiền


     const [TenDichVu, setTenDichVu] = useState('');
     const [SoLuong, setSoLuong] = useState('');
     const [DonGia, setDonGia] = useState('');

     const [actionURL, setActionURL] = useState('');
     const [actionIDURL, setActionIDURL] = useState('');

    useEffect(() => {
        setThanhTien(quantity * price);
    }, [quantity, price]);

    useEffect(() => {
        setDonGia(item.DonGia);

        setQuantity(item.SoLuong);

        if (action === 'prescriptions' && item) {
            setTenDichVu(item.TenThuoc);
            setPrice(item.GiaThuoc);
            setQuantity(item.SoLuongDonThuoc);
            setActionURL('donthuocnhapHD');
            setActionIDURL(item.MaDonThuoc);
        }
        else if (action === 'tests' && item){
            setTenDichVu(item.TenXetNghiem);
            setPrice(1);
            setQuantity(1);
            setActionURL('xetnghiemnhapHD');
            setActionIDURL(item.MaXetNghiem);
        }
        else if (action === 'history' && item){
            setTenDichVu(item.MoTa);
            setPrice(1);
            setQuantity(1);
            setActionURL('dieutrinhapHD');
            setActionIDURL(item.MaDieuTri);
        }


    }, [action,item]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra dữ liệu hợp lệ
        if (quantity <= 0 || price <= 0) {
            toast.error("Số lượng và giá phải lớn hơn 0!");
            return;
        }

        if (!MaHoaDon) {
            toast.error("Thông tin hóa đơn không đầy đủ!");
            return;
        }

        const body = {
            MaHoaDon: MaHoaDon,  // Sử dụng item.MaHoaDon nếu có
            TenDichVu: TenDichVu, // Dùng tên thuốc hoặc tên xét nghiệm
            SoLuong: quantity,
            DonGia: price, // Giá đơn vị

        };

        try {
            const response = await fetch('http://localhost:5000/api/hoadonchitiet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const body2 = {
                 DaNhapHoaDon: 1,  // Sử dụng item.MaHoaDon nếu có
            };

            const result = await response.json();
            if (result.success) {
                toast.success('Thêm hóa đơn chi tiết thành công!');
                const tenThongBao = "Thông báo: Thêm hóa đơn có 'Mã hóa đơn: "+body?.MaHoaDon +" - TenDichVu : "+ body?.TenDichVu +"' thành công!";
                const loaiThongBao = "Hóa đơn chi tiết";
                const chucNang = "Thêm dữ liệu";

                themThongBao(tenThongBao, loaiThongBao, chucNang, body);

                // Sau khi thêm hóa đơn chi tiết, cập nhật trạng thái DaNhapHoaDon
                try {
                    const updateResponse = await fetch(`http://localhost:5000/api/${actionURL}/${actionIDURL}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body2),
                    });

                    // Kiểm tra xem response có thành công không
                    if (!updateResponse.ok) {
                        const errorData = await updateResponse.json(); // Đọc dữ liệu lỗi từ server nếu có
                        toast.error(`Lỗi: ${errorData.message || 'Không rõ'}`);
                        return;
                    }

                    const updateResult = await updateResponse.json();
                    if (updateResult.success) {
                        toast.success('Cập nhật DaNhapHoaDon thành công!');
                    } else {
                        toast.error(updateResult.message || 'Có lỗi xảy ra khi cập nhật!');
                    }
                } catch (error) {
                    console.error('Lỗi khi gọi API:', error);
                    toast.error('Có lỗi xảy ra, vui lòng thử lại!');
                }

            } else {
                toast.error('Thêm hóa đơn chi tiết thất bại!');
            }
        } catch (error) {
            console.error('Lỗi khi thêm hóa đơn chi tiết:', error);
            toast.error('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

        const themThongBao = async (name, type, feature, data ) => {
          if (!name || !type || !feature) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
          }

          const notification = { Name: name, Loai: type, ChucNang: feature, Data: data };

          try {
                  const response = await fetch("http://localhost:5000/api/thongbao", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(notification),
                  });

                  const result = await response.json();
                  if (response.ok) {
                      //window.location.reload(true);
                  } else {
                      alert(result.message);
                  }
              } catch (error) {
                console.error("Lỗi khi thêm thông báo:", error);
                alert("Có lỗi xảy ra!");
              }
     }




    return (
        <div className="container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <Menu1 />
            <main className="main-content">
            <div
                className="content-chuyendoi"
                style={{
                    borderRadius: "10px",
                    marginBottom: "10px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width:"100%" }}>
                    <button  style={{
                                marginTop: "-20px",
                                marginLeft: "30px",
                                padding: "10px 20px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                height: "50px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                    onClick={() => navigate(-1)}
                    >
                   <i class="fa-solid fa-right-from-bracket fa-rotate-180 fa-lg"></i>
                    </button>
                    <div>
                        <Search1 />
                    </div>
                </div>
                <div className="content-chuyendoi">
                    <div className="card-header">
                        <h2 className="card-title">Thêm hóa đơn chi tiết {item.MoTa}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="medicine-form">
                        <label>Mã hóa đơn: {MaHoaDon}<span className="required">*</span></label>

                        <label>Tên thuốc/dịch vụ: {TenDichVu}<span className="required">*</span></label>

                        <div className="form-group">
                        <label>Số lượng: <span className="required"></span></label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                                required
                            />

                        </div>

                        <div className="form-group">
                            <label>Giá: <span className="required"></span></label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min="1"
                                    required
                                />

                        </div>

                        <div className="form-group">
                            <label>Thành tiền: {thanhTien.toLocaleString('vi-VN')} VND<span className="required">*</span></label>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-button"
                                disabled={quantity <= 0 || price <= 0 || !MaHoaDon}
                            >
                                Nhập dữ liệu
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CRUDTraCuuVaNhapHoaDonChiTiet;
