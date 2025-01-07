import React, { useState, useEffect } from 'react';
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
        phone: '',
        maDanhMuc: '' // Thêm trường maDanhMuc
    });

    const [categories, setCategories] = useState([]); // State cho danh sách danh mục
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Component mounted, fetching initial data...');
        fetchNextCode();
        fetchCategories(); // Fetch danh sách danh mục khi component mount
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/danhmucthuoc');
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.data);
            } else {
                toast.error('Không thể lấy danh sách danh mục thuốc');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Lỗi khi lấy danh sách danh mục thuốc');
        }
    };

    const fetchNextCode = async () => {
        try {
            console.log('Fetching next code from API...');
            const response = await fetch('http://localhost:5000/api/thuoc/next-code');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API response:', data);

            if (data.success) {
                console.log('Setting new code:', data.nextCode);
                setFormData(prev => ({
                    ...prev,
                    code: data.nextCode
                }));
            } else {
                console.error('API returned error:', data.message);
                toast.error('Không thể lấy mã thuốc tự động: ' + data.message);
            }
        } catch (error) {
            console.error('Error in fetchNextCode:', error);
            toast.error('Lỗi khi lấy mã thuốc tự động: ' + error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
        if (!formData.maDanhMuc) {
            setError('Vui lòng chọn danh mục thuốc');
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
                    phone: formData.phone || '',
                    maDanhMuc: formData.maDanhMuc // Thêm maDanhMuc vào request
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
            const nextCodeResponse = await fetch('http://localhost:5000/api/thuoc/next-code');
            const nextCodeData = await nextCodeResponse.json();
            
            if (nextCodeData.success) {
                setFormData({
                    code: nextCodeData.nextCode,
                    name: '',
                    description: '',
                    quantity: '',
                    price: '',
                    phone: '',
                    maDanhMuc: '' // Reset maDanhMuc
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
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Thêm sửa xóa thuốc</h2>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="medicine-form">
                        <div className="form-group">
                            <label>Mã thuốc <span className="required">*</span></label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                className="form-control"
                                required
                                readOnly
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
                            <label>Danh mục thuốc <span className="required">*</span></label>
                            <select
                                name="maDanhMuc"
                                value={formData.maDanhMuc}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                <option value="">Chọn danh mục thuốc</option>
                                {categories.map(category => (
                                    <option key={category.MaDanhMuc} value={category.MaDanhMuc}>
                                        {category.TenDanhMuc}
                                    </option>
                                ))}
                            </select>
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