import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import "../Styles/HoSoBenhAn.css";

const MedicalRecordList = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const recordsPerPage = 10;

    // Fetch medical records
    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/medical-records');
            const data = await response.json();
            
            if (data.success) {
                setRecords(data.data);
                setTotalPages(Math.ceil(data.data.length / recordsPerPage));
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Lỗi khi tải dữ liệu hồ sơ bệnh án');
            console.error('Error fetching records:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Handle delete record
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/medical-records/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                
                if (data.success) {
                    fetchRecords(); // Refresh the list
                    alert('Xóa hồ sơ thành công');
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error('Error deleting record:', err);
                alert('Lỗi khi xóa hồ sơ');
            }
        }
    };

    // Filter records based on search term
    const filteredRecords = records.filter(record => 
        record.ID.toString().includes(searchTerm) ||
        record.MaBenhNhan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.BacSi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get current page records
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    };

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                
                <div className="content">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, ID hoặc SĐT..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <div className="card-header">
                        <h2 className="card-title">Hồ sơ bệnh án</h2>
                        <button 
                            className="add-button"
                            onClick={() => navigate('/hosobenhan/add')}
                        >
                            Thêm hồ sơ
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Đang tải dữ liệu...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#ID</th>
                                        <th>Mã bệnh nhân</th>
                                        <th>Mã lịch hẹn</th>
                                        <th>Bác sĩ</th>
                                        <th>Chẩn đoán</th>
                                        <th>Ngày lập</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.map(record => (
                                        <tr key={record.ID}>
                                            <td>{record.ID}</td>
                                            <td className="patient-id">{record.MaBenhNhan}</td>
                                            <td>{record.MaLichHen}</td>
                                            <td>{record.BacSi}</td>
                                            <td>{record.ChanDoan}</td>
                                            <td>{formatDate(record.NgayLap)}</td>
                                            <td>
                                                <div className="action-buttons-container">
                                                    <div className="action-buttons-row">
                                                        <button 
                                                            className="action-btn green"
                                                            onClick={() => navigate(`/medical-records/history/${record.ID}`)}
                                                        >
                                                            Lịch sử điều trị
                                                        </button>
                                                        <button 
                                                            className="action-btn green"
                                                            onClick={() => navigate(`/medical-records/edit/${record.ID}`)}
                                                        >
                                                            Sửa dữ liệu
                                                        </button>
                                                        <button 
                                                            className="action-btn"
                                                            onClick={() => navigate(`/prescriptions/${record.ID}`)}
                                                        >
                                                            Đơn thuốc
                                                        </button>
                                                    </div>
                                                    <div className="action-buttons-row">
                                                        <button 
                                                            className="action-btn red"
                                                            onClick={() => handleDelete(record.ID)}
                                                        >
                                                            Xóa dữ liệu
                                                        </button>
                                                        <button 
                                                            className="action-btn brown"
                                                            onClick={() => navigate(`/lab-tests/${record.ID}`)}
                                                        >
                                                            Xét nghiệm
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="pagination">
                        <span>Trang {currentPage} của {totalPages}</span>
                        <div className="pagination-controls">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MedicalRecordList;