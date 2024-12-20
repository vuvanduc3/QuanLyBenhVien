import React from 'react';
import { Search, Clock, Package, Heart, FileText, List, Activity, LayoutList, Grid, Settings, LogOut, Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/InsurancePayment.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
const InsurancePayment = () => {
  const menuItems = [
    { icon: <Clock />, text: "Lịch hẹn" },
    { icon: <Package />, text: "Danh sách thuốc" },
    { icon: <Heart />, text: "Hồ sơ bệnh án" },
    { icon: <FileText />, text: "Đơn thuốc" },
    { icon: <List />, text: "Xét nghiệm" },
    { icon: <Activity />, text: "Lịch sử điều trị" },
    { icon: <Grid />, text: "Hóa đơn" },
    { icon: <LayoutList />, text: "Hóa đơn chi tiết", active: true },
    { icon: <Settings />, text: "Settings" },
    { icon: <LogOut />, text: "Logout" }
  ];

  const paymentData = [
    {
      id: "00001",
      invoiceId: "BN001",
      insuranceId: "Kutch Green Apt.",
      patientId: "0123 xxx xxx",
      amount: "800.000 VND",
      paymentDate: "23/12/2025"
    }
  ];

  return (
    <div className="container">
       <Menu1/>
      {/* Main Content */}
      <div className="main-content">
      <Search1/>

        <h1 style={{fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem'}}>
          Quản lý chi phí bảo hiểm y tế
        </h1>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã hóa đơn</th>
                <th>Mã bảo hiểm</th>
                <th>Mã bệnh nhân</th>
                <th>Số tiền đã thanh toán</th>
                <th>Ngày thanh toán</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.invoiceId}</td>
                  <td>{item.insuranceId}</td>
                  <td>{item.patientId}</td>
                  <td>{item.amount}</td>
                  <td>{item.paymentDate}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-button">
                        <Edit size={16} />
                      </button>
                      <button className="action-button delete">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="pagination">
            <div className="pagination-info">
              Trang 1 của 84
            </div>
            <div className="pagination-buttons">
              <button className="pagination-button" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="pagination-button">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsurancePayment;