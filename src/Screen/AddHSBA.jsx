import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import '../Styles/AddHSBA.css';

const AddMedicalRecord = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        maBenhNhan: '',
        maLichHen: '',
        bacSi: '',
        chanDoan: '',
        ngayLap: '',
        action: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/medical-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Thêm hồ sơ bệnh án thành công!');
                navigate('/hosobenhan');
            } else {
                setError(data.message || 'Có lỗi xảy ra khi thêm hồ sơ');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                
                <div className="add-record-content">
                    <div className="form-header">
                        <h2>Thêm Hồ Sơ Bệnh Án</h2>
                        <button 
                            className="back-button"
                            onClick={() => navigate('/hosobenhan')}
                        >
                            Quay lại
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="add-record-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="maBenhNhan">Mã bệnh nhân *</label>
                                <input
                                    type="text"
                                    id="maBenhNhan"
                                    name="maBenhNhan"
                                    value={formData.maBenhNhan}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập mã bệnh nhân"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="maLichHen">Mã lịch hẹn *</label>
                                <input
                                    type="text"
                                    id="maLichHen"
                                    name="maLichHen"
                                    value={formData.maLichHen}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập mã lịch hẹn"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="bacSi">Bác sĩ *</label>
                                <input
                                    type="text"
                                    id="bacSi"
                                    name="bacSi"
                                    value={formData.bacSi}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập tên bác sĩ"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="ngayLap">Ngày lập *</label>
                                <input
                                    type="datetime-local"
                                    id="ngayLap"
                                    name="ngayLap"
                                    value={formData.ngayLap}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="chanDoan">Chẩn đoán *</label>
                            <textarea
                                id="chanDoan"
                                name="chanDoan"
                                value={formData.chanDoan}
                                onChange={handleChange}
                                required
                                placeholder="Nhập chẩn đoán chi tiết"
                                rows="4"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="action">Hành động *</label>
                            <select
                                id="action"
                                name="action"
                                value={formData.action}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn hành động</option>
                                <option value="KhamMoi">Khám mới</option>
                                <option value="TaiKham">Tái khám</option>
                                <option value="CapCuu">Cấp cứu</option>
                                <option value="TheoDoi">Theo dõi</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => navigate('/medical-records')}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                className="submit-button" 
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Thêm hồ sơ'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddMedicalRecord;