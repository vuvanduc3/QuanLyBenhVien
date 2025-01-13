import React, { useEffect, useState } from 'react';
import { Filter, RefreshCcw, ChevronLeft, ChevronRight, Trash } from 'lucide-react';
import '../Styles/InsuranceList.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { useNavigate } from 'react-router-dom';

const InsuranceList = () => {
  const [insuranceData, setInsuranceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize] = useState(10); // Số bản ghi mỗi trang
  const [filters, setFilters] = useState({
    MaBenhNhan: '',
    DonViCungCap: '',
    TrangThaiBaoHiem: '',
  });
  const navigate = useNavigate();

  // Fetch API data
  const fetchInsuranceData = async () => {
    setLoading(true);
    try {
      // Gọi API cập nhật trạng thái bảo hiểm
      await fetch('http://localhost:5000/api/capnhaptrangthaibaohiem', { method: 'PUT' });

      // Gọi API lấy dữ liệu bảo hiểm
      const response = await fetch('http://localhost:5000/api/BaoHiemYTe');
      const result = await response.json();

      if (result.success) {
        setInsuranceData(result.data);
      } else {
        console.error('Failed to fetch data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching insurance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  // Bộ lọc dữ liệu
  const filteredData = insuranceData.filter((item) => {
    return (
      (filters.MaBenhNhan === '' || item.MaBenhNhan.includes(filters.MaBenhNhan)) &&
      (filters.DonViCungCap === '' || item.DonViCungCap.includes(filters.DonViCungCap)) &&
      (filters.TrangThaiBaoHiem === '' || item.TrangThaiBaoHiem === filters.TrangThaiBaoHiem)
    );
  });

  // Dữ liệu hiển thị theo phân trang
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Tổng số trang
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Hàm thêm bảo hiểm
  const handleAdd = () => {
    navigate('/QuanLyBaoHiemNguoiDung', { state: { action: 'add' } });
  };

  return (
    <div className="container">
      <Menu1 />
      <div className="main-content">
        <Search1 />
        <h1 className="page-title">Danh sách bảo hiểm y tế</h1>
        <button className="add-button" onClick={handleAdd}>
          Thêm bảo hiểm y tế
        </button>

        {/* Bộ lọc */}
        <div className="filters">
          <div className="filter-item">
            <input
              type="text"
              placeholder="Mã bệnh nhân"
              value={filters.MaBenhNhan}
              onChange={(e) => setFilters({ ...filters, MaBenhNhan: e.target.value })}
            />
          </div>
          <div className="filter-item">
            <input
              type="text"
              placeholder="Đơn vị cung cấp"
              value={filters.DonViCungCap}
              onChange={(e) => setFilters({ ...filters, DonViCungCap: e.target.value })}
            />
          </div>
          <div className="filter-item">
            <select
              value={filters.TrangThaiBaoHiem}
              onChange={(e) => setFilters({ ...filters, TrangThaiBaoHiem: e.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Còn hiệu lực">Còn hiệu lực</option>
              <option value="Hết hạn">Hết hạn</option>
            </select>
          </div>
          <div className="reset-filter" onClick={() => setFilters({ MaBenhNhan: '', DonViCungCap: '', TrangThaiBaoHiem: '' })}>
            <RefreshCcw size={16} />
            Reset Filter
          </div>
        </div>

        {/* Bảng hiển thị dữ liệu */}
        <div className="table-container">
          {loading ? (
            <div className="loading">Đang tải dữ liệu...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã bệnh nhân</th>
                  <th>Đơn vị cung cấp bảo hiểm</th>
                  <th>Số hợp đồng bảo hiểm</th>
                  <th>Số tiền bảo hiểm</th>
                  <th>Ngày hết hạn</th>
                  <th>Trạng thái</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.ID}>
                    <td>{item.ID}</td>
                    <td>{item.MaBenhNhan}</td>
                    <td>{item.DonViCungCap}</td>
                    <td>{item.SoHopDongBaoHiem}</td>
                    <td>{item.SoTienBaoHiem.toLocaleString()} VND</td>
                    <td>{new Date(item.NgayHetHanBaoHiem).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.TrangThaiBaoHiem === 'Còn hiệu lực' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {item.TrangThaiBaoHiem}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn delete"
                        onClick={async () => {
                          if (window.confirm('Bạn có chắc muốn xóa?')) {
                            await fetch(`http://localhost:5000/api/BaoHiemYTe/${item.ID}`, { method: 'DELETE' });
                            fetchInsuranceData();
                          }
                        }}
                      >
                        <Trash size={16} /> Xóa bảo hiểm y tế
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Phân trang */}
          <div className="pagination">
            <div className="page-info">
              Trang {currentPage} của {totalPages}
            </div>
            <div className="page-controls">
              <button className="page-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft size={16} />
              </button>
              <button className="page-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceList;
