import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDBHYT.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Edit, Save, X } from 'lucide-react';


const CRUDBHYT = () => {
    const [formData, setFormData] = useState({
        MaBenhNhan: '',
        DonViCungCap: '',
        SoHopDongBaoHiem: '',
        SoTienBaoHiem: '0',
        NgayHetHanBaoHiem: '',
        TrangThaiBaoHiem: 'Còn hiệu lực'
    });

    const navigate = useNavigate();
    const location = useLocation();
    const { action, item } = location.state || {}; // Lấy action và item từ params

    useEffect(() => {
            if (action === 'edit' && item) {
                setFormData({
                    MaBenhNhan: ''+item.ID || '',
                    DonViCungCap: item.DonViCungCap || '',
                    SoHopDongBaoHiem: item.SoHopDongBaoHiem || '',
                    SoTienBaoHiem: item.SoTienBaoHiem.toString() || '0', // Chuyển thành string nếu cần
                    NgayHetHanBaoHiem: item.NgayHetHanBaoHiem || '',
                    TrangThaiBaoHiem: item.TrangThaiBaoHiem || 'Còn hiệu lực',
                });
            }
            if (action === 'add' && item) {
                 setFormData({
                     MaBenhNhan: ''+item.ID || ''
                 });
            }
    }, [action, item]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const validateForm = () => {
        if (!formData.MaBenhNhan) {
            setError('Vui lòng nhập mã bệnh nhân');
            return false;
        }
        if (!formData.DonViCungCap) {
            setError('Vui lòng nhập đơn vị cung cấp');
            return false;
        }
        if (!formData.SoTienBaoHiem) {
            setError('Vui lòng nhập số tiền bảo hiểm');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (action === 'edit' && item) {
            try {
                if (!validateForm()) {
                    setLoading(false);
                    return;
                }

                console.log('Submitting form with data:', formData);

                const response = await fetch(`http://localhost:5000/api/baohiemyte/${item.MaBaoHiem}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        MaBenhNhan: formData.MaBenhNhan,
                        DonViCungCap: formData.DonViCungCap,
                        SoHopDongBaoHiem: formData.SoHopDongBaoHiem,
                        SoTienBaoHiem: Number(formData.SoTienBaoHiem),
                        NgayHetHanBaoHiem: formData.NgayHetHanBaoHiem,
                        TrangThaiBaoHiem: formData.TrangThaiBaoHiem
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Có lỗi xảy ra khi thêm BHYT');
                }

                toast.success('🎉 Sửa Bảo Hiểm Y Tế thành công!');
            } catch (error) {
                console.error('Error in form submission:', error);
                toast.error(`Lỗi: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
        if (action === 'add' && item) {
            try {
                if (!validateForm()) {
                    setLoading(false);
                    return;
                }

                console.log('Submitting form with data:', formData);

                const response = await fetch('http://localhost:5000/api/baohiemyte', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        MaBenhNhan: formData.MaBenhNhan,
                        DonViCungCap: formData.DonViCungCap,
                        SoHopDongBaoHiem: formData.SoHopDongBaoHiem,
                        SoTienBaoHiem: Number(formData.SoTienBaoHiem),
                        NgayHetHanBaoHiem: formData.NgayHetHanBaoHiem,
                        TrangThaiBaoHiem: formData.TrangThaiBaoHiem
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Có lỗi xảy ra khi thêm BHYT');
                }

                toast.success('🎉 Thêm Bảo Hiểm Y Tế thành công!');
                setFormData({
                    MaBenhNhan: '',
                    DonViCungCap: '',
                    SoHopDongBaoHiem: '',
                    SoTienBaoHiem: '',
                    NgayHetHanBaoHiem: '',
                    TrangThaiBaoHiem: ''
                });
            } catch (error) {
                console.error('Error in form submission:', error);
                toast.error(`Lỗi: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

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
                    <ChevronLeft />
                    </button>
                    <div>
                        <Search1 />
                    </div>
                </div>

                <div className="form-container">
                    <div className="card-header">
                        <h2  style={{color: "#000"}}  className="card-title">Thêm Bảo Hiểm Y Tế</h2>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="insurance-form">
                        <div className="form-group">
                            <label style={{color: "#000"}}  >Mã bệnh nhân <span className="required">*</span></label>
                            <input
                                type="text"
                                name="MaBenhNhan"
                                placeholder="Nhập mã bệnh nhân"
                                value={formData.MaBenhNhan}
                                onChange={handleChange}
                                className="form-control"
                                disabled
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}}  >Đơn vị cung cấp <span className="required">*</span></label>
                            <input
                                type="text"
                                name="DonViCungCap"
                                placeholder="Nhập đơn vị cung cấp"
                                value={formData.DonViCungCap}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}}  >Số hợp đồng bảo hiểm * </label>
                            <input
                                type="text"
                                name="SoHopDongBaoHiem"
                                placeholder="Nhập số hợp đồng"
                                value={formData.SoHopDongBaoHiem}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}}  >Số tiền bảo hiểm <span className="required">*</span></label>
                            <input
                                type="number"
                                name="SoTienBaoHiem"
                                placeholder="Nhập số tiền bảo hiểm"
                                value={formData.SoTienBaoHiem}
                                onChange={handleChange}
                                className="form-control"
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}}  >Ngày hết hạn bảo hiểm</label>
                            <input
                                type="date"
                                name="NgayHetHanBaoHiem"
                                value={formData.NgayHetHanBaoHiem}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}}  >Trạng thái bảo hiểm</label>
                            <select
                                name="TrangThaiBaoHiem"
                                value={formData.TrangThaiBaoHiem}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="">-- Chọn trạng thái --</option>
                                <option value="Còn hiệu lực">Còn hiệu lực</option>
                                <option value="Hết hiệu lực">Hết hiệu lực</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-button"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CRUDBHYT;
