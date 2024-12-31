import React, { useState, useEffect } from 'react';
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
        ngayLap: new Date().toISOString().slice(0, 16),
        action: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Lấy cả mã bệnh nhân và mã lịch hẹn khi component được load
        fetchNextCodes();
    }, []);

    const fetchNextCodes = async () => {
        try {
            // Lấy mã bệnh nhân
            const patientResponse = await fetch('http://localhost:5000/api/medical-records/next-patient-code');
            const patientData = await patientResponse.json();
            
            // Lấy mã lịch hẹn
            const appointmentResponse = await fetch('http://localhost:5000/api/medical-records/next-appointment-code');
            const appointmentData = await appointmentResponse.json();
            
            if (patientData.success && appointmentData.success) {
                setFormData(prev => ({
                    ...prev,
                    maBenhNhan: patientData.nextCode,
                    maLichHen: appointmentData.nextCode
                }));
            }
        } catch (err) {
            console.error('Error fetching next codes:', err);
            setError('Lỗi khi lấy mã tự động. Vui lòng thử lại.');
        }
    };

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
                                <label htmlFor="maBenhNhan">Mã bệnh nhân</label>
                                <input
                                    type="text"
                                    id="maBenhNhan"
                                    name="maBenhNhan"
                                    value={formData.maBenhNhan}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="maLichHen">Mã lịch hẹn</label>
                                <input
                                    type="text"
                                    id="maLichHen"
                                    name="maLichHen"
                                    value={formData.maLichHen}
                                    readOnly
                                    className="readonly-input"
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
                                onClick={() => navigate('/hosobenhan')}
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