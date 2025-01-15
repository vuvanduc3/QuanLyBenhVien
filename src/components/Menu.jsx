import React, { useState, useEffect } from 'react';
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
  LogOut

} from 'lucide-react';
import Cookies from 'js-cookie';
import './Menu.css';

const menuItems = [
  { text: "Thống kê", icon: <ClipboardList size={20} />, path: "/dashboard" },
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
  { text: "Quản lý người dùng", icon: <UserCircle size={20} />, path: "/quanlynguoidung" },
  { text: "Thông báo", icon: <i className="fa-regular fa-paper-plane"></i>, path: "/ThongBao" }
];

const bottomItems = [
  { text: "Quản lý tài khoản", icon: <UserCircle size={20} />, path: "/quan-ly-tai-khoan" },
  { text: "Settings", icon: <Settings size={20} />, path: "/CaiDat" },
  { text: "Logout", icon: <LogOut size={20} />, path: "/Login" }
];

export default function Menu() {
  const [selectedPath, setSelectedPath] = useState(window.location.pathname);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleSelect = (path) => {
    setSelectedPath(path);
    Cookies.set('selectedPath', path, { expires: 7 });
  };

  const toggleSidebar = () => {
      setSidebarVisible(!sidebarVisible);
  };

  const [theme, setTheme] = useState('light');
  useEffect(() => {

    menuItems.forEach((item) => {
      if (window.location.pathname === item.path) {
        // Thực hiện hành động khi tìm thấy phần tử phù hợp
        Cookies.set('selectedPath', window.location.pathname, { expires: 7 });
      }
    });

    pageItems.forEach((item) => {
      if (window.location.pathname === item.path) {
        // Thực hiện hành động khi tìm thấy phần tử phù hợp
         Cookies.set('selectedPath', window.location.pathname, { expires: 7 });
      }
    });

    bottomItems.forEach((item) => {
      if (window.location.pathname === item.path) {
        // Thực hiện hành động khi tìm thấy phần tử phù hợp
        Cookies.set('selectedPath', window.location.pathname, { expires: 7 });
      }
    });

    const cookiePath = Cookies.get('selectedPath');
    if (cookiePath) {
      setSelectedPath(cookiePath);
    }

    const cookieTheme = Cookies.get('Theme');
    if (cookieTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      setTheme('dark');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      setTheme('light');
    }
  }, []);

  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(true);
  const [isCostMenuOpen, setIsCostMenuOpen] = useState(true);

  const toggleTaskMenu = () => {
    setIsTaskMenuOpen(!isTaskMenuOpen);
  };

  const toggleCostMenu = () => {
    setIsCostMenuOpen(!isCostMenuOpen);
  };


  return (
    <div>
        <button className="menu-toggle" onClick={toggleSidebar}>
           <i className="fa fa-bars"></i> {/* This will show a hamburger icon */}
        </button>

        <div className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
          <div className="sidebar-header">
            <h1 className="brand">
              <span className="brand-blue">Benh</span>
              <span style={{color:"#000"}}>Vien</span>
            </h1>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title" onClick={toggleTaskMenu}>
                Tác vụ
              </div>
              {isTaskMenuOpen && (
                menuItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.path}
                    className={`nav-item ${selectedPath === item.path ? 'active' : ''}`}
                    onClick={() => handleSelect(item.path)}
                  >
                    {item.icon}
                    <span className="nav-item-text">{item.text}</span>
                  </a>
                ))
              )}
            </div>

            <div className="nav-section">
              <div className="nav-section-title" onClick={toggleCostMenu}>
               Chi phí
              </div>
              {isCostMenuOpen && (
                pageItems.map((item, index) => (
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
                ))
              )}
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
    </div>
  );
}
