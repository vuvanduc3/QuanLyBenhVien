import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDVatTu.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';
import { ChevronLeft, Edit, Save, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';


const CRUDVatTu = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        MaVatTu: '',
        TenVatTu: '',
        LoaiVatTu: '',
        DonViTinh: '',
        SoLuong: '',
        GiaTien: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Component mounted, fetching initial code...');
        fetchNextCode();
    }, []);

    const fetchNextCode = async () => {
        try {
            console.log('Fetching next code from API...');
            const response = await fetch('http://localhost:5000/api/vattu/next-code');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response:', data);

            if (data.success) {
                console.log('Setting new code:', data.nextCode);
                setFormData(prev => ({
                    ...prev,
                    MaVatTu: data.nextCode  // Cập nhật đúng thuộc tính MaVatTu
                }));
            } else {
                console.error('API returned error:', data.message);
                toast.error('Không thể lấy mã vật tư tự động: ' + data.message);
            }
        } catch (error) {
            console.error('Error in fetchNextCode:', error);
            toast.error('Lỗi khi lấy mã vật tư tự động: ' + error.message);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;  // Use 'name' to target the correct field in formData
        setFormData(prev => ({
            ...prev,
            [name]: value  // Dynamically update the corresponding field in formData
        }));
        setError(null);
    };

    const validateForm = () => {
        if (!formData.MaVatTu) {
            setError('Vui lòng nhập mã vật tư');
            return false;
        }
        if (!formData.TenVatTu) {
            setError('Vui lòng nhập tên vật tư');
            return false;
        }
        if (!formData.LoaiVatTu) {
            setError('Vui lòng nhập loại vật tư');
            return false;
        }
        if (!formData.DonViTinh) {
            setError('Vui lòng nhập đơn vị tính');
            return false;
        }
        if (!formData.SoLuong) {
            setError('Vui lòng nhập số lượng');
            return false;
        }
        if (!formData.GiaTien) {
            setError('Vui lòng nhập giá tiền');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!validateForm()) {
                setLoading(false);
                return;
            }

            console.log('Submitting form with data:', formData);

            const response = await fetch('http://localhost:5000/api/vattu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: formData.MaVatTu,
                    tenVatTu: formData.TenVatTu,
                    loaiVatTu: formData.LoaiVatTu,
                    donViTinh: formData.DonViTinh,
                    soLuong: Number(formData.SoLuong),
                    giaTien: Number(formData.GiaTien)
                })
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server không trả về dữ liệu JSON hợp lệ");
            }

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra khi thêm thuốc');
            }

            console.log('Successfully added medicine, fetching next code...');
            const nextCodeResponse = await fetch('http://localhost:5000/api/vattu/next-code');
            const nextCodeData = await nextCodeResponse.json();

            if (nextCodeData.success) {
                setFormData({
                    MaVatTu: nextCodeData.nextCode,
                    TenVatTu: '',
                    LoaiVatTu: '',
                    DonViTinh: '',
                    SoLuong: '',
                    GiaTien: ''
                });
                toast.success('🎉 Thêm thuốc thành công!');
            } else {
                throw new Error('Không thể lấy mã thuốc mới');
            }

        } catch (error) {
            console.error('Error in form submission:', error);
            toast.error(`Lỗi: ${error.message}`);
        } finally {
            setLoading(false);
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
                        <h2  style={{color: "#000"}} className="card-title">Thêm vật tư y tế</h2>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="medicine-form">
                        <div className="form-group">
                            <label style={{color: "#000"}} >Mã vật tư <span className="required">*</span></label>
                            <input
                                type="text"
                                name="MaVatTu"  // This should match formData.MaVatTu
                                value={formData.MaVatTu}
                                className="form-control"
                                required
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}} >Tên vật tư <span className="required">*</span></label>
                            <input
                                type="text"
                                name="TenVatTu"  // This should match formData.TenVatTu
                                placeholder="Nhập tên thuốc"
                                value={formData.TenVatTu}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}} >Loại vật tư</label>
                            <select
                                name="LoaiVatTu"
                                value={formData.LoaiVatTu}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                <option value="">-- Chọn loại vật tư --</option>
                                <option value="Thuốc">Thuốc</option>
                                <option value="Dụng cụ y tế">Dụng cụ y tế</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}} >Đơn vị tính</label>
                            <select
                                name="DonViTinh"
                                value={formData.DonViTinh}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                <option value="">-- Chọn đơn vị tính --</option>
                                <option value="Hộp">Hộp</option>
                                <option value="Cái">Cái</option>
                                <option value="Chiếc">Chiếc</option>
                                <option value="Lọ">Lọ</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}} >Số lượng <span className="required">*</span></label>
                            <input
                                type="number"
                                name="SoLuong"  // This should match formData.SoLuong
                                placeholder="Nhập số lượng"
                                value={formData.SoLuong}
                                onChange={handleChange}
                                className="form-control"
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{color: "#000"}} >Giá tiền <span className="required">*</span></label>
                            <input
                                type="number"
                                name="GiaTien"  // This should match formData.GiaTien
                                placeholder="Nhập giá"
                                value={formData.GiaTien}
                                onChange={handleChange}
                                className="form-control"
                                required
                                min="0"
                            />
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


export default CRUDVatTu;