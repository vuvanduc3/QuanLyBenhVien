import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import '../Styles/ChiTietHSBA.css';

const MedicalRecordDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editedData, setEditedData] = useState(null);

    // Fetch record data
    useEffect(() => {
        fetchRecordData();
    }, [id]);

    const fetchRecordData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/medical-records/${id}`);
            const data = await response.json();
            
            if (data.success) {
                setRecord(data.data);
                // Chuẩn bị dữ liệu cho form edit
                setEditedData({
                    MaBenhNhan: data.data.MaBenhNhan,
                    MaLichHen: data.data.MaLichHen,
                    BacSi: data.data.BacSi,
                    ChanDoan: data.data.ChanDoan,
                    NgayLap: new Date(data.data.NgayLap).toISOString().slice(0, 16),
                    Action: data.data.Action
                });
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Lỗi khi tải dữ liệu hồ sơ bệnh án');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        // Reset về dữ liệu ban đầu
        setEditedData({
            MaBenhNhan: record.MaBenhNhan,
            MaLichHen: record.MaLichHen,
            BacSi: record.BacSi,
            ChanDoan: record.ChanDoan,
            NgayLap: new Date(record.NgayLap).toISOString().slice(0, 16),
            Action: record.Action
        });
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/medical-records/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    maBenhNhan: editedData.MaBenhNhan,
                    maLichHen: editedData.MaLichHen,
                    bacSi: editedData.BacSi,
                    chanDoan: editedData.ChanDoan,
                    ngayLap: editedData.NgayLap,
                    action: editedData.Action
                })
            });

            const data = await response.json();

            if (data.success) {
                setRecord({
                    ...record,
                    ...editedData
                });
                setIsEditing(false);
                alert('Cập nhật thành công!');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Lỗi khi cập nhật hồ sơ');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="loading">Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!record) return <div className="not-found">Không tìm thấy hồ sơ</div>;

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                
                <div className="detail-content">
                    <div className="detail-header">
                        <div className="header-left">
                            <h2>Chi tiết hồ sơ bệnh án</h2>
                            <span className="record-id">#{record.ID}</span>
                        </div>
                        <div className="header-actions">
                            {!isEditing ? (
                                <>
                                    <button className="edit-button" onClick={handleEdit}>
                                        Chỉnh sửa
                                    </button>
                                    <button 
                                        className="back-button"
                                        onClick={() => navigate('/hosobenhan')}
                                    >
                                        Quay lại
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="save-button" onClick={handleSubmit}>
                                        Lưu thay đổi
                                    </button>
                                    <button className="cancel-button" onClick={handleCancel}>
                                        Hủy
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="detail-card">
                        {isEditing ? (
                            <form className="edit-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Mã bệnh nhân</label>
                                        <input
                                            name="MaBenhNhan"
                                            value={editedData.MaBenhNhan}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mã lịch hẹn</label>
                                        <input
                                            name="MaLichHen"
                                            value={editedData.MaLichHen}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Bác sĩ</label>
                                        <input
                                            name="BacSi"
                                            value={editedData.BacSi}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày lập</label>
                                        <input
                                            type="datetime-local"
                                            name="NgayLap"
                                            value={editedData.NgayLap}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Chẩn đoán</label>
                                    <textarea
                                        name="ChanDoan"
                                        value={editedData.ChanDoan}
                                        onChange={handleChange}
                                        rows="4"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hành động</label>
                                    <select
                                        name="Action"
                                        value={editedData.Action}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="KhamMoi">Khám mới</option>
                                        <option value="TaiKham">Tái khám</option>
                                        <option value="CapCuu">Cấp cứu</option>
                                        <option value="TheoDoi">Theo dõi</option>
                                    </select>
                                </div>
                            </form>
                        ) : (
                            <div className="detail-info">
                                <div className="info-section">
                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Mã bệnh nhân</label>
                                            <p>{record.MaBenhNhan}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Mã lịch hẹn</label>
                                            <p>{record.MaLichHen}</p>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Bác sĩ</label>
                                            <p>{record.BacSi}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Ngày lập</label>
                                            <p>{formatDate(record.NgayLap)}</p>
                                        </div>
                                    </div>

                                    <div className="info-group full-width">
                                        <label>Chẩn đoán</label>
                                        <p className="diagnosis">{record.ChanDoan}</p>
                                    </div>

                                    <div className="info-group">
                                        <label>Hành động</label>
                                        <p className="action-tag">{record.Action}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MedicalRecordDetail;