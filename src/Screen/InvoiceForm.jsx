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
                  invoices.map((invoice) => (
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
                          <button className="action-btn">Thanh toán</button>
                          <button className="action-btn"  onClick={() => handleChuyenTrangHD(invoice)}>Xuất hóa đơn</button>
                          <button className="action-btn"
                          onClick={() => handleChuyenTrang2(invoice)}
                           >Tra cứu & nhập</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>Trang 1 của 84</span>
            <div className="pagination-buttons">
              <button className="page-btn">
                <ChevronLeft size={20} />
              </button>
              <button className="page-btn">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceForm;
