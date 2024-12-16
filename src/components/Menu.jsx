import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, PackageSearch, Heart, ClipboardList, Shield, Users,
  Wallet, FileText, LogOut, Menu 
} from 'lucide-react';
import './Menu.css';

const menuItems = [
  { text: "Dashboard", icon: <Clock size={20} />, path: "/dashboad" },
  { text: "Danh sách bảo hiểm y tế", icon: <PackageSearch size={20} />, path: "/medicines" },
  { text: "Hồ sơ bệnh án", icon: <Heart size={20} />, path: "/medical-records" },
  { text: "Đơn thuốc", icon: <ClipboardList size={20} />, path: "/prescriptions" },
  { text: "Chi phí bảo hiểm y tế", icon: <Shield size={20} />, path: "/insurance-payment" },
  { text: "Thanh toán", icon: <Wallet size={20} />, path: "/payments" },
  { text: "Hóa đơn", icon: <FileText size={20} />, path: "/invoices" },
  { text: "Đăng Xuất", icon: <LogOut size={20} />, path: "/logout" }
];

export default function Menu1() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Menu size={20} />
        <div className="brand">
          <span className="brand-blue">Benh</span>
          <span>Vien</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className="nav-item">
            {item.icon}
            <span>{item.text}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
