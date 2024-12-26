import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Save, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Menu1 from '../components/Menu';
import '../Styles/ChiTietThuoc.css';

const ChiTietThuoc = () => {
    const [thuoc, setThuoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchThuocDetail();
    }, [id]);

    const fetchThuocDetail = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/thuoc/${id}`);
            const data = await response.json();

            if (data.success) {
                setThuoc(data.data);
                setEditedData(data.data); // Khởi tạo dữ liệu edit
            } else {
                setError(data.message || 'Không thể lấy thông tin thuốc');
            }
        } catch (error) {
            setError('Lỗi khi tải thông tin thuốc');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/thuoc/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editedData.TenThuoc,
                    phone: editedData.SDT,
                    description: editedData.MoTa,
                    quantity: editedData.SoLuong,
                    price: editedData.GiaThuoc
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Cập nhật thuốc thành công!');
                setThuoc(editedData);
                setIsEditing(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(`Lỗi: ${error.message}`);
        }
    };

    const handleCancel = () => {
        setEditedData(thuoc);
        setIsEditing(false);
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!thuoc) {
        return <div className="not-found">Không tìm thấy thông tin thuốc</div>;
    }

    return (
        <div className="container">
            <ToastContainer position="top-right" />
            <Menu1 />
            <main className="main-content">
                <div className="detail-container">
                    <div className="detail-header">
                        <div className="header-left">
                            <button className="back-button" onClick={() => navigate('/quanlythuoc')}>
                                <ChevronLeft />
                            </button>
                            <h2>Chi tiết thuốc</h2>
                        </div>

                        {!isEditing ? (
                            <button className="edit-button" onClick={() => setIsEditing(true)}>
                                <Edit /> Chỉnh sửa
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button className="save-button" onClick={handleSave}>
                                    <Save /> Lưu
                                </button>
                                <button className="cancel-button" onClick={handleCancel}>
                                    <X /> Hủy
                                </button>
                            </div>
                        )}
                      
                    </div>

                    <div className="detail-card">
                        <div className="detail-row">
                            <label>Mã thuốc:</label>
                            <span>{thuoc.ID}</span>
                        </div>

                        <div className="detail-row">
                            <label>Tên thuốc:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="TenThuoc"
                                    value={editedData.TenThuoc}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    required
                                />
                            ) : (
                                <span>{thuoc.TenThuoc}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <label>Số lượng:</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="SoLuong"
                                    value={editedData.SoLuong}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    min="0"
                                    required
                                />
                            ) : (
                                <span className="quantity">{thuoc.SoLuong}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <label>Giá thuốc:</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="GiaThuoc"
                                    value={editedData.GiaThuoc}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    min="0"
                                    required
                                />
                            ) : (
                                <span className="price">{thuoc.GiaThuoc.toLocaleString()} VND</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <label>Số điện thoại:</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="SDT"
                                    value={editedData.SDT || ''}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    pattern="[0-9]{10}"
                                />
                            ) : (
                                <span>{thuoc.SDT || 'Chưa cập nhật'}</span>
                            )}
                        </div>

                        <div className="detail-row description">
                            <label>Mô tả:</label>
                            {isEditing ? (
                                <textarea
                                    name="MoTa"
                                    value={editedData.MoTa || ''}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    rows="3"
                                />
                            ) : (
                                <p>{thuoc.MoTa || 'Chưa có mô tả'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChiTietThuoc;