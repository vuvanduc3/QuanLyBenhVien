import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/LichKham.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { useNavigate } from "react-router-dom";

const LichKham = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]); // Danh sách lịch khám
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const itemsPerPage = 10; // Số bản ghi mỗi trang

  // Hàm gọi API để lấy dữ liệu lịch khám
  const fetchInvoices = async (page = 1) => {
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/LichKham?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();

      if (data.success) {
        setInvoices(data.data); // Lưu dữ liệu vào state
        setTotalPages(data.totalPages || 1); // Tổng số trang từ API
      } else {
        console.error('Lỗi khi lấy dữ liệu lịch khám');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển trang
  const handlePageChange = (direction) => {
    const nextPage = currentPage + direction;
    if (nextPage > 0 && nextPage <= totalPages) {
      setCurrentPage(nextPage);
      fetchInvoices(nextPage);
    }
  };

  const handleAdd = () => {
    navigate('/CRUDLichKham', { state: { action: 'add' } });
  };

  const handleEdit = (item) => {
    navigate('/CRUDLichKham', { state: { action: 'edit', item } });
  };

  // Gọi API khi component được render lần đầu
  useEffect(() => {
    fetchInvoices(currentPage);
  }, [currentPage]);

  return (
    <div className="container">
      <Menu1 />
      <main className="main-content">
        <Search1 />

        <div className="content">
          <div className="content-header">
            <h2>Quản lý lịch khám</h2>
            <button className="add-btn" onClick={handleAdd}>Thêm lịch hẹn</button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã lịch khám</th>
                  <th>Mã bệnh nhân</th>
                  <th>Mã bác sĩ</th>
                  <th>Ngày khám</th>
                  <th>Giờ khám</th>
                  <th>Trạng thái</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7">Đang tải dữ liệu...</td></tr>
                ) : (
                  invoices.map((lichKham) => {
                    const formattedDate = new Date(lichKham.NgayKham).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });
                    const formattedTime = lichKham.GioKham.slice(11, 16);

                    let statusClass = '';
                    if (lichKham.TrangThai === "Đang chờ khám") statusClass = 'status-pending';
                    else if (lichKham.TrangThai === "Hoàn thành") statusClass = 'status-completed';
                    else if (lichKham.TrangThai === "Đã hủy") statusClass = 'status-canceled';

                    let detailButtonText = null;
                    if (lichKham.TrangThai === "Đang chờ khám") detailButtonText = 'Nhập hồ sơ bệnh án';
                    else if (lichKham.TrangThai === "Hoàn thành") detailButtonText = 'Xem hồ sơ';

                    return (
                      <tr key={lichKham.MaLichKham}>
                        <td>{lichKham.MaLichKham}</td>
                        <td>{lichKham.MaBenhNhan}</td>
                        <td>{lichKham.MaBacSi}</td>
                        <td>{formattedDate}</td>
                        <td>{formattedTime}</td>
                        <td className={statusClass}>{lichKham.TrangThai}</td>
                        <td>
                          <div className="action-buttons-container">
                            <div className="action-buttons-row">
                              <button className="action-btn green" onClick={() => handleEdit(lichKham)}>Sửa</button>
                              <button className="action-btn red"
                                onClick={async () => {
                                  if (window.confirm('Bạn có chắc muốn xóa?')) {
                                    await fetch(
                                      `http://localhost:5000/api/LichKham/${lichKham.MaLichKham}`,
                                      { method: 'DELETE' }
                                    );
                                    fetchInvoices(currentPage);
                                  }
                                }}
                              >Xóa</button>
                            </div>
                            {detailButtonText && (
                              <button className="action-btn brown">{detailButtonText}</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>Trang {currentPage} / {totalPages}</span>
            <div className="pagination-buttons">
              <button className="page-btn" onClick={() => handlePageChange(-1)} disabled={currentPage === 1}>
                <ChevronLeft size={20} />
              </button>
              <button className="page-btn" onClick={() => handlePageChange(1)} disabled={currentPage === totalPages}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LichKham;
