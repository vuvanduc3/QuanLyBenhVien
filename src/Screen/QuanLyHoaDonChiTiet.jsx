import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';


const HoaDonChiTiet = () => {
    const navigate = useNavigate();
    const [hoaDonChiTiet, setHoaDonChiTiet] = useState([]);
    const [currentPage, setCurrentPage] = useState('list'); // Quản lý trang hiện tại
    const [selectedData, setSelectedData] = useState(null); // Dữ liệu đang được chọn (cho sửa/xóa)

    // Gọi API để lấy danh sách hóa đơn chi tiết
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


    // Chuyển hướng khi nhấn nút "Thêm hóa đơn chi tiết"
    const handleAddClick = () => {
        navigate('/themSuaXoaHoaDonChiTiet', { state: { action: 'add' } });
    };

    // Chuyển hướng khi nhấn nút "Sửa"
    const handleEditClick = (item) => {
        navigate('/themSuaXoaHoaDonChiTiet', { state: { action: 'edit', item } });
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/hoadonchitiet/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                // Cập nhật lại danh sách hóa đơn chi tiết sau khi xóa
                setHoaDonChiTiet(hoaDonChiTiet.filter(item => item.MaChiTiet !== id));
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Lỗi khi xóa:', err.message);
        }
    };


    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="page-title">Danh sách hóa đơn chi tiết</h2>
                        <button className="add-button"  onClick={handleAddClick}>
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
                                {hoaDonChiTiet.map((item) => (
                                    <tr key={item.MaChiTiet}>
                                        <td>{item.MaChiTiet}</td>
                                        <td>{item.MaHoaDon}</td>
                                        <td>{item.TenDichVu}</td>
                                        <td>{item.SoLuong}</td>
                                        <td>{item.DonGia.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                        <td>{(item.SoLuong * item.DonGia).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                        <td>
                                            <div className="action-buttons-container">
                                                <div className="action-buttons-row">
                                                     <button className="action-btn green" onClick={() => handleEditClick(item)}>Sửa</button>
                                                    <button className="action-btn red" onClick={() => handleDelete(item.MaChiTiet)}>Xóa</button>
                                                </div>
                                                <div className="action-buttons-row">
                                                      <button className="action-btn brown">
                                                       Tra cứu và nhập hóa đơn
                                                </button>

                                                </div>
                                            </div>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination">
                        <span>Trang 1 của 84</span>
                        <div className="pagination-controls">
                            <button><ChevronLeft size={20} /></button>
                            <button><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HoaDonChiTiet;
