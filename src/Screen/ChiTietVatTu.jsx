import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Save, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Menu1 from '../components/Menu';
import '../Styles/ChiTietThuoc.css';
import Search1 from '../components/seach_user';

const ChiTietVatTu = () => {
    const [vatTu, setVatTu] = useState(null);
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
            const response = await fetch(`http://localhost:5000/api/vattu/${id}`);
            const data = await response.json();

            if (data.success) {
                setVatTu(data.data);
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


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/vattu/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenvattu: editedData.TenVatTu,
                    loaivattu: editedData.LoaiVatTu,
                    donvitinh: editedData.DonViTinh,
                    soluong: editedData.SoLuong,
                    giatien: editedData.GiaTien
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Cập nhật vật tư thành công!');
               const tenThongBao = "Thông báo: Sửa vật tư có 'Mã vật tư : "+id +" - Tên vật tư : "+ editedData.TenVatTu +"' thành công!";
               const loaiThongBao = "Vật tư";
               const chucNang = "Sửa dữ liệu";
               themThongBao(tenThongBao, loaiThongBao, chucNang, editedData);

                setVatTu(editedData);
                setIsEditing(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(`Lỗi: ${error.message}`);
        }
    };

    const handleCancel = () => {
        setEditedData(vatTu);
        setIsEditing(false);
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!vatTu) {
        return <div className="not-found">Không tìm thấy thông tin thuốc</div>;
    }

    return (
        <div className="container">
            <ToastContainer position="top-right" />
            <Menu1 />
            <main className="main-content">
                <Search1/>
                <div className="detail-container">
                    <div className="detail-header">
                        <div className="header-left">
                            <button className="back-button" onClick={() => navigate('/quanlyvattu')}>
                                <ChevronLeft />
                            </button>
                            <h2>Chi tiết vật tư y tế</h2>
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
                            <span>{vatTu.MaVatTu}</span>
                        </div>

                        <div className="detail-row">
                            <label>Tên thuốc:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="TenVatTu"
                                    value={editedData.TenVatTu}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    required
                                />
                            ) : (
                                <span>{vatTu.TenVatTu}</span>
                            )}
                        </div>
                        <div className="detail-row">
                            <label>Loại vật tư:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="LoaiVatTu"
                                    value={editedData.LoaiVatTu}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    required
                                />
                            ) : (
                                <span>{vatTu.LoaiVatTu}</span>
                            )}
                        </div>
                        <div className="detail-row">
                            <label>Đơn vị tính:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="DonViTinh"
                                    value={editedData.DonViTinh}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    required
                                />
                            ) : (
                                <span>{vatTu.DonViTinh}</span>
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
                                <span className="quantity">{vatTu.SoLuong}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <label>Giá thuốc:</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="GiaTien"
                                    value={editedData.GiaTien}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                    min="0"
                                    required
                                />
                            ) : (
                                <span className="price">{vatTu.GiaTien.toLocaleString()} VND</span>
                            )}
                        </div>

                        

                        
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChiTietVatTu;