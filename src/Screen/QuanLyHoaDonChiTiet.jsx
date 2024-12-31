import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Styles/QuanLyHoaDonChiTiet.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';


const HoaDonChiTiet = () => {
    const navigate = useNavigate();
    const [hoaDonChiTiet, setHoaDonChiTiet] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Số lượng mục trên mỗi trang

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

    // Lọc danh sách hóa đơn chi tiết theo truy vấn tìm kiếm
    const filteredData = hoaDonChiTiet.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            item.TenDichVu.toLowerCase().includes(query) ||
            item.SoLuong.toString().includes(query) ||
            item.DonGia.toString().includes(query)
        );
    });

    // Tính toán số trang và phân trang
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Chuyển hướng khi nhấn nút "Thêm hóa đơn chi tiết"
    const handleAddClick = () => {
        navigate('/themSuaXoaHoaDonChiTiet', { state: { action: 'add' } });
    };

    const handleEditClick = (item) => {
        navigate('/themSuaXoaHoaDonChiTiet', { state: { action: 'edit', item } });
    };

    const chuyenTrangTraCuuVaNhapHoaDon = (item) => {
        navigate('/tra-cuu-va-nhap-hoa-don');
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/hoadonchitiet/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                setHoaDonChiTiet(hoaDonChiTiet.filter(item => item.MaChiTiet !== id));
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Lỗi khi xóa:', err.message);
        }
    };

    // Điều hướng trang
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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
                <div className="content">
                    <div className="card-header">
                        <h2 className="page-title">Danh sách hóa đơn chi tiết</h2>
                        <button className="add-button" onClick={handleAddClick}>
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
                                        <td>{item.DonGia.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                        <td>{(item.SoLuong * item.DonGia).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                        <td>
                                            <div className="action-buttons-container">
                                                <div className="action-buttons-container">
                                                    <div className="action-buttons-row">
                                                        <button className="action-btn green" onClick={() => handleEditClick(item)}>Sửa</button>
                                                        <button className="action-btn red" onClick={() => handleDelete(item.MaChiTiet)}>Xóa</button>
                                                    </div>
                                                </div>
                                                <div className="action-buttons-container">
                                                <div className="action-buttons-row">
                                                    <button className="action-btn brown" onClick={chuyenTrangTraCuuVaNhapHoaDon} >
                                                        Tra cứu và nhập hóa đơn
                                                    </button>

                                                </div>
                                            </div>
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
                            <button className="action-btn green" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={20} /></button>
                            <button className="action-btn green" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HoaDonChiTiet;
