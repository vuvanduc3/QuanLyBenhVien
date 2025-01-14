import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/QuanLyVatTu.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const QuanLyVatTu = () => {
    const [vattu, setVatTu] = useState([]);
    const [filteredVatTu, setFilteredVatTu] = useState([]);
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
        maxQuantity: ''
    });

    const navigate = useNavigate();

    const fetchvattus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/vattu');
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setVatTu(data.data);
                setFilteredVatTu(data.data);
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
        fetchvattus();
    }, []);

    // Xử lý tìm kiếm và lọc
    useEffect(() => {
        let result = [...vattu];

        // Tìm kiếm
        if (searchTerm) {
            result = result.filter(vattu =>
                vattu.TenVatTu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vattu.MaVatTu.toString().includes(searchTerm) ||
                vattu.LoaiVatTu.includes(searchTerm)
            );
        }

        // Lọc theo giá
        if (filters.minPrice) {
            result = result.filter(vattu => vattu.GiaTien >= parseInt(filters.minPrice));
        }
        if (filters.maxPrice) {
            result = result.filter(vattu => vattu.GiaTien <= parseInt(filters.maxPrice));
        }

        // Lọc theo số lượng
        if (filters.minQuantity) {
            result = result.filter(vattu => vattu.SoLuong >= parseInt(filters.minQuantity));
        }
        if (filters.maxQuantity) {
            result = result.filter(vattu => vattu.SoLuong <= parseInt(filters.maxQuantity));
        }

        // Sắp xếp
        if (filters.sortBy) {
            result.sort((a, b) => {
                let compareResult = 0;
                switch (filters.sortBy) {
                    case 'id':
                        compareResult = a.MaVatTu - b.MaVatTu;
                        break;
                    case 'name':
                        compareResult = a.TenVatTu.localeCompare(b.TenVatTu);
                        break;
                    case 'price':
                        compareResult = a.GiaTien - b.GiaTien;
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

        setFilteredVatTu(result);
        setTotalPages(Math.ceil(result.length / itemsPerPage));
        setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
    }, [searchTerm, filters, vattu]);

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa vật tư này không?')) {
            return;
        }
    
        setIsDeleting(true);
        try {
            const response = await fetch(`http://localhost:5000/api/vattu/${id}`, {
                method: 'DELETE',
            });
    
            // Kiểm tra mã trạng thái HTTP
            console.log('HTTP Status:', response.status); // In mã trạng thái HTTP
    
            if (!response.ok) {
                throw new Error(`Lỗi từ API: ${response.statusText}`);
            }
    
            // Kiểm tra xem phản hồi có phải là JSON không
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (data.success) {
                    toast.success('Xóa vật tư thành công!');
                    fetchvattus();
                } else {
                    throw new Error(data.message || 'Có lỗi xảy ra khi xóa vật tư');
                }
            } else {
                throw new Error('Phản hồi không phải JSON');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(`Lỗi: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };
    
    

    const handleChangevattu = () => {
        navigate('/them-vat-tu');
    };

    // Lấy thuốc cho trang hiện tại
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredVatTu.slice(startIndex, endIndex);
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

    // Reset tất cả bộ lọc
    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters({
            sortBy: '',
            sortOrder: 'asc',
            minPrice: '',
            maxPrice: '',
            minQuantity: '',
            maxQuantity: ''
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




                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Quản lý vật tư</h2>
                        <button className="add-button" onClick={handleChangevattu}>
                            Thêm vật tư
                        </button>
                    </div>

                    <div className="filters">
                        <div className="filter-group">
                            <Filter />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, ID ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            >
                                <option value="">Sắp xếp theo</option>
                               
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
                                <th>Tên</th>
                                <th>Loại vật tư</th>
                                <th>Đơn vị tính</th>
                                <th>Số lượng</th>
                                <th>Giá tiền</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentPageItems().length > 0 ? (
                                getCurrentPageItems().map((vattu) => (
                                    <tr
                                        key={vattu.MaVatTu}
                                        onClick={() => navigate(`/chi-tiet-vattu/${vattu.MaVatTu}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>{vattu.MaVatTu}</td>
                                        <td>{vattu.TenVatTu}</td>
                                        <td>{vattu.LoaiVatTu}</td>
                                        <td>{vattu.DonViTinh}</td>
                                        <td><span className="quantity">{vattu.SoLuong}</span></td>
                                        <td>{vattu.GiaTien.toLocaleString()} VND</td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    className="action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/chi-tiet-vat-tu/${vattu.MaVatTu}`);
                                                    }}
                                                >

                                                    <Edit />
                                                     Sửa dữ liệu
                                                </button>
                                                <button
                                                    className="action-btn red"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(vattu.MaVatTu);
                                                    }}
                                                    disabled={isDeleting}
                                                >

                                                    <Trash2 />
                                                    Xóa dữ liệu
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-data">Không có dữ liệu</td>
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

export default QuanLyVatTu;