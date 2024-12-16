import React from 'react';
import { Search, Clock, Package, Heart, FileText, List, Activity, LayoutList, Grid, Settings, LogOut, Filter, RefreshCcw, ChevronLeft, ChevronRight, Edit, Trash } from 'lucide-react';
import '../Styles/InsuranceList.css';
import Menu1 from '../components/Menu';
const InsuranceList = () => {

  const insuranceData = [
    {
      id: "00001",
      patientId: "BN001",
      provider: "Kutch Green Apt.",
      policyNumber: "0123 xxx xxx",
      coverage: "800.000 VND",
      expiryDate: "23/12/2025",
      status: "Hoạt động"
    }
  ];

  return (
    <div className="container">
      <Menu1/>
      {/* Main Content */}
      <div className="main-content">
        <div className="top-header">
          <div className="search-container">
            <Search className="search-icon" />
            <input type="text" placeholder="Search" className="search-input" />
          </div>
          <div className="user-profile">
            <div className="notification-badge">0</div>
            <img src="/api/placeholder/32/32" alt="User" className="user-avatar" />
            <span>Moni Roy</span>
            <span>Admin</span>
          </div>
        </div>

        <h1 className="page-title">Danh sách bảo hiểm y tế</h1>

        {/* Filters */}
        <div className="filters">
          <div className="filter-item">
            <Filter size={20} />
            <select className="filter-select">
              <option>Mã BN</option>
            </select>
          </div>
          <div className="filter-item">
            <select className="filter-select">
              <option>Ngày hết hạn</option>
            </select>
          </div>
          <div className="filter-item">
            <select className="filter-select">
              <option>Đơn vị</option>
            </select>
          </div>
          <div className="filter-item">
            <select className="filter-select">
              <option>Trạng thái</option>
            </select>
          </div>
          <div className="reset-filter">
            <RefreshCcw size={16} />
            Reset Filter
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
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
              {insuranceData.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.patientId}</td>
                  <td>{item.provider}</td>
                  <td>{item.policyNumber}</td>
                  <td>{item.coverage}</td>
                  <td>{item.expiryDate}</td>
                  <td>
                    <span className="status-badge status-active">
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-button edit">
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
            <div className="page-info">
              Trang 1 của 84
            </div>
            <div className="page-controls">
              <button className="page-button" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="page-button">
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