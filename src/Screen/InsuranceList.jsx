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
   const themThongBao = async (name, type, feature, data ) => {
      if (!name || !type || !feature) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      const notification = { Name: name, Loai: type, ChucNang: feature, Data: data };

      try {
              const response = await fetch("http://localhost:5000/api/thongbao", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(notification),
              });

              const result = await response.json();
              if (response.ok) {
                  //window.location.reload(true);
              } else {
                  alert(result.message);
              }
          } catch (error) {
            console.error("Lỗi khi thêm thông báo:", error);
            alert("Có lỗi xảy ra!");
          }
    }

  return (
    <div className="container">
      <Menu1 />
      <div className="main-content">
            <div
                className="content-chuyendoi"
                style={{
                    borderRadius: "10px",
                    marginBottom: "10px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width:"100%" }}>
                    <button  style={{
                                marginTop: "-20px",

                                padding: "10px 20px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                height: "50px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                    onClick={() => navigate(-1)}
                    >
                   <i class="fa-solid fa-right-from-bracket fa-rotate-180 fa-lg"></i>
                    </button>
                    <div>
                        <Search1 />
                    </div>
                </div>

        <div
                className="content-chuyendoi">
            <h1 className="page-title">Danh sách bảo hiểm y tế</h1>


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
              <button className="add-button" onClick={handleAdd}>
                        Thêm bảo hiểm y tế
              </button>
            </div>

            {/* Bảng hiển thị dữ liệu */}
            <div className="table-container-cuonngang">
              {loading ? (
                <div className="loading">Đang tải dữ liệu...</div>
              ) : (
                <table className="table-container">
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
                                const tenThongBao = "Thông báo: Xóa bảo hiểm y tế có 'Mã bảo hiểm: "+item.ID +" - Mã bệnh nhân : "+ item.MaBenhNhan +" - với số thẻ bảo hiểm  "+ item.SoHopDongBaoHiem +"' thành công!";
                                const loaiThongBao = "Bảo hiểm y tế";
                                const chucNang = "Xóa dữ liệu";
                                themThongBao(tenThongBao, loaiThongBao, chucNang, item);
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
            </div>


              {/* Phân trang */}
              <div className="pagination">
                <div className="page-info">
                  Trang {currentPage} của {totalPages}
                </div>
                <div className="page-controls">
                  <button className="page-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                     <i className="fas fa-chevron-left" style={{ fontSize: '20px' }}></i>
                  </button>
                  <button className="page-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    <i className="fas fa-chevron-right" style={{ fontSize: '20px' }}></i>
                  </button>
                </div>
              </div>

         </div>
      </div>
    </div>
  );
};

export default InsuranceList;
