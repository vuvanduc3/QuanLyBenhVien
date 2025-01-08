import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/DieuTri.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { useNavigate } from "react-router-dom";

const DieuTri = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const itemsPerPage = 10; // Số lượng mục trên mỗi trang

  const fetchDieuTriData = async (page = 1) => {
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/DieuTri?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();

      if (data.success) {
        setData(data.data); // Lưu dữ liệu
        setTotalPages(data.totalPages || 1); // Tổng số trang từ API
      } else {
        console.error('Lỗi khi lấy dữ liệu điều trị');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (direction) => {
    const nextPage = currentPage + direction;
    if (nextPage > 0 && nextPage <= totalPages) {
      setCurrentPage(nextPage);
      fetchDieuTriData(nextPage);
    }
  };

  const handleAdd = () => {
    navigate('/CRUDDieuTri', { state: { action: 'add' } });
  };

  const handleEdit = (item) => {
    navigate('/CRUDDieuTri', { state: { action: 'edit', item } });
  };

  useEffect(() => {
    fetchDieuTriData(currentPage);
  }, [currentPage]);

  return (
    <div className="container">
      <Menu1 />
      <main className="main-content">
        <Search1 />
        <div className="content">
          <div className="content-header">
            <h2>Quản lý điều trị</h2>
            <button className="add-btn" onClick={handleAdd}>Thêm điều trị</button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã điều trị</th>
                  <th>Hồ sơ bệnh án</th>
                  <th>Mô tả</th>
                  <th>Phương pháp</th>
                  <th>Kết quả</th>
                  <th>Ngày điều trị</th>
                  <th>Đã sử dụng</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8">Đang tải dữ liệu...</td></tr>
                ) : (
                  data.map((dieutri) => {
                    const formattedDate = new Date(dieutri.NgayDieuTri).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });

                    return (
                      <tr key={dieutri.MaDieuTri}>
                        <td>{dieutri.MaDieuTri}</td>
                        <td>{dieutri.MaHoSo}</td>
                        <td>{dieutri.MoTa}</td>
                        <td>{dieutri.PhuongPhap}</td>
                        <td>{dieutri.KetQua}</td>
                        <td>{formattedDate}</td>
                        <td>{dieutri.DaSuDung}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn green" onClick={() => handleEdit(dieutri)}>Sửa</button>
                            <button className="action-btn red"
                              onClick={async () => {
                                if (window.confirm('Bạn có chắc muốn xóa?')) {
                                  await fetch(
                                    `http://localhost:5000/api/DieuTri/${dieutri.MaDieuTri}`,
                                    { method: 'DELETE' }
                                  );
                                  fetchDieuTriData(currentPage);
                                }
                              }}
                            >Xóa</button>
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

export default DieuTri;
