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
    const [records, setRecords] = useState([]); // Full list of records
    const [displayedRecords, setDisplayedRecords] = useState([]); // Records to display based on page
    const [loading, setLoading] = useState(false);
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

    // Fetch data from API
    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/medical-records');
            const data = await response.json();

            if (data.success) {
                setRecords(data.data); // Set records to the fetched data
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

    // Apply search, filter, and pagination logic
    useEffect(() => {
        fetchRecords();
    }, []); // Fetch records once when component mounts

    useEffect(() => {
        const filteredRecords = records.filter(record => {
            return (
                (filters.maBenhNhan ? record.MaBenhNhan.includes(filters.maBenhNhan) : true) &&
                (filters.hoTen ? record.HoVaTen.toLowerCase().includes(filters.hoTen.toLowerCase()) : true) &&
                (filters.maLichHen ? record.MaLichHen.includes(filters.maLichHen) : true) &&
                (filters.hanhDong ? record.HanhDong === filters.hanhDong : true)
            );
        });

        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        setTotalPages(totalPages);

        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        setDisplayedRecords(filteredRecords.slice(startIndex, endIndex));
    }, [filters, currentPage, records]);

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

    const handleDelete = (e, maBenhNhan) => {
        e.stopPropagation(); // Prevent row click event
        if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
            try {
                // Handle delete logic
                alert('Xóa hồ sơ thành công');
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

    const handleXemDonThuoc = (e, item) => {
        e.stopPropagation(); // Ngừng sự kiện click dòng bảng
        navigate('/donthuoc', { state: { action: 'xem', item } });
    };

    const handleXemXetNghiem = (e, item) => {
        e.stopPropagation(); // Ngừng sự kiện click dòng bảng
        navigate('/xet-nghiem', { state: { action: 'xem', item } });
    };

    const handleXemDieuTri = (e, item) => {
        e.stopPropagation(); // Ngừng sự kiện click dòng bảng
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
                            <button
                               className="add-button"
                               onClick={() => navigate('/hosobenhan/add')}
                           >
                               Thêm hồ sơ
                           </button>


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
                                            <option value="ChuyenVien">Chuyển viện</option>
                                            <option value="DieuTriNgoaiTru">Điều trị ngoại trú</option>
                                            <option value="XuatVien">Xuất viện</option>
                                            <option value="NhapVien">Nhập viện</option>
                                        </select>
                                    </div>
                                    <button
                                        className="clear-filters-button"
                                        onClick={clearFilters}

                                    >
                                        Xóa bộ lọc
                                    </button>

                                </div>
                            </div>
                        )}
                    </div>

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
                                {displayedRecords.map(record => (
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
                                            <button
                                                className="action-btn green"
                                                onClick={(e) => handleXemDieuTri(e, record)}
                                            >
                                                Lịch sử điều trị
                                            </button>
                                            <button
                                                className="action-btn blue"
                                                onClick={(e) => handleXemXetNghiem(e, record)}
                                            >
                                                Xét nghiệm
                                            </button>
                                            <button
                                                className="action-btn orange"
                                                onClick={(e) => handleXemDonThuoc(e, record)}
                                            >
                                                Đơn thuốc
                                            </button>
                                            <button
                                                className="action-btn red"
                                                onClick={(e) => handleDelete(e, record.MaBenhNhan)}
                                            >
                                                Xóa
                                            </button>
                                            <button
                                                className="action-btn yellow"
                                                onClick={(e) => handleButtonClick(e, '/chitiethsba/', record.MaBenhNhan)}
                                            >
                                                Sửa
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                </div>
            </main>
        </div>
    );
};

export default MedicalRecordList;
