import React, { useState, useEffect } from 'react';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { toast, ToastContainer } from 'react-toastify';
import '../Styles/DanhMucThuoc.css';
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:5000';

const DanhMucThuoc = () => {
     const navigate = useNavigate();
    const [danhMucList, setDanhMucList] = useState([]);
    const [formData, setFormData] = useState({
        MaDanhMuc: '',
        TenDanhMuc: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const fetchDanhMuc = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/danhmucthuoc`);
            const result = await response.json();

            if (result.success) {
                setDanhMucList(result.data);
            } else {
                setError(result.message || 'Có lỗi xảy ra khi tải dữ liệu');
            }
        } catch (err) {
            setError('Lỗi khi tải dữ liệu: ' + err.message);
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
        setShowModal(false);
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
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                fetchDanhMuc();
                resetForm();
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error('Lỗi khi lưu dữ liệu: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (maDanhMuc) => {
        if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/danhmucthuoc/${maDanhMuc}`, {
                    method: 'DELETE'
                });
                const result = await response.json();

                if (result.success) {
                    toast.success(result.message);
                    fetchDanhMuc();
                } else {
                    toast.error(result.message);
                }
            } catch (err) {
                toast.error('Lỗi khi xóa dữ liệu: ' + err.message);
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
        setShowModal(true);
    };

    const handleAdd = () => {
        resetForm();
        setShowModal(true);
    };

    return (
        <div className="container">
            <Menu1 />
            <div className="content-wrapper">
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

                <div className="danh-muc-container">
                    <ToastContainer />
                    
                    <div className="header">
                        <h2>Quản lý Danh Mục Thuốc</h2>
                        <button className="btn-add" onClick={handleAdd}>
                            Thêm mới
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    {isLoading && <div className="loading-message">Đang xử lý...</div>}

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Mã Danh Mục</th>
                                    <th>Tên Danh Mục</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {danhMucList.map((danhMuc) => (
                                    <tr key={danhMuc.MaDanhMuc}>
                                        <td>{danhMuc.MaDanhMuc}</td>
                                        <td>{danhMuc.TenDanhMuc}</td>
                                        <td className="actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(danhMuc)}
                                                disabled={isLoading}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(danhMuc.MaDanhMuc)}
                                                disabled={isLoading}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <div className="modal-header">
                                    <h3>{isEditing ? 'Cập nhật Danh Mục' : 'Thêm Danh Mục Mới'}</h3>
                                    <button className="close-modal" onClick={resetForm}>&times;</button>
                                </div>
                                <form onSubmit={handleSubmit} className="modal-form">
                                    <div className="form-group">
                                        <label htmlFor="MaDanhMuc">Mã Danh Mục:</label>
                                        <input
                                            id="MaDanhMuc"
                                            type="text"
                                            name="MaDanhMuc"
                                            value={formData.MaDanhMuc}
                                            onChange={handleInputChange}
                                            disabled={isEditing}
                                            required
                                        />
                                        <small>Định dạng: DM + 3 số (VD: DM001)</small>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="TenDanhMuc">Tên Danh Mục:</label>
                                        <input
                                            id="TenDanhMuc"
                                            type="text"
                                            name="TenDanhMuc"
                                            value={formData.TenDanhMuc}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="modal-actions">
                                        <button
                                            type="submit"
                                            className="btn-submit"
                                            disabled={isLoading}
                                        >
                                            {isEditing ? 'Cập nhật' : 'Thêm mới'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={resetForm}
                                            disabled={isLoading}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DanhMucThuoc;