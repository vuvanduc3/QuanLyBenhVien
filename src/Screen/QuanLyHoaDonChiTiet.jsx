import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/QuanLyHoaDonChiTiet.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const HoaDonChiTiet = () => {
    const { state } = useLocation();
    const { action, item } = state || {};
    const navigate = useNavigate();
    const [hoaDonChiTiet, setHoaDonChiTiet] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [filterVisible, setFilterVisible] = useState(false);
    const [filters, setFilters] = useState({
        maBenhNhan: '',
        maBacSi: '',
        sortBy: '',
        sortOrder: '',
    });
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/hoadonchitiet');
                const data = await response.json();
                if (data.success) {
                    setHoaDonChiTiet(data.data);
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                console.error('Lỗi:', err.message);
            }
        };

        fetchData();
    }, []);



    // Lọc danh sách theo item.MaHoaDon nếu tồn tại
    const displayedData = item?.MaHoaDon
        ? hoaDonChiTiet.filter(hd => hd.MaHoaDon === item.MaHoaDon)
        : hoaDonChiTiet;

    const resetFilters = () => {
        setFilters({
            maBenhNhan: '',
            maBacSi: '',
            sortBy: '',
            sortOrder: '',
        });
        setSearchQuery('');
    };

    const filteredData = displayedData
        .filter(item => {
            const query = searchQuery.toLowerCase();
            return (
                item.TenDichVu?.toLowerCase().includes(query) ||
                item.SoLuong?.toString().includes(query) ||
                item.DonGia?.toString().includes(query)
            ) && (
                (!filters.maBenhNhan || item.MaBenhNhan?.includes(filters.maBenhNhan)) &&
                (!filters.maBacSi || item.MaBacSi?.includes(filters.maBacSi))
            );
        })
        .sort((a, b) => {
            if (!filters.sortBy) return 0;
            const fieldA = a[filters.sortBy];
            const fieldB = b[filters.sortBy];
            if (filters.sortOrder === 'asc') {
                return fieldA > fieldB ? 1 : -1;
            } else {
                return fieldA < fieldB ? 1 : -1;
            }
        });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên dịch vụ, số lượng và đơn giá..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="filter-toggle-button" onClick={() => setFilterVisible(!filterVisible)}>
                    {filterVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                </button>
                {filterVisible && (
                    <div className="filters">
                        <input
                            type="text"
                            placeholder="Lọc theo mã bệnh nhân"
                            value={filters.maBenhNhan}
                            onChange={(e) => setFilters({ ...filters, maBenhNhan: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Lọc theo mã bác sĩ"
                            value={filters.maBacSi}
                            onChange={(e) => setFilters({ ...filters, maBacSi: e.target.value })}
                        />
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        >
                            <option value="">Sắp xếp theo</option>
                            <option value="MaChiTiet">Mã hóa đơn</option>
                            <option value="DonGia">Đơn giá</option>
                        </select>
                        <select
                            value={filters.sortOrder}
                            onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                        >
                            <option value="">Thứ tự</option>
                            <option value="asc">Tăng dần</option>
                            <option value="desc">Giảm dần</option>
                        </select>
                        <button className="reset-button" onClick={resetFilters}>
                            Reset bộ lọc
                        </button>
                    </div>
                )}
                <div className="content">
                    <div className="card-header">
                        <h2 className="page-title">Danh sách hóa đơn chi tiết</h2>
                        <button className="add-button" onClick={() => navigate('/themSuaXoaHoaDonChiTiet', { state: { action: 'add' } })}>
                            Thêm hóa đơn chi tiết
                        </button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Mã hóa đơn</th>
                                    <th>Tên dịch vụ/loại thuốc</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((item) => (
                                    <tr key={item.MaChiTiet}>
                                        <td>{item.MaChiTiet}</td>
                                        <td>{item.MaHoaDon}</td>
                                        <td>{item.TenDichVu}</td>
                                        <td>{item.SoLuong}</td>
                                        <td>{item.DonGia ? item.DonGia.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'Chưa có'}</td>
                                        <td>{(item.SoLuong * item.DonGia).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                        <td>
                                            <div className="action-buttons-container">
                                                <div className="action-buttons-row">
                                                    <button className="action-btn green" onClick={() => navigate('/themSuaXoaHoaDonChiTiet', { state: { action: 'edit', item } })}>Sửa</button>
                                                    <button className="action-btn red" onClick={() => {
                                                        fetch(`http://localhost:5000/api/hoadonchitiet/${item.MaChiTiet}`, { method: 'DELETE' })
                                                            .then(response => response.json())
                                                            .then(data => {
                                                                if (data.success) {
                                                                    setHoaDonChiTiet(hoaDonChiTiet.filter(hd => hd.MaChiTiet !== item.MaChiTiet));
                                                                } else {
                                                                    throw new Error(data.message);
                                                                }
                                                            }).catch(err => console.error('Lỗi:', err.message));
                                                    }}>Xóa</button>
                                                </div>
{/*                                                 <div className="action-buttons-row"> */}
{/*                                                     <button */}
{/*                                                         className="action-btn brown" */}
{/*                                                         onClick={() => navigate('/tra-cuu-va-nhap-hoa-don', { state: { action: 'tracuu', item } })} */}
{/*                                                     > */}
{/*                                                         Tra cứu và nhập hóa đơn chi tiết */}
{/*                                                     </button> */}
{/*                                                 </div> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination">
                        <span>Trang {currentPage} của {totalPages}</span>
                        <div className="pagination-controls">
                            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HoaDonChiTiet;
