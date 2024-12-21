import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDThuoc.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';

const ThemSuaXoaThuoc = () => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        quantity: '',
        price: '',
        phone: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Xóa thông báo lỗi khi user bắt đầu nhập lại
        setError(null);
    };
    
    const validateForm = () => {
        if (!formData.code) {
            setError('Vui lòng nhập mã thuốc');
            return false;
        }
        if (!formData.name) {
            setError('Vui lòng nhập tên thuốc');
            return false;
        }
        if (!formData.quantity) {
            setError('Vui lòng nhập số lượng');
            return false;
        }
        if (!formData.price) {
            setError('Vui lòng nhập giá thuốc');
            return false;
        }
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Kiểm tra dữ liệu trước khi gửi
            if (!formData.code || !formData.name || !formData.quantity || !formData.price) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
                setLoading(false);
                return;
            }
    
            const response = await fetch('http://localhost:5000/api/thuoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: formData.code,
                    name: formData.name,
                    description: formData.description || '',
                    quantity: Number(formData.quantity),
                    price: Number(formData.price),
                    phone: formData.phone || ''
                })
            });
            
            // Kiểm tra response có phải là JSON không
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server không trả về dữ liệu JSON hợp lệ");
            }
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra khi thêm thuốc');
            }
            
            // Hiển thị thông báo thành công
            toast.success('🎉 Thêm thuốc thành công!');
            
            // Reset form
            setFormData({
                code: '',
                name: '',
                description: '',
                quantity: '',
                price: '',
                phone: ''
            });
            
        } catch (error) {
            console.error('Error:', error);
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
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Thêm sửa xóa thuốc</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="medicine-form">
                        <div className="form-group">
                            <label>Mã thuốc <span className="required">*</span></label>
                            <input
                                type="text"
                                name="code"
                                placeholder="Nhập mã thuốc"
                                value={formData.code}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Tên thuốc <span className="required">*</span></label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nhập tên thuốc"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mô tả</label>
                            <textarea
                                name="description"
                                placeholder="Mô tả"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-control"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Số lượng <span className="required">*</span></label>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Nhập số lượng"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="form-control"
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Giá thuốc <span className="required">*</span></label>
                            <input
                                type="number"
                                name="price"
                                placeholder="Nhập giá"
                                value={formData.price}
                                onChange={handleChange}
                                className="form-control"
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Nhập số điện thoại"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-control"
                                pattern="[0-9]{10}"
                                title="Số điện thoại phải có 10 chữ số"
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

export default ThemSuaXoaThuoc;