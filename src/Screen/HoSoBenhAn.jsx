import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import "../Styles/HoSoBenhAn.css";

const MedicalRecordList = () => {
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
        hoTen: '',
        maLichHen: '',
        hanhDong: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch records with pagination and filters
    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/medical-records?page=${currentPage}&limit=${recordsPerPage}&searchTerm=${filters.maBenhNhan || ''}`);
            const data = await response.json();

            if (data.success) {
                setRecords(data.data);
                setTotalPages(data.pagination.totalPages); // Get total pages from API response
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

    // Fetch records on page or filter change
    useEffect(() => {
        fetchRecords();
    }, [currentPage, filters]); // Re-fetch when page or filters change

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Reset page to 1 when filters change
    };

    const clearFilters = () => {
        setFilters({
            maBenhNhan: '',
            hoTen: '',
            maLichHen: '',
            hanhDong: ''
        });
    };

    const handleDelete = async (e, maBenhNhan) => {
        e.stopPropagation(); // Prevent row click event
        if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/medical-records/${maBenhNhan}`, {
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

    const handleButtonClick = (e, action, maBenhNhan) => {
        e.stopPropagation();
        navigate(action + maBenhNhan);
    };

    const handleXemDonThuoc = (item) => {
        navigate('/donthuoc', { state: { action: 'xem', item } });
    };

    const handleXemXetNghiem = (item) => {
        navigate('/xet-nghiem', { state: { action: 'xem', item } });
    };

    const handleXemDieuTri = (item) => {
        navigate('/lich-su-dieu-tri', { state: { action: 'xem', item } });
    };

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />

                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Hồ sơ bệnh án</h2>
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
                                        <label>Họ tên</label>
                                        <input
                                            type="text"
                                            name="hoTen"
                                            value={filters.hoTen}
                                            onChange={handleFilterChange}
                                            placeholder="Tìm theo họ tên"
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
                                        <label>Hành động</label>
                                        <select
                                            name="hanhDong"
                                            value={filters.hanhDong}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="KhamMoi">Khám mới</option>
                                            <option value="TaiKham">Tái khám</option>
                                            <option value="CapCuu">Cấp cứu</option>
                                            <option value="TheoDoi">Theo dõi</option>
                                        </select>
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
                                            <th>Mã bệnh nhân</th>
                                            <th>Họ tên</th>
                                            <th>Mã lịch hẹn</th>
                                            <th>Hành động</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map(record => (
                                            <tr
                                                key={record.MaBenhNhan}
                                                onClick={() => navigate(`/chitiethsba/${record.MaBenhNhan}`)}
                                                className="clickable-row"
                                            >
                                                <td className="patient-id">{record.MaBenhNhan}</td>
                                                <td>{record.HoVaTen}</td>
                                                <td>{record.MaLichHen}</td>
                                                <td>{record.HanhDong}</td>
                                                <td>
                                                    <div className="action-buttons-container" onClick={e => e.stopPropagation()}>
                                                        <div className="action-buttons-row">
                                                            <button
                                                                className="action-btn green"
                                                                onClick={() => handleXemDieuTri(record)}
                                                            >
                                                                Lịch sử điều trị
                                                            </button>
                                                            <button
                                                                className="action-btn green"
                                                                onClick={(e) => handleButtonClick(e, '/chitiethsba/', record.MaBenhNhan)}
                                                            >
                                                                Sửa dữ liệu
                                                            </button>
                                                            <button
                                                                className="action-btn"
                                                                onClick={() => handleXemDonThuoc(record)}
                                                            >
                                                                Đơn thuốc
                                                            </button>
                                                        </div>
                                                        <div className="action-buttons-row">
                                                            <button
                                                                className="action-btn red"
                                                                onClick={(e) => handleDelete(e, record.MaBenhNhan)}
                                                            >
                                                                Xóa dữ liệu
                                                            </button>
                                                            <button
                                                                className="action-btn brown"
                                                                onClick={() => handleXemXetNghiem(record)}
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
                                Hiển thị {records.length} trên tổng số {totalPages * recordsPerPage} kết quả
                            </div>

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
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MedicalRecordList;
