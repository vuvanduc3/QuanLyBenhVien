import React, { useState, useEffect } from 'react';
import {
    Search, ChevronLeft, ChevronRight, PenSquare, Trash2
} from 'lucide-react';
import '../Styles/DonThuoc.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { useNavigate } from 'react-router-dom';

const DonThuoc = () => {
    const navigate = useNavigate();
    const handleChangeDonThuoc = () => {
        navigate('/cruddonthuoc');
    };

    const [page, setPage] = useState(1);
    const totalPages = 84;
    const [prescriptions, setPrescriptions] = useState([]); // State lưu trữ danh sách đơn thuốc
    const [loading, setLoading] = useState(false); // State để hiển thị loading
    const [error, setError] = useState(null); // State để lưu lỗi nếu xảy ra

    // Gọi API khi component được mount
   const fetchData = async () => {
           try {
               const response = await fetch("http://localhost:5000/api/donthuoc");
               const data = await response.json();
               if (data.success) {
                   setPrescriptions(data.data);
               } else {
                   console.error(data.message);
               }
           } catch (error) {
               console.error("Lỗi khi lấy dữ liệu:", error);
           }
       };

       useEffect(() => {
           fetchData();
       }, []);


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
                        <button className="add-button" onClick={handleAdd}>
                            Thêm đơn thuốc
                        </button>
                    </div>

                    {/* Hiển thị lỗi hoặc trạng thái loading */}
                    {loading && <p>Đang tải dữ liệu...</p>}
                    {error && <p className="error-message">❌ {error}</p>}

                    {/* Table */}
                    {!loading && !error && (
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
                                    {prescriptions.map((prescription, index) => (
                                        <tr key={index}>
                                            <td>{prescription.MaDonThuoc}</td>
                                            <td>{prescription.MaBenhNhan}</td>
                                            <td>{prescription.BacSi}</td>
                                            <td>{prescription.MaHoSo}</td>
                                            <td>{prescription.MaThuoc}</td>
                                            <td>{prescription.HuongDanSuDung}</td>
                                            <td>x{prescription.SoLuongDonThuoc}</td>
                                            <td>{prescription.DaNhapHoaDon ? 'Đã nhập' : 'Chưa nhập'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="edit-button" onClick={() => handleEdit(prescription)}>
                                                        <PenSquare size={16} />
                                                    </button>
                                                    <button className="delete-button"
                                                    onClick={async () => {
                                                   if (window.confirm("Bạn có chắc muốn xóa?")) {
                                                       await fetch(`http://localhost:5000/api/donthuoc/${prescription.MaDonThuoc}`, {
                                                           method: "DELETE",
                                                       });
                                                       fetchData();
                                                   }
                                               }}

                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="pagination">
                        <span className="page-info">
                            Trang {page} của {totalPages}
                        </span>
                        <div className="pagination-buttons">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="pagination-button"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="pagination-button"
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
