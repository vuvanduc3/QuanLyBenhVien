import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/LichKham.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { useNavigate } from "react-router-dom";

const LichKham = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]); // Danh sách lịch khám hiện tại (sau khi phân trang, lọc và sắp xếp)
  const [allInvoices, setAllInvoices] = useState([]); // Dữ liệu gốc, chưa qua phân trang, lọc
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const itemsPerPage = 7; // Số bản ghi mỗi trang

  // Bộ lọc
  const [filter, setFilter] = useState({
    patientId: '',
    doctorId: '',
    date: ''
  });

  // Sắp xếp
  const [sort, setSort] = useState({
    column: 'NgayKham', // Cột mặc định là Ngày khám
    direction: 'asc' // Sắp xếp tăng dần
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value
    }));
  };

  const handleSort = (column) => {
    const newDirection = sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ column, direction: newDirection });
  };

  // Hàm tải dữ liệu từ API
  const fetchInvoicesFromAPI = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/LichKham');
      const data = await response.json();

      if (data.success) {
        setAllInvoices(data.data); // Lưu toàn bộ dữ liệu
      } else {
        console.error('Lỗi khi lấy dữ liệu lịch khám');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lọc dữ liệu theo bộ lọc
  const filterInvoices = () => {
    return allInvoices.filter((lichKham) => {
      const matchesPatientId = !filter.patientId || String(lichKham.MaBenhNhan).includes(filter.patientId);
      const matchesDoctorId = !filter.doctorId || String(lichKham.MaBacSi).includes(filter.doctorId);
      const matchesDate = !filter.date || String(lichKham.NgayKham) === filter.date;

      return matchesPatientId && matchesDoctorId && matchesDate;
    });
  };

  // Hàm sắp xếp dữ liệu
  const sortInvoices = (data) => {
    return data.sort((a, b) => {
      const valueA = a[sort.column];
      const valueB = b[sort.column];

      if (valueA < valueB) return sort.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Hàm phân trang
  const paginateInvoices = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  };

  // Gọi API một lần và xử lý khi component được render lần đầu
  useEffect(() => {
    fetchInvoicesFromAPI();
  }, []);

  // Khi có sự thay đổi ở filter, sort hoặc currentPage, cập nhật lại dữ liệu
  useEffect(() => {
    let filteredInvoices = filterInvoices();
    let sortedInvoices = sortInvoices(filteredInvoices);
    let paginatedInvoices = paginateInvoices(sortedInvoices);

    setInvoices(paginatedInvoices);
    setTotalPages(Math.ceil(filteredInvoices.length / itemsPerPage));
  }, [filter, sort, currentPage, allInvoices]); // Gọi lại khi có sự thay đổi

  // Chuyển trang
  const handlePageChange = (direction) => {
    const nextPage = currentPage + direction;
    if (nextPage > 0 && nextPage <= totalPages) {
      setCurrentPage(nextPage);
    }
  };

  const handleAdd = () => {
    navigate('/CRUDLichKham', { state: { action: 'add' } });
  };

  const handleEdit = (item) => {
    navigate('/CRUDLichKham', { state: { action: 'edit', item } });
  };

  const handleAddHSBA = (item) => {
    navigate('/hosobenhan/add', { state: { action: 'add', item } });
  };

  const handleReset = () => {
    setFilter({
      patientId: '',
      doctorId: '',
      date: '',
    });
    setCurrentPage(1); // Reset to first page after reset
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
      <main className="main-content">
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

        <div className="content-chuyendoi">
          <div className="content-header">
            <h2>Quản lý lịch khám</h2>


          </div>

          <div className="filter-container-chuyendoi">
            <input
              type="text"
              placeholder="Mã bệnh nhân"
              name="patientId"
              value={filter.patientId}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              placeholder="Mã bác sĩ"
              name="doctorId"
              value={filter.doctorId}
              onChange={handleFilterChange}
            />
            <input
              type="date"
              name="date"
              value={filter.date}
              onChange={handleFilterChange}
            />

            <button className="add-btn" onClick={handleReset}>Reset</button>
            <button className="add-btn" onClick={handleAdd}>Thêm lịch hẹn</button>

          </div>

          <div className="table-container-cuonngang">
            <table className="table-container">
              <thead>
                <tr>
                  <th onClick={() => handleSort('MaLichKham')}>Mã lịch khám {sort.column === 'MaLichKham' && (sort.direction === 'asc' ? ' ↑' : ' ↓')}</th>
                  <th onClick={() => handleSort('MaBenhNhan')}>Mã bệnh nhân {sort.column === 'MaBenhNhan' && (sort.direction === 'asc' ? ' ↑' : ' ↓')}</th>
                  <th onClick={() => handleSort('MaBacSi')}>Mã bác sĩ {sort.column === 'MaBacSi' && (sort.direction === 'asc' ? ' ↑' : ' ↓')}</th>
                  <th onClick={() => handleSort('TenDayDu')}>Tên đầy đủ {sort.column === 'TenDayDu' && (sort.direction === 'asc' ? ' ↑' : ' ↓')}</th>
                  <th onClick={() => handleSort('MaBenhNhanKhamBenh')}>Mã khám bệnh {sort.column === 'MaBenhNhanKhamBenh' && (sort.direction === 'asc' ? ' ↑' : ' ↓')}</th>
                  <th onClick={() => handleSort('NgayKham')}>Ngày khám {sort.column === 'NgayKham' && (sort.direction === 'asc' ? ' ↑' : ' ↓')}</th>
                  <th onClick={() => handleSort('GioKham')}>Giờ khám {sort.column === 'GioKham' && (sort.direction === 'asc' ? ' ↑' : ' ↓')}</th>
                  <th onClick={() => handleSort('TrangThai')}>Trạng thái {sort.column === 'TrangThai' && (sort.direction === 'asc' ? ' ↑' : ' ↓')}</th>
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
                        <td>{lichKham.TenDayDu}</td>
                        <td>{lichKham.MaBenhNhanKhamBenh}</td>
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
                                    fetchInvoicesFromAPI();

                                    const tenThongBao = "Thông báo: Xóa lịch hẹn cho bệnh nhân có Mã lịch khám: "+ lichKham.MaLichKham +"- Họ tên: "+ lichKham.TenDayDu +" thành công!";
                                    const loaiThongBao = "Lịch hẹn";
                                    const chucNang = "Xóa dữ liệu";
                                    themThongBao(tenThongBao, loaiThongBao, chucNang, lichKham);

                                  }
                                }}
                              >Xóa</button>
                            </div>
                            {detailButtonText && (
                              <button
                                className="action-btn brown"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (lichKham.TrangThai === "Hoàn thành") {
                                    navigate(`/chitiethsba/${lichKham.MaBenhNhanKhamBenh}`);
                                  } else if (lichKham.TrangThai === "Đang chờ khám"){
                                    handleAddHSBA(lichKham);
                                  }
                                }}
                              >
                                {detailButtonText}
                              </button>
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
            <div className="page-controls">
              <button className="page-button" onClick={() => handlePageChange(-1)} disabled={currentPage === 1}>
                <ChevronLeft size={20} />
              </button>
              <button className="page-button" onClick={() => handlePageChange(1)} disabled={currentPage === totalPages}>
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
