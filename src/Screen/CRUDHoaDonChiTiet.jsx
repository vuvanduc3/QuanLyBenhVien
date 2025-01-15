import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation và useNavigate
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDHoaDonChiTiet.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';
import { ChevronLeft, Edit, Save, X } from 'lucide-react';

const ThemSuaXoaHoaDonChiTiet = () => {
    const { state } = useLocation(); // Lấy dữ liệu state từ navigate
    const [formData, setFormData] = useState({
        MaChiTiet: null,
        MaHoaDon: '',
        TenDichVu: '',
        SoLuong: '',
        DonGia: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (state?.action === 'edit') {
            setFormData(state.item); // Điền dữ liệu vào form khi sửa
        }
    }, [state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.MaHoaDon) newErrors.MaHoaDon = 'Vui lòng nhập mã hóa đơn';
        if (!formData.TenDichVu) newErrors.TenDichVu = 'Vui lòng nhập tên dịch vụ';
        if (!formData.SoLuong || Number(formData.SoLuong) <= 0)
            newErrors.SoLuong = 'Số lượng phải lớn hơn 0';
        if (!formData.DonGia || Number(formData.DonGia) <= 0)
            newErrors.DonGia = 'Đơn giá phải lớn hơn 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const method = formData.MaChiTiet ? 'PUT' : 'POST';
            const url = formData.MaChiTiet
                ? `http://localhost:5000/api/hoadonchitiet/${formData.MaChiTiet}`
                : 'http://localhost:5000/api/hoadonchitiet';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    MaHoaDon: Number(formData.MaHoaDon),
                    TenDichVu: formData.TenDichVu,
                    SoLuong: Number(formData.SoLuong),
                    DonGia: Number(formData.DonGia)
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Lỗi khi xử lý dữ liệu');

            toast.success(formData.MaChiTiet ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            if(state.action === "add"){
                const tenThongBao = "Thông báo: Thêm hóa đơn có 'Mã hóa đơn: "+formData?.MaHoaDon +" - TenDichVu : "+ formData?.TenDichVu +"' thành công!";
                const loaiThongBao = "Hóa đơn chi tiết";
                const chucNang = "Thêm dữ liệu";

                themThongBao(tenThongBao, loaiThongBao, chucNang, formData);
            }
            else{
                const tenThongBao = "Thông báo: Sửa hóa đơn có 'Mã hóa đơn: "+formData?.MaHoaDon +" - TenDichVu : "+ formData?.TenDichVu +"' thành công!";
                const loaiThongBao = "Hóa đơn chi tiết";
                const chucNang = "Sửa dữ liệu";

                themThongBao(tenThongBao, loaiThongBao, chucNang, formData);
            }
            if(state?.action === "add"){
                 setFormData({
                     MaChiTiet: null,
                     MaHoaDon: '',
                     TenDichVu: '',
                     SoLuong: '',
                     DonGia: ''
                  });
            }


        } catch (error) {
            toast.error('Lỗi: ' + error.message);
        } finally {
            setLoading(false);
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
            <ToastContainer position="top-right" autoClose={3000} />
            <Menu1 />
            <main className="main-content">

                <div
                className="form-container"
                style={{
                    borderRadius: "10px",
                    marginBottom: "10px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width:"100%" }}>

                    <button  style={{
                                marginTop: "-20px",
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
                    <ChevronLeft />
                    </button>

                    <div>
                        <Search1 />
                    </div>
                </div>
                <div className="form-container">
                    <div className="card-header">
                        <h2 style={{color: "#000"}} className="card-title">{state?.action === 'edit' ? 'Sửa hóa đơn chi tiết' : 'Thêm hóa đơn chi tiết'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label style={{color: "#000"}} htmlFor="MaHoaDon">Mã hóa đơn chi tiết: <span className="required">{formData.MaChiTiet}</span></label>
                        </div>
                        <div className="form-group">
                            <label style={{color: "#000"}} htmlFor="MaHoaDon">Mã hóa đơn <span className="required">*</span></label>
                            <input
                                type="number"
                                id="MaHoaDon"
                                name="MaHoaDon"
                                placeholder="Nhập mã hóa đơn"
                                value={formData.MaHoaDon}
                                onChange={handleChange}
                                className={`form-control ${errors.MaHoaDon ? 'input-error' : ''}`}
                            />
                            {errors.MaHoaDon && <div className="error-message">{errors.MaHoaDon}</div>}
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}}  htmlFor="TenDichVu">Tên dịch vụ <span className="required">*</span></label>
                            <input
                                type="text"
                                id="TenDichVu"
                                 placeholder="Nhập tên dịch vụ"
                                name="TenDichVu"
                                value={formData.TenDichVu}
                                onChange={handleChange}
                                className={`form-control ${errors.TenDichVu ? 'input-error' : ''}`}
                            />
                            {errors.TenDichVu && <div className="error-message">{errors.TenDichVu}</div>}
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}}  htmlFor="SoLuong">Số lượng <span className="required">*</span></label>
                            <input
                                type="number"
                                id="SoLuong"
                                name="SoLuong"
                                placeholder="Nhập số lượng"
                                value={formData.SoLuong}
                                onChange={handleChange}
                                className={`form-control ${errors.SoLuong ? 'input-error' : ''}`}
                                min="1"
                            />
                            {errors.SoLuong && <div className="error-message">{errors.SoLuong}</div>}
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}}  htmlFor="DonGia">Đơn giá <span className="required">*</span></label>
                            <input
                                type="number"
                                id="DonGia"
                                name="DonGia"
                                placeholder="Nhập đơn giá"
                                value={formData.DonGia}
                                onChange={handleChange}
                                className={`form-control ${errors.DonGia ? 'input-error' : ''}`}
                                min="1"
                            />
                            {errors.DonGia && <div className="error-message">{errors.DonGia}</div>}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="add-button" disabled={loading}>
                                {loading ? 'Đang xử lý...' : state?.action === 'edit' ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </form>

                </div>
            </main>
        </div>
    );
};

export default ThemSuaXoaHoaDonChiTiet;
