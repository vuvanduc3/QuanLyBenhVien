import React, { useEffect, useState } from 'react';
import { Bell, Search, ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';
import '../Styles/InvoiceForm.css';
import Menu1 from '../components/Menu';
import { useNavigate } from "react-router-dom";
import Search1 from '../components/seach_user';

const InvoiceForm = () => {
  const navigate = useNavigate(); // Hook để điều hướng
  const [invoices, setInvoices] = useState([]); // State để lưu trữ danh sách hóa đơn
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [itemsPerPage] = useState(5); // Số lượng hóa đơn mỗi trang
  const [paginatedInvoices, setPaginatedInvoices] = useState([]); // Hóa đơn của trang hiện tại

  // Hàm gọi API để lấy dữ liệu
  const fetchInvoices = async () => {
    setLoading(true); // Bắt đầu quá trình tải

    try {
      // Gọi API cập nhật tổng tiền trước
      const updateResponse = await fetch('http://localhost:5000/api/updatetongtienvienphi', {
        method: 'PUT', // Sử dụng phương thức POST nếu cần
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ /* Tham số cần thiết cho API */ }),
      });

      const updateData = await updateResponse.json();

      if (!updateData.success) {
            console.error('Lỗi khi cập nhật tổng tiền');
            return;
      }

      const updateResponse2 = await fetch('http://localhost:5000/api/capnhaptinhtrangthanhtoan', {
           method: 'PUT', // Sử dụng phương thức POST nếu cần
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ /* Tham số cần thiết cho API */ }),
         });

         const updateData2 = await updateResponse2.json();

         if (!updateData2.success) {
           console.error('Lỗi khi cập nhật tình trạng thanh toán');
           return;
      }

      // Sau khi cập nhật tổng tiền thành công, gọi API lấy dữ liệu viện phí
      const response = await fetch('http://localhost:5000/api/vienphi');
      const data = await response.json();

      if (data.success) {
        setInvoices(data.data); // Lưu dữ liệu vào state invoices
      } else {
        console.error('Lỗi khi lấy dữ liệu viện phí');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setLoading(false); // Kết thúc quá trình tải dữ liệu
    }
  };

  // Tính toán hóa đơn cho trang hiện tại và cập nhật paginatedInvoices
  useEffect(() => {
      const lastIndex = currentPage * itemsPerPage;
      const firstIndex = lastIndex - itemsPerPage;
      setPaginatedInvoices(invoices.slice(firstIndex, lastIndex)); // Lấy phần dữ liệu cho trang hiện tại
  }, [invoices, currentPage, itemsPerPage]);

  // Hàm điều hướng giữa các trang
  const goToPage = (page) => {
    if (page > 0 && page <= totalPages()) {
      setCurrentPage(page);
    }
  };

  // Tính tổng số trang
  const totalPages = () => {
    return Math.ceil(invoices.length / itemsPerPage);
  };

  // Gọi API khi component được render lần đầu
  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleAddBill = () => {
    navigate('/addinvoice', { state: { action: 'add' } });
  };

  const handleEditBill = (item) => {
      navigate('/addinvoice', { state: { action: 'edit', item } });
  };

  const handleChuyenTrang = (item) => {
        navigate('/hoa-don-chi-tiet', { state: { action: 'edit', item } });
  };

  const handleChuyenTrang2 = (item) => {
        navigate('/tra-cuu-va-nhap-hoa-don', { state: { action: 'edit', item } });
  };

  const handleChuyenTrangHD = (item) => {
    navigate('/XuatHoaDon', { state: { action: 'edit', item } });
  };

  const handleChuyenTrangAddPayment = (item) => {
      navigate('/addPayment', { state: { action: 'add', item } });
  };

  const handleEditPayment = (paymentId) => {
      navigate(`/editPayment/${paymentId}`);
  };


  return (
    <div className="container">
      <Menu1 />
      <main className="main-content">
        <Search1 />

        <div className="content">
          <div className="content-header">
            <h2>Quản lý hóa đơn</h2>
            <button className="add-btn" onClick={handleAddBill}>Thêm hóa đơn</button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Mã bệnh nhân</th>
                  <th>Mã bác sĩ</th>
                  <th>Tổng tiền</th>
                  <th>Ngày nhập hóa đơn</th>
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
                      <td className="patient-id">{invoice.MaBenhNhan}</td>
                      <td>{invoice.MaBacSi}</td>
                      <td>{invoice.TongTien.toLocaleString()} VND</td>
                      <td>{new Date(invoice.NgayLapHoaDon).toLocaleString()}</td>
                      <td className={invoice.TinhTrang === "Chưa thanh toán" ? "status-unpaid" : "status-paid"}>
                        {invoice.TinhTrang}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn" onClick={() => handleChuyenTrang(invoice)}>Xem hóa đơn chi tiết</button>
                          <button className="action-btn" onClick={() => handleEditBill(invoice)}>Sửa dữ liệu</button>
                          <button className="action-btn"
                            onClick={async () => {
                              if (window.confirm('Bạn có chắc muốn xóa?')) {
                                await fetch(
                                  `http://localhost:5000/api/vienphi/${invoice.MaHoaDon}`,
                                  { method: 'DELETE' }
                                );
                                fetchInvoices();
                              }
                            }}
                          >Xóa hóa đơn</button>
                          <button className="action-btn" onClick={() => handleChuyenTrangHD(invoice)}>Xuất hóa đơn</button>
                          {/* Ẩn nút Thanh toán và Tra cứu & nhập nếu hóa đơn đã thanh toán */}
                          {invoice.TinhTrang !== "Đã thanh toán" && (
                            <>
                              <button className="action-btn" onClick={() => handleChuyenTrangAddPayment(invoice)}>Thanh toán</button>

                              <button className="action-btn" onClick={() => handleChuyenTrang2(invoice)}>Tra cứu & nhập</button>
                            </>
                          )}
                          {invoice.TinhTrang === "Đã thanh toán" && (
                            <>
                              <button className="action-btn brown"
                                onClick={() => handleEditPayment(invoice.MaHoaDon)}
                              >Xem thanh toán
                              </button>
                            </>
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
              <button className="page-btn" onClick={() => goToPage(currentPage - 1)}>
                 <i className="fas fa-chevron-left" style={{ fontSize: '20px' }}></i>
              </button>
              <button className="page-btn" onClick={() => goToPage(currentPage + 1)}>
                 <i className="fas fa-chevron-right" style={{ fontSize: '20px' }}></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceForm;
