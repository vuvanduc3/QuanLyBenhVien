import React, { useState } from 'react';
import { 
  Calendar, 
  Pill, 
  FileText, 
  ClipboardList, 
  TestTube, 
  History, 
  Receipt, 
  Stethoscope,
  FileSpreadsheet, 
  Shield, 
  Wallet, 
  BadgeDollarSign, 
  UserCircle, 
  Settings, 
  LogOut, 
  Table2 
} from 'lucide-react';
import './Menu.css';

const menuItems = [
  { text: "Lịch hẹn", icon: <Calendar size={20} />, path: "/lich-hen" },
  { text: "Danh sách thuốc", icon: <Pill size={20} />, path: "/quanlythuoc" },
  { text: "Hồ sơ bệnh án", icon: <FileText size={20} />, path: "/hosobenhan" },
  { text: "Đơn thuốc", icon: <ClipboardList size={20} />, path: "/donthuoc" },
  { text: "Xét nghiệm", icon: <TestTube size={20} />, path: "/xet-nghiem" },
  { text: "Lịch sử điều trị", icon: <History size={20} />, path: "/lich-su-dieu-tri" },
];

const pageItems = [
  { text: "Page", header: true },
  { text: "Hóa đơn", icon: <Receipt size={20} />, path: "/invoices" },
  { text: "Hóa đơn chi tiết", icon: <FileSpreadsheet size={20} />, path: "/hoa-don-chi-tiet" },  
  { text: "Bảo hiểm y tế", icon: <Shield size={20} />, path: "/medicines" },
  { text: "Vật tư y tế", icon: <Stethoscope size={20} />, path: "/quanlyvattu" },
  { text: "Quản lý BHYT chi trả", icon: <BadgeDollarSign size={20} />, path: "/insurance-payment" },
  { text: "Thanh toán", icon: <Wallet size={20} />, path: "/payments" },
  { text: "Tổng hợp chi phí", icon: <Receipt size={20} />, path: "/dashboad" },
  { text: "Quản lý người dùng", icon: <UserCircle size={20} />, path: "/quanlynguoidung" },
  { text: "Quản lý tài khoản", icon: <UserCircle size={20} />, path: "/quan-ly-tai-khoan" },
  { text: "Table", icon: <Table2 size={20} />, path: "/table" }
];

const bottomItems = [
  { text: "Settings", icon: <Settings size={20} />, path: "/settings" },
  { text: "Logout", icon: <LogOut size={20} />, path: "/logout" }
];

export default function Menu() {
  const [selectedPath, setSelectedPath] = useState(window.location.pathname);

  const handleSelect = (path) => {
    setSelectedPath(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="brand">
          <span className="brand-blue">Benh</span>
          <span>Vien</span>
        </h1>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          {menuItems.map((item, index) => (
            <a 
              key={index} 
              href={item.path} 
              className={`nav-item ${selectedPath === item.path ? 'active' : ''}`}
              onClick={() => handleSelect(item.path)}
            >
              {item.icon}
              <span className="nav-item-text">{item.text}</span>
            </a>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Page</div>
          {pageItems.map((item, index) => (
            !item.header && (
              <a 
                key={index} 
                href={item.path} 
                className={`nav-item ${selectedPath === item.path ? 'active' : ''}`}
                onClick={() => handleSelect(item.path)}
              >
                {item.icon}
                <span className="nav-item-text">{item.text}</span>
              </a>
            )
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        {bottomItems.map((item, index) => (
          <a 
            key={index} 
            href={item.path} 
            className={`nav-item ${selectedPath === item.path ? 'active' : ''}`}
            onClick={() => handleSelect(item.path)}
          >
            {item.icon}
            <span className="nav-item-text">{item.text}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
