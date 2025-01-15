import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Clock, PackageSearch, Heart, ClipboardList, Shield, Users,
    Wallet, FileText, LogOut, Menu, Search
  } from 'lucide-react';

import "../Styles/Setting.css";
import Cookies from 'js-cookie';

export default function Search1() {
    const [loading, setLoading] = useState(true);
    const [DangDangNhap, setDangDangNhap] = useState('');
    const [Hinh, setHinh] = useState('');
    const [HoVaTen, setHoVaTen] = useState('');
    const [VaiTro, setVaiTro] = useState('');
    const navigate = useNavigate();

    const [soThongBaoChuaDoc, setSoThongBaoChuaDoc] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const [chuaDocNotifications, setChuaDocNotifications] = useState([]); // Danh sách thông báo chưa đọc
    const [notifications, setNotifications] = useState([]);



    const handleNavigateToCaiDatThongTinCaNhan = () => {
        navigate("/quan-ly-tai-khoan"); // Điều hướng đến trang đăng ký
        Cookies.set('selectedPath', '/quan-ly-tai-khoan', { expires: 7 });
    };



    useEffect(() => {
        const fetchLoginInfo = async () => {
            try {
                // Gọi API /api/login_info
                const response = await fetch('http://localhost:5000/api/login_info');
                if (!response.ok) throw new Error('Không thể lấy dữ liệu từ /api/login_info');
                const loginData = await response.json();
                console.log('Dữ liệu login_info:', loginData);

                if (loginData.success && loginData.data.length > 0) {
                    const firstLogin = loginData.data[0]; // Lấy dòng đầu tiên
                    setDangDangNhap(firstLogin.DangDangNhap); // Lưu ID vào state
                    return firstLogin.DangDangNhap; // Trả về ID để sử dụng tiếp
                }
            } catch (error) {
                console.error('Lỗi khi gọi API login_info:', error);
            }
            return null; // Trả về null nếu lỗi
        };

        const fetchUsers = async (loginID) => {
            try {
                // Gọi API /api/nguoidung
                const response = await fetch('http://localhost:5000/api/nguoidung');
                if (!response.ok) throw new Error('Không thể lấy dữ liệu từ /api/nguoidung');
                const userData = await response.json();
                console.log('Dữ liệu nguoidung:', userData);

                if (userData.success && userData.data.length > 0) {
                    // Tìm người dùng có ID khớp
                    const matchedUser = userData.data.find((user) => user.ID === loginID);
                    if (matchedUser) {
                        setHinh(matchedUser.Hinh);
                        setHoVaTen(matchedUser.TenDayDu);
                        setVaiTro(matchedUser.VaiTro);
                    } else {
                        console.log('Không tìm thấy người dùng với ID:', loginID);
                    }
                }
            } catch (error) {
                console.error('Lỗi khi gọi API nguoidung:', error);
            }
        };

        const fetchData = async () => {
            setLoading(true); // Bắt đầu loading
            const loginID = await fetchLoginInfo(); // Lấy ID đăng nhập
            if (loginID) {
                await fetchUsers(loginID); // Gọi API người dùng nếu có ID
            }
            setLoading(false); // Kết thúc loading
        };

        fetchData(); // Gọi hàm chính
    }, []);

    const [theme, setTheme] = useState('light'); // Trạng thái theme: sáng hoặc tối

      // Dùng useEffect để áp dụng theme khi component load
      useEffect(() => {
        const cookie = Cookies.get('Theme');
        if (cookie === 'dark') {
          document.body.classList.add('dark-theme');
          document.body.classList.remove('light-theme');
          document.body.classList.remove('blue-theme');
        } else  if (cookie === 'light')  {
          document.body.classList.add('light-theme');
          document.body.classList.remove('dark-theme');
          document.body.classList.remove('blue-theme');
        } else {
          document.body.classList.remove('light-theme');
          document.body.classList.remove('dark-theme');
          document.body.classList.add('blue-theme');
        }

      }, [theme]);

      useEffect(() => {
        fetchNotifications();
      }, ); // Chỉ chạy khi component được mount

      const fetchNotifications = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/thongbao"); // Gọi API
            const data = await response.json();

            if (data.success) {
              setNotifications(data.data);

              // Tính số lượng thông báo chưa đọc
              const chuaDoc = data.data.filter((thongBao) => thongBao.DaDoc === 0);
              setChuaDocNotifications(chuaDoc); // Lưu danh sách chưa đọc vào state
              setSoThongBaoChuaDoc(chuaDoc.length); // Lưu số lượng chưa đọc vào state
            } else {
              console.error("❌ Lỗi lấy dữ liệu thông báo:", data.message);
            }
          } catch (err) {
            console.error("❌ Lỗi khi gọi API:", err.message);
          } finally {
            setLoading(false); // Tắt trạng thái loading
      }
    };


      // Hàm chuyển đổi giữa các theme
      const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
        // Lưu cookie
        Cookies.set('Theme', theme, { expires: 1, path: '' });
      };
      const iconColor = theme === 'light' ? '#000' : '#000'; // Đảm bảo khai báo iconColor

    const handleMarkAsRead = async (notificationID) => {
      try {
        // Gửi yêu cầu cập nhật trạng thái DaDoc của thông báo
        const response = await fetch(`http://localhost:5000/api/thongbao/${notificationID}`, {
          method: "PUT", // Cập nhật thông báo
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            DaDoc: 1, // Đánh dấu đã đọc
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Cập nhật lại danh sách thông báo đã đọc
          setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
              notification.ID === notificationID
                ? { ...notification, DaDoc: 1 }
                : notification
            )
          );
          fetchNotifications();
        } else {
          console.error("❌ Lỗi khi cập nhật thông báo:", data.message);
        }
      } catch (err) {
        console.error("❌ Lỗi khi gửi yêu cầu:", err.message);
      }
    };


    return (

    <div className="top-header">
        <div className="search-container">
        </div>
        <div className="user-profile"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
            <div className="notification"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                >
                     <i class="fa-solid fa-phone-volume" style={{
                           fontSize: '20px',
                           color: iconColor,
                           padding: '0px 0px',
                           }}></i>
                <span className="notification-badge">{soThongBaoChuaDoc}</span>
                {isHovered && (
                  <div className="notification-popup">
                    {chuaDocNotifications.length > 0 ? (
                      chuaDocNotifications.map((notification) => (
                        <div key={notification.ID} className="popup-notification-item">
                          <div>
                            <h4>{notification.Name}</h4>
                            <span
                                className="close-btn"
                                onClick={() => handleMarkAsRead(notification.ID)} // Hàm đánh dấu đã đọc
                              >
                                &times; {/* Dấu X */}
                            </span>

                          </div>
                          <p>{new Date(notification.Ngay).toLocaleString()}</p>

                        </div>
                      ))
                    ) : (
                      <p>Không có thông báo chưa đọc</p>
                    )}
                  </div>
                )}


            </div>

            <img src={ Hinh || 'default_image_url'} alt="Hình" className="user-image" onClick={handleNavigateToCaiDatThongTinCaNhan} />

            <div className="user-info" onClick={handleNavigateToCaiDatThongTinCaNhan}>
                <span className="user-name-dark">{HoVaTen}</span>
                <span className="user-role" >{VaiTro}</span>
            </div>
        </div>


    </div>


  );
}
