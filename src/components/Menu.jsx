import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, 
  Pill, 
  FileText, 
  ClipboardList,
  TestTube,
  History,
  Receipt,
  FileSpreadsheet,
  Shield,
  Wallet,
  BadgeDollarSign,
  UserCircle,
  Settings,
  LogOut,
  Menu
} from 'lucide-react';
import "./Menu.css";
const menuItems = [
  { text: "Lịch hẹn", icon: <Calendar size={20} />, path: "/lich-hen" },
  { text: "Danh sách bảo hiểm y tế", icon: <Pill size={20} />, path: "/medicines" },
  { text: "Hồ sơ bệnh án", icon: <FileText size={20} />, path: "/hosobenhan" },
  { text: "Đơn thuốc", icon: <ClipboardList size={20} />, path: "/donthuoc" },
  { text: "Xét nghiệm", icon: <TestTube size={20} />, path: "/xet-nghiem" },
  { text: "Lịch sử điều trị", icon: <History size={20} />, path: "/lich-su-dieu-tri" },
  { text: "Chi phí bảo hiểm y tế", icon: <Shield size={20} />, path: "/insurance-payment" },
  { text: "Hóa đơn chi tiết", icon: <FileSpreadsheet size={20} />, path: "/hoa-don-chi-tiet" },
  { text: "Thanh toán", icon: <Wallet size={20} />, path: "/payments" },
  { text: "Hóa đơn", icon: <FileText size={20} />, path: "/invoices" },
  { text: "Quản lý thuốc", icon: <ClipboardList size={20} />, path: "/quanlythuoc" },
  { text: "Quản lý tài khoản", icon: <UserCircle size={20} />, path: "/quan-ly-tai-khoan" },
  { text: "Settings", icon: <Settings size={20} />, path: "/settings" },
  { text: "Đăng xuất", icon: <LogOut size={20} />, path: "/logout" }
];

export default function Menu1() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Menu size={20} />
        <h1 className="brand">
          <span className="brand-blue">Benh</span>
          <span>Vien</span>
        </h1>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className="nav-item">
            {item.icon}
            <span className="nav-item-text">{item.text}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}