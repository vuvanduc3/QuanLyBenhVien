import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import '../Styles/DonThuoc.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { useNavigate } from 'react-router-dom';

const DonThuoc = () => {
    const navigate = useNavigate();

    // State
    const [page, setPage] = useState(1); // Trang hiện tại
    const itemsPerPage = 10; // Số item mỗi trang
    const [prescriptions, setPrescriptions] = useState([]); // Danh sách đơn thuốc
    const [filters, setFilters] = useState({
        search: '',
        sortField: '',
        sortOrder: 'asc',
        DaNhapHoaDon: '',
    });
    const [showFilters, setShowFilters] = useState(false); // Ẩn/Hiện bộ lọc

    // Lấy dữ liệu từ API
    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/donthuoc');
            const data = await response.json();
            if (data.success) {
                setPrescriptions(data.data);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Hàm xử lý thay đổi bộ lọc
    const handleFilterChange = (key, value) => {
        // Chuyển giá trị DaNhapHoaDon thành kiểu số (int) nếu có
        if (key === 'DaNhapHoaDon') {
            value = value === '' ? '' : parseInt(value);
        }
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // Reset về trang 1 khi thay đổi bộ lọc
    };

    // Reset bộ lọc
    const resetFilters = () => {
        setFilters({
            search: '',
            sortField: '',
            sortOrder: 'asc',
            DaNhapHoaDon: '',
        });
        setPage(1); // Reset về trang 1
    };

    // Lọc và sắp xếp dữ liệu theo các bộ lọc
    const filteredPrescriptions = prescriptions
        .filter((prescription) => {
            const searchFields = [
                prescription.MaBenhNhan,
                prescription.MaDonThuoc,
                prescription.BacSi,
                prescription.MaHoSo,
                prescription.MaThuoc,
            ];
            return (
                searchFields.some((field) =>
                    field?.toString().toLowerCase().includes(filters.search.toLowerCase())
                ) &&
                (filters.DaNhapHoaDon === '' ||
                    prescription.DaNhapHoaDon === filters.DaNhapHoaDon)
            );
        })
        .sort((a, b) => {
            if (!filters.sortField) return 0;
            const fieldA = a[filters.sortField];
            const fieldB = b[filters.sortField];
            if (filters.sortOrder === 'asc') {
                return fieldA > fieldB ? 1 : fieldA < fieldB ? -1 : 0;
            } else {
                return fieldA < fieldB ? 1 : fieldA > fieldB ? -1 : 0;
            }
        });

    // Phân trang
    const paginatedPrescriptions = filteredPrescriptions.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // Tổng số trang
    const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);

    // Chuyển trang
    const handleEdit = (item) => {
        navigate('/cruddonthuoc', { state: { action: 'edit', item } });
    };

    const handleAdd = () => {
        navigate('/cruddonthuoc', { state: { action: 'add' } });
    };

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Đơn thuốc</h2>
                    </div>
                    <div className="filter-container">
                        <button className="add-button" onClick={handleAdd}>
                            Thêm đơn thuốc
                        </button>
                        <button
                            className="filter-button"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={20} /> {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                        </button>
                    </div>

                    {/* Bộ lọc */}
                    {showFilters && (
                        <div className="filters">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="search-input"
                            />
                            <select
                                value={filters.sortField}
                                onChange={(e) => handleFilterChange('sortField', e.target.value)}
                                className="sort-select"
                            >
                                <option value="">-- Sắp xếp theo --</option>
                                <option value="MaBenhNhan">Mã bệnh nhân</option>
                                <option value="MaDonThuoc">Mã đơn thuốc</option>
                                <option value="BacSi">Mã bác sĩ</option>
                                <option value="MaHoSo">Mã hồ sơ bệnh án</option>
                                <option value="MaThuoc">Mã thuốc</option>
                                <option value="SoLuongDonThuoc">Số lượng</option>
                            </select>
                            <select
                                value={filters.sortOrder}
                                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                className="sort-order-select"
                            >
                                <option value="asc">Tăng dần</option>
                                <option value="desc">Giảm dần</option>
                            </select>
                            <select
                                value={filters.DaNhapHoaDon}
                                onChange={(e) => handleFilterChange('DaNhapHoaDon', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">-- Tất cả --</option>
                                <option value="1">Đã nhập hóa đơn</option>
                                <option value="0">Chưa nhập hóa đơn</option>
                            </select>
                            <button onClick={resetFilters} className="reset-button">
                                Reset bộ lọc
                            </button>
                        </div>
                    )}

                    {/* Bảng dữ liệu */}
                    <div className="table-container">
                        <table className="prescription-table">
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Mã bệnh nhân</th>
                                    <th>Mã bác sĩ</th>
                                    <th>Mã hồ sơ bệnh án</th>
                                    <th>Mã thuốc</th>
                                    <th>Hướng dẫn sử dụng</th>
                                    <th>Số lượng</th>
                                    <th>Đã nhập hóa đơn</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPrescriptions.map((prescription, index) => (
                                    <tr key={index}>
                                        <td>{prescription.MaDonThuoc}</td>
                                        <td>{prescription.MaBenhNhan}</td>
                                        <td>{prescription.BacSi}</td>
                                        <td>{prescription.MaHoSo}</td>
                                        <td>{prescription.MaThuoc}</td>
                                        <td>{prescription.HuongDanSuDung}</td>
                                        <td>x{prescription.SoLuongDonThuoc}</td>
                                        <td>
                                            {prescription.DaNhapHoaDon === 1 ? 'Đã nhập' : 'Chưa nhập'}
                                        </td>
                                        <td>
                                            <div className="action-buttons-container">
                                            <div className="action-buttons-row">
                                            <button className="edit-nut" onClick={() => handleEdit(prescription)}>
                                                Sửa dữ liệu
                                            </button>
                                            <button className="delete-button"
                                                onClick={async () => {
                                                    if (window.confirm('Bạn có chắc muốn xóa?')) {
                                                        await fetch(
                                                            `http://localhost:5000/api/donthuoc/${prescription.MaDonThuoc}`,
                                                            { method: 'DELETE' }
                                                        );
                                                        fetchData();
                                                    }
                                                }}
                                            >
                                                Xóa dữ liệu
                                            </button>
                                            </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang */}
                    <div className="pagination">
                        <span>
                            Trang {page} / {totalPages}
                        </span>
                        <div className="pagination-buttons-row">
                            <button className="pagination-buttons"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button className="pagination-buttons"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
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

export default DonThuoc;
