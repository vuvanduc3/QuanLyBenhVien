import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import "../Styles/QuanLyHoaDonChiTiet.css";

const QuanLyHoaDonChiTiet = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const recordsPerPage = 10;

    // Filter states
    const [filters, setFilters] = useState({
        maBenhNhan: '',
        maLichHen: '',
        bacSi: '',
        action: '',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);

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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
    };

    const clearFilters = () => {
        setFilters({
            maBenhNhan: '',
            maLichHen: '',
            bacSi: '',
            action: '',
            startDate: '',
            endDate: ''
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/medical-records/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                
                if (data.success) {
                    fetchRecords();
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

    // Filter records based on all criteria
    const filteredRecords = records.filter(record => {
        const matchMaBenhNhan = record.MaBenhNhan.toLowerCase().includes(filters.maBenhNhan.toLowerCase());
        const matchMaLichHen = record.MaLichHen.toLowerCase().includes(filters.maLichHen.toLowerCase());
        const matchBacSi = record.BacSi.toLowerCase().includes(filters.bacSi.toLowerCase());
        const matchAction = filters.action === '' || record.Action === filters.action;
        
        let matchDate = true;
        if (filters.startDate && filters.endDate) {
            const recordDate = new Date(record.NgayLap);
            const startDate = new Date(filters.startDate);
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59); // Set end date to end of day
            matchDate = recordDate >= startDate && recordDate <= endDate;
        }

        return matchMaBenhNhan && matchMaLichHen && matchBacSi && matchAction && matchDate;
    });

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                
                <div className="content">
                <div className="card-header">
                        <h2 className="card-title">Quản lý hóa đơn chi tiết</h2>
                        <button 
                            className="add-button"
                            onClick={() => navigate('/hosobenhan/add')}
                        >
                            Thêm hồ sơ
                        </button>
                    </div>
                    <div className="filters-section">
                        <div className="filters-header">
                            <button 
                                className="filter-toggle-button"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={20} />
                                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                            </button>
                            {showFilters && (
                                <button 
                                    className="clear-filters-button"
                                    onClick={clearFilters}
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        {showFilters && (
                            <div className="filters-container">
                                <div className="filter-row">
                                    <div className="filter-group">
                                        <label>Mã bệnh nhân</label>
                                        <input
                                            type="text"
                                            name="maBenhNhan"
                                            value={filters.maBenhNhan}
                                            onChange={handleFilterChange}
                                            placeholder="Tìm theo mã bệnh nhân"
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label>Mã lịch hẹn</label>
                                        <input
                                            type="text"
                                            name="maLichHen"
                                            value={filters.maLichHen}
                                            onChange={handleFilterChange}
                                            placeholder="Tìm theo mã lịch hẹn"
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label>Bác sĩ</label>
                                        <input
                                            type="text"
                                            name="bacSi"
                                            value={filters.bacSi}
                                            onChange={handleFilterChange}
                                            placeholder="Tìm theo tên bác sĩ"
                                        />
                                    </div>
                                </div>

                                <div className="filter-row">
                                    <div className="filter-group">
                                        <label>Hành động</label>
                                        <select
                                            name="action"
                                            value={filters.action}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="KhamMoi">Khám mới</option>
                                            <option value="TaiKham">Tái khám</option>
                                            <option value="CapCuu">Cấp cứu</option>
                                            <option value="TheoDoi">Theo dõi</option>
                                        </select>
                                    </div>
                                    <div className="filter-group">
                                        <label>Từ ngày</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={filters.startDate}
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label>Đến ngày</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={filters.endDate}
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    

                    {loading ? (
                        <div className="loading">Đang tải dữ liệu...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#ID</th>
                                            <th>Mã bệnh nhân</th>
                                            <th>Mã lịch hẹn</th>
                                            <th>Bác sĩ</th>
                                            <th>Chẩn đoán</th>
                                            <th>Hành động</th>
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
                                                <td>{record.Action}</td>
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
                                                                onClick={() => navigate(`/chitiethsba/${record.ID}`)}
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

                            <div className="results-summary">
                                Hiển thị {currentRecords.length} trên tổng số {filteredRecords.length} kết quả
                            </div>

                            <div className="pagination">
                                <span>Trang {currentPage} của {Math.ceil(filteredRecords.length / recordsPerPage)}</span>
                                <div className="pagination-controls">
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(prev => 
                                            Math.min(prev + 1, Math.ceil(filteredRecords.length / recordsPerPage))
                                        )}
                                        disabled={currentPage === Math.ceil(filteredRecords.length / recordsPerPage)}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default QuanLyHoaDonChiTiet;