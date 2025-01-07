import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const QuanLyThuoc = () => {
    const [thuocs, setThuocs] = useState([]);
    const [filteredThuocs, setFilteredThuocs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // State cho tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        sortBy: '',
        sortOrder: 'asc',
        minPrice: '',
        maxPrice: '',
        minQuantity: '',
        maxQuantity: '',
        category: '' // Thêm filter cho danh mục
    });

    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/danhmucthuoc');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchThuocs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/thuoc');
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setThuocs(data.data);
                setFilteredThuocs(data.data);
                setTotalPages(Math.ceil(data.data.length / itemsPerPage));
            } else {
                setError('Dữ liệu không hợp lệ');
                console.error('Invalid data format:', data);
            }
        } catch (err) {
            setError('Lỗi khi tải dữ liệu từ API');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThuocs();
        fetchCategories();
    }, []);

    // Xử lý tìm kiếm và lọc
    useEffect(() => {
        let result = [...thuocs];

        // Tìm kiếm
        if (searchTerm) {
            result = result.filter(thuoc =>
                thuoc.TenThuoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                thuoc.ID.toString().includes(searchTerm) ||
                (thuoc.SDT && thuoc.SDT.includes(searchTerm))
            );
        }

        // Lọc theo danh mục
        if (filters.category) {
            result = result.filter(thuoc => thuoc.MaDanhMuc === filters.category);
        }

        // Lọc theo giá
        if (filters.minPrice) {
            result = result.filter(thuoc => thuoc.GiaThuoc >= parseInt(filters.minPrice));
        }
        if (filters.maxPrice) {
            result = result.filter(thuoc => thuoc.GiaThuoc <= parseInt(filters.maxPrice));
        }

        // Lọc theo số lượng
        if (filters.minQuantity) {
            result = result.filter(thuoc => thuoc.SoLuong >= parseInt(filters.minQuantity));
        }
        if (filters.maxQuantity) {
            result = result.filter(thuoc => thuoc.SoLuong <= parseInt(filters.maxQuantity));
        }

        // Sắp xếp
        if (filters.sortBy) {
            result.sort((a, b) => {
                let compareResult = 0;
                switch (filters.sortBy) {
                    case 'name':
                        compareResult = a.TenThuoc.localeCompare(b.TenThuoc);
                        break;
                    case 'price':
                        compareResult = a.GiaThuoc - b.GiaThuoc;
                        break;
                    case 'quantity':
                        compareResult = a.SoLuong - b.SoLuong;
                        break;
                    default:
                        break;
                }
                return filters.sortOrder === 'desc' ? -compareResult : compareResult;
            });
        }

        setFilteredThuocs(result);
        setTotalPages(Math.ceil(result.length / itemsPerPage));
        setCurrentPage(1);
    }, [searchTerm, filters, thuocs]);

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thuốc này không?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`http://localhost:5000/api/thuoc/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Xóa thuốc thành công!');
                fetchThuocs();
            } else {
                throw new Error(data.message || 'Có lỗi xảy ra khi xóa thuốc');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(`Lỗi: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleChangeThuoc = () => {
        navigate('/themsuaxoathuoc');
    };
    const handleChangeDMThuoc = () => {
        navigate('/danhmuc');
    };

    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredThuocs.slice(startIndex, endIndex);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters({
            sortBy: '',
            sortOrder: 'asc',
            minPrice: '',
            maxPrice: '',
            minQuantity: '',
            maxQuantity: '',
            category: ''
        });
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />

                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, ID hoặc SĐT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button className="add-button" onClick={handleChangeDMThuoc}>
                    Thêm danh mục thuốc
                </button>
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Quản lý thuốc</h2>

                        <button className="add-button" onClick={handleChangeThuoc}>
                            Thêm thuốc
                        </button>
                    </div>

                    <div className="filters">
                        <div className="filter-group">
                            <Filter />

                            {/* Thêm select box cho danh mục */}
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="filter-select"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map(category => (
                                    <option key={category.MaDanhMuc} value={category.MaDanhMuc}>
                                        {category.TenDanhMuc}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            >
                                <option value="">Sắp xếp theo</option>
                                <option value="name">Tên thuốc</option>
                                <option value="price">Giá thuốc</option>
                                <option value="quantity">Số lượng</option>
                            </select>

                            <select
                                value={filters.sortOrder}
                                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                            >
                                <option value="asc">Tăng dần</option>
                                <option value="desc">Giảm dần</option>
                            </select>

                            <div className="filter-price">
                                <input
                                    type="number"
                                    placeholder="Giá từ"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="filter-input"
                                />
                                <input
                                    type="number"
                                    placeholder="Giá đến"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="filter-input"
                                />
                            </div>

                            <div className="filter-quantity">
                                <input
                                    type="number"
                                    placeholder="SL từ"
                                    value={filters.minQuantity}
                                    onChange={(e) => setFilters({ ...filters, minQuantity: e.target.value })}
                                    className="filter-input"
                                />
                                <input
                                    type="number"
                                    placeholder="SL đến"
                                    value={filters.maxQuantity}
                                    onChange={(e) => setFilters({ ...filters, maxQuantity: e.target.value })}
                                    className="filter-input"
                                />
                            </div>
                        </div>

                        <div className="actions">
                            <button className="btn-reset" onClick={handleResetFilters}>
                                Reset Filter
                            </button>
                        </div>
                    </div>

                    <table className="table">
                        <thead>
                            <tr>
                                <th>#ID</th>
                                <th>Tên thuốc</th>
                                <th>Danh mục</th>
                                <th>SĐT liên hệ</th>
                                <th>Mô tả</th>
                                <th>Số lượng</th>
                                <th>Giá thuốc</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentPageItems().length > 0 ? (
                                getCurrentPageItems().map((thuoc) => (
                                    <tr
                                        key={thuoc.ID}
                                        onClick={() => navigate(`/chi-tiet-thuoc/${thuoc.ID}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>{thuoc.ID}</td>
                                        <td>{thuoc.TenThuoc}</td>
                                        <td>{thuoc.TenDanhMuc}</td>
                                        <td>{thuoc.SDT}</td>
                                        <td>{thuoc.MoTa}</td>
                                        <td><span className="quantity">{thuoc.SoLuong}</span></td>
                                        <td>{thuoc.GiaThuoc.toLocaleString()} VND</td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    className="btn-edit"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/chi-tiet-thuoc/${thuoc.ID}`);
                                                    }}
                                                >
                                                    <Edit />
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(thuoc.ID);
                                                    }}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="no-data">Không có dữ liệu</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <span>Trang {currentPage} của {totalPages}</span>
                        <div className="pagination-buttons">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className={currentPage === 1 ? 'disabled' : ''}
                            >
                                <ChevronLeft />
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? 'disabled' : ''}
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <ToastContainer />
        </div>
    );
};

export default QuanLyThuoc;