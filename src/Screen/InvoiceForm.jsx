// App.jsx
import React from 'react';
import { Bell, Search, ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';
import '../Styles/InvoiceForm.css';
import Menu1 from '../components/Menu';
import { useNavigate } from "react-router-dom";
import Search1 from '../components/seach_user';
const InvoiceForm = () => {
  const navigate = useNavigate(); // Hook để điều hướng

  const handleAddBill = () => {
    navigate("/addinvoice"); // Chuyển sang route '/them-hoa-don'
  };
  return (
    <div className="container">
      
      <Menu1/>
      
      <main className="main-content">
      <Search1/>

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
                <tr>
                  <td>HD001</td>
                  <td className="patient-id">BN001</td>
                  <td>BS001</td>
                  <td>135,000VND</td>
                  <td>24/12/2021 8h30</td>
                  <td className="status-unpaid">Chưa thanh toán</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn">Xem hóa đơn chi tiết</button>
                      <button className="action-btn">Sửa dữ liệu</button>
                      <button className="action-btn">Thanh toán</button>
                      <button className="action-btn">Xuất hóa đơn</button>
                    </div>
                  </td>
                </tr>
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