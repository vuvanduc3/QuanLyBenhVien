import React, { useState, useEffect } from 'react';
import '../Styles/DanhMucThuoc.css';
import Menu1 from '../components/Menu';
import { toast, ToastContainer } from 'react-toastify';
import Search1 from '../components/seach_user';
const API_URL = 'http://localhost:5000';

const DanhMucThuoc = () => {
    const [danhMucList, setDanhMucList] = useState([]);
    const [formData, setFormData] = useState({
        MaDanhMuc: '',
        TenDanhMuc: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch danh sách danh mục
    const fetchDanhMuc = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/danhmucthuoc`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setDanhMucList(result.data);
            } else {
                setError(result.message || 'Có lỗi xảy ra khi tải dữ liệu');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Lỗi khi tải dữ liệu: ' + (err.message || 'Không thể kết nối đến server'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDanhMuc();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({ MaDanhMuc: '', TenDanhMuc: '' });
        setIsEditing(false);
        setError('');
    };

    const showMessage = (message, isError = false) => {
        if (isError) {
            setError(message);
            setSuccessMessage('');
        } else {
            setSuccessMessage(message);
            setError('');
        }
        setTimeout(() => {
            setError('');
            setSuccessMessage('');
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const url = isEditing
                ? `${API_URL}/api/danhmucthuoc/${formData.MaDanhMuc}`
                : `${API_URL}/api/danhmucthuoc`;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                showMessage(result.message);
                fetchDanhMuc();
                resetForm();
            } else {
                showMessage(result.message, true);
            }
        } catch (err) {
            showMessage('Lỗi khi lưu dữ liệu: ' + err.message, true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (maDanhMuc) => {
        if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/danhmucthuoc/${maDanhMuc}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    showMessage(result.message);
                    fetchDanhMuc();
                } else {
                    showMessage(result.message, true);
                }
            } catch (err) {
                showMessage('Lỗi khi xóa dữ liệu: ' + err.message, true);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleEdit = (danhMuc) => {
        setFormData({
            MaDanhMuc: danhMuc.MaDanhMuc,
            TenDanhMuc: danhMuc.TenDanhMuc
        });
        setIsEditing(true);
    };

    return (
        <><div className="container">
           
            <ToastContainer position="top-right" />
            <Menu1 />
            <main className="main-content">
            <Search1/>
                <div className="detail-container">
                    <h1 className="page-title">Quản lý Danh Mục Thuốc</h1>

                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    {isLoading && <div className="loading-message">Đang xử lý...</div>}

                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label htmlFor="MaDanhMuc">Mã Danh Mục:</label>
                            <input
                                id="MaDanhMuc"
                                type="text"
                                name="MaDanhMuc"
                                value={formData.MaDanhMuc}
                                onChange={handleInputChange}
                                disabled={isEditing}
                                placeholder="VD: DM001"
                                required />
                            <small className="form-hint">Định dạng: DM + 3 số (VD: DM001)</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="TenDanhMuc">Tên Danh Mục:</label>
                            <input
                                id="TenDanhMuc"
                                type="text"
                                name="TenDanhMuc"
                                value={formData.TenDanhMuc}
                                onChange={handleInputChange}
                                placeholder="Nhập tên danh mục"
                                required />
                        </div>

                        <div className="button-group">
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isLoading}
                            >
                                {isEditing ? 'Cập Nhật' : 'Thêm Mới'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={resetForm}
                                    disabled={isLoading}
                                >
                                    Hủy
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Mã Danh Mục</th>
                                    <th>Tên Danh Mục</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {danhMucList.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="no-data">
                                            {isLoading ? 'Đang tải dữ liệu...' : 'Chưa có danh mục nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    danhMucList.map((danhMuc) => (
                                        <tr key={danhMuc.MaDanhMuc}>
                                            <td>{danhMuc.MaDanhMuc}</td>
                                            <td>{danhMuc.TenDanhMuc}</td>
                                            <td className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEdit(danhMuc)}
                                                    disabled={isLoading}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(danhMuc.MaDanhMuc)}
                                                    disabled={isLoading}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div><><div className="danh-muc-container">
            <Menu1 />

        </div></></>
    );
};

export default DanhMucThuoc;