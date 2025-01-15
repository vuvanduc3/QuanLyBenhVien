import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import '../Styles/InvoiceForm.css';



const InvoiceForm = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [paginatedInvoices, setPaginatedInvoices] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/updatetongtienvienphi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      await fetch('http://localhost:5000/api/capnhaptinhtrangthanhtoan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await fetch('http://localhost:5000/api/vienphi');
      const data = await response.json();

      if (data.success) {
        setInvoices(data.data);
      } else {
        console.error('Lỗi khi lấy dữ liệu viện phí');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
      // Đặt lại trang hiện tại về trang đầu tiên khi thay đổi truy vấn tìm kiếm
      setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    setPaginatedInvoices(invoices.slice(firstIndex, lastIndex));
  }, [invoices, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...invoices].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setInvoices(sortedData);
  };

  const goToPage = (page) => {
    if (page > 0 && page <= totalPages()) {
      setCurrentPage(page);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const maHoaDon = String(invoice.MaHoaDon || '').toLowerCase();
    const maBenhNhan = String(invoice.MaBenhNhan || '').toLowerCase();
    const maBacSi = String(invoice.MaBacSi || '').toLowerCase();
    const searchQueryLower = searchQuery.toLowerCase();

    return (
      maHoaDon.includes(searchQueryLower) ||
      maBenhNhan.includes(searchQueryLower) ||
      maBacSi.includes(searchQueryLower)
    );
  });



  const totalPages = () => {
    return Math.ceil(invoices.length / itemsPerPage);
  };
  const currentInvoices = filteredInvoices.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filteredInvoices = invoices.filter((invoice) => {
      const maHoaDon = String(invoice.MaHoaDon || '').toLowerCase();
      const maBenhNhan = String(invoice.MaBenhNhan || '').toLowerCase();
      const maBacSi = String(invoice.MaBacSi || '').toLowerCase();

      return (
        maHoaDon.includes(lowercasedQuery) ||
        maBenhNhan.includes(lowercasedQuery) ||
        maBacSi.includes(lowercasedQuery)
      );
    });
    setPaginatedInvoices(filteredInvoices.slice(0, itemsPerPage)); // Phân trang lại kết quả tìm kiếm
    setCurrentPage(1); // Đặt lại trang về đầu tiên khi tìm kiếm
  };


 const handleChange = (e) => {
   const value = e.target.value;
   setSearchQuery(value);
   handleSearch(value); // Gọi hàm tìm kiếm mỗi khi người dùng thay đổi
   if (!value) {
     fetchInvoices(); // Nếu không có giá trị tìm kiếm, tải lại tất cả dữ liệu
   }
 };






  const handlePageChange = (page) => {
      setCurrentPage(page);
  };

  const handleAddBill = (e) => {
    e.stopPropagation(); // Ngừng sự kiện click dòng bảng
    navigate('/addinvoice', { state: { action: 'add' } });
  };

  const handleEditBill = (e, item) => {
    e.stopPropagation(); // Ngừng sự kiện click dòng bảng
    navigate('/addinvoice', { state: { action: 'edit', item } });
  };

  const handleChuyenTrang = (e, item) => {
    e.stopPropagation(); // Ngừng sự kiện click dòng bảng
    navigate('/hoa-don-chi-tiet', { state: { action: 'edit', item } });
  };

  const handleChuyenTrang2 = (e, item) => {
    e.stopPropagation(); // Ngừng sự kiện click dòng bảng
    navigate('/tra-cuu-va-nhap-hoa-don', { state: { action: 'edit', item } });
  };

  const handleChuyenTrangHD = (e, item) => {
    e.stopPropagation(); // Ngừng sự kiện click dòng bảng
    navigate('/XuatHoaDon', { state: { action: 'edit', item } });
  };

  const handleChuyenTrangAddPayment = (e, item) => {
    e.stopPropagation(); // Ngừng sự kiện click dòng bảng
    navigate('/addPayment', { state: { action: 'add', item } });
  };

  const handleEditPayment = (e, paymentId) => {
    e.stopPropagation(); // Ngừng sự kiện click dòng bảng
    navigate(`/editPayment/${paymentId}`);
  };

  const handleDelete = async (e, item ) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        await fetch(`http://localhost:5000/api/vienphi/${item.MaHoaDon}`, { method: "DELETE" });
        // Cập nhật trạng thái để loại bỏ hóa đơn đã xóa
        setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.MaHoaDon !== item.MaHoaDon));

        const tenThongBao = "Thông báo: Xóa hóa đơn  có Mã hóa đơn: "+ item.MaHoaDon +"- Mã bệnh nhân: "+ item.MaBenhNhan +" thành công!";
        const loaiThongBao = "Hóa đơn";
        const chucNang = "Xóa dữ liệu";
        themThongBao(tenThongBao, loaiThongBao, chucNang, item);

      } catch (error) {
        console.error("Lỗi khi xóa hóa đơn:", error);
      }
    }
  };
  const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
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
            <h2>Quản lý hóa đơn</h2>
            <button className="add-btn" onClick={handleAddBill}>Thêm hóa đơn</button>
          </div>


          {/* Thêm ô input tìm kiếm */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm theo Mã hóa đơn, Mã bệnh nhân, Mã bác sĩ"
              value={searchQuery}
              onChange={handleChange}
            />
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('MaHoaDon')}>
                    Mã hóa đơn
                    <i className={`fas fa-sort-${sortConfig.key === 'MaHoaDon' && sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                  </th>

                  <th onClick={() => handleSort('MaBenhNhan')}>
                    Mã bệnh nhân
                    <i className={`fas fa-sort-${sortConfig.key === 'MaBenhNhan' && sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                  </th>
                  <th onClick={() => handleSort('MaBacSi')}>
                    Mã bác sĩ
                    <i className={`fas fa-sort-${sortConfig.key === 'MaBacSi' && sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                  </th>
                  <th onClick={() => handleSort('TongTien')}>
                    Tổng tiền
                    <i className={`fas fa-sort-${sortConfig.key === 'TongTien' && sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                  </th>
                  <th onClick={() => handleSort('NgayLapHoaDon')}>
                    Ngày nhập hóa đơn
                    <i className={`fas fa-sort-${sortConfig.key === 'NgayLapHoaDon' && sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                  </th>
                  <th>Trạng thái</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7">Đang tải dữ liệu...</td></tr>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <tr key={invoice.MaHoaDon}>
                      <td>{invoice.MaHoaDon}</td>
                      <td>{invoice.MaBenhNhan}</td>
                      <td>{invoice.MaBacSi}</td>
                      <td>{invoice.TongTien.toLocaleString()} VND</td>
                      <td>{new Date(invoice.NgayLapHoaDon).toLocaleString()}</td>
                      <td className={invoice.TinhTrang === "Chưa thanh toán" ? "status-unpaid" : "status-paid"}>
                        {invoice.TinhTrang}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={(e) => handleChuyenTrang(e, invoice)}
                          >
                            Xem hóa đơn chi tiết
                          </button>
                          <button
                            className="action-btn edit-btn"
                            onClick={(e) => handleEditBill(e, invoice)}
                          >
                            Sửa dữ liệu
                          </button>
                          <button
                            className="action-btn delete-btn"
                                onClick={async () => {
                                  if (window.confirm('Bạn có chắc muốn xóa?')) {
                                    await fetch(
                                      `http://localhost:5000/api/vienphi/${invoice.MaHoaDon}`,
                                      { method: 'DELETE' }
                                    );
                                    const tenThongBao = "Thông báo: Xóa hóa đơn có Mã hóa đơn: "+ invoice.MaHoaDon +"- Mã bệnh nhân: "+ invoice.MaBenhNhan +" thành công!";
                                    const loaiThongBao = "Hóa đơn";
                                    const chucNang = "Xóa dữ liệu";

                                    themThongBao(tenThongBao, loaiThongBao, chucNang, invoice);
                                    fetchInvoices();
                                  }
                                }}
                          >
                            Xóa hóa đơn
                          </button>
                          <button
                            className="action-btn export-btn"
                            onClick={(e) => handleChuyenTrangHD(e, invoice)}
                          >
                            Xuất hóa đơn
                          </button>

                          {invoice.TinhTrang !== "Đã thanh toán" && (
                            <>
                              <button
                                className="action-btn payment-btn"
                                onClick={(e) => handleChuyenTrangAddPayment(e, invoice)}
                              >
                                Thanh toán
                              </button>
                              <button
                                className="action-btn lookup-btn"
                                onClick={(e) => handleChuyenTrang2(e, invoice)}
                              >
                                Tra cứu & nhập
                              </button>
                            </>
                          )}

                          {invoice.TinhTrang === "Đã thanh toán" && (
                            <button
                              className="action-btn view-payment-btn"
                              onClick={(e) => handleEditPayment(e, invoice.MaHoaDon)}
                            >
                              Xem thanh toán
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>Trang {currentPage} của {totalPages()}</span>
            <div className="pagination-buttons">
              <button className="page-btn" onClick={() => goToPage(currentPage - 1)}>Trước</button>
              <button className="page-btn" onClick={() => goToPage(currentPage + 1)}>Tiếp</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceForm;
