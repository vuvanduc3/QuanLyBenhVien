import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/QuanLyHoaDonChiTiet.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { Printer, Send } from 'lucide-react';

const HoaDonChiTiet = () => {
    const { state } = useLocation();
    const { item } = state || {}; // Lấy item từ state
    const navigate = useNavigate();

    const [hoaDonChiTiet, setHoaDonChiTiet] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/hoadonchitiet');
                const data = await response.json();
                if (data.success) {
                    setHoaDonChiTiet(data.data);
                } else {
                    throw new Error(data.message || 'Không thể tải dữ liệu');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Lọc danh sách chi tiết hóa đơn theo `MaHoaDon`
    const displayedData = item?.MaHoaDon
        ? hoaDonChiTiet.filter(hd => hd.MaHoaDon === item.MaHoaDon)
        : [];

    const totalPages = Math.ceil(displayedData.length / itemsPerPage);
    const paginatedData = displayedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Tính tổng tiền cho các mục đang hiển thị trên trang
    const calculateTotalAmount = () => {
        return paginatedData.reduce((total, item) => {
            const totalPrice = item.SoLuong * item.DonGia;
            return total + totalPrice;
        }, 0);
    };

    const totalAmount = calculateTotalAmount();

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="error">Lỗi: {error}</div>;
    }
   const formatNgaySinh = (ngaySinh) => {
       if (!ngaySinh) return "Không xác định";
       const date = new Date(ngaySinh);
       return new Intl.DateTimeFormat('vi-VN', {
           year: 'numeric',
           month: '2-digit',
           day: '2-digit',
           hour: '2-digit',
           minute: '2-digit',
           second: '2-digit',
       }).format(date);
   };

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="page-title">Chi tiết hóa đơn</h2>
                    </div>
                    <div className="card-header">
                        <span>Mã bệnh nhân: {item?.MaBenhNhan || 'Không có'}</span>
                        <span>Ngày tạo hóa đơn: {formatNgaySinh(item?.NgayLapHoaDon) || 'Không có'}</span>
                    </div>
                    <div className="card-header">
                        <span>Mã hóa đơn: {item?.MaHoaDon || 'Không có'}</span>
                    </div>
                    <div className="table-container">
                        {displayedData.length === 0 ? (
                            <p>Không có chi tiết nào cho mã hóa đơn này.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>#ID</th>
                                        <th>Mã hóa đơn</th>
                                        <th>Tên dịch vụ/loại thuốc</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((item) => (
                                        <tr key={item.MaChiTiet}>
                                            <td>{item.MaChiTiet}</td>
                                            <td>{item.MaHoaDon}</td>
                                            <td>{item.TenDichVu}</td>
                                            <td>{item.SoLuong}</td>
                                            <td>
                                                {item.DonGia
                                                    ? item.DonGia.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                                                    : 'Chưa có'}
                                            </td>
                                            <td>
                                                {(item.SoLuong * item.DonGia).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {displayedData.length > 0 && (
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
                    )}
                    {/* Hiển thị tổng tiền cho các mục trên trang hiện tại */}
                    <div className="total-amount" style={{ textAlign: 'right' }}>
                        <h3>Tổng tiền: {item.TongTien.toLocaleString('vi-VN')} VND</h3>
                    </div>
                    <div className="action-buttons-hoadon">
                        <button className="action-btn-hoadon brown" disabled={displayedData.length === 0}>
                            <span className="icon"><Printer size={20} /></span> In hóa đơn
                        </button>
                        <button className="action-btn-hoadon green" disabled={displayedData.length === 0}>
                            <span className="icon"><Send size={20} /></span> Gửi hóa đơn
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HoaDonChiTiet;
