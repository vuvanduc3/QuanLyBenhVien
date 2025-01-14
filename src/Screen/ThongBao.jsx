import React, { useState, useEffect } from "react";
import "../Styles/Setting.css";
import Menu1 from "../components/Menu";
import Search1 from "../components/seach_user";
import Cookies from "js-cookie";

const App = () => {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null); // ID của thông báo được nhấn
  const [selectedType, setSelectedType] = useState(null); // Loại thông báo được chọn
  const [activeButton, setActiveButton] = useState(null); // Button đang được nhấn

  useEffect(() => {
    const cookie = Cookies.get("Theme");
    if (cookie === "dark") {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [theme]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/thongbao");
        const data = await response.json();

        if (data.success) {
          setNotifications(data.data);
          setFilteredNotifications(data.data); // Lưu tất cả thông báo ban đầu
        } else {
          console.error("❌ Lỗi lấy dữ liệu thông báo:", data.message);
        }
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleItemClick = (id) => {
    setActiveId(id); // Đặt ID của thông báo được nhấn
  };

  // Hàm để chọn loại thông báo và lọc danh sách theo loại đó
  const handleSelectType = (type) => {
    setSelectedType(type); // Đặt loại thông báo đã chọn
    setActiveButton(type); // Đánh dấu button được nhấn
    if (type === "all") {
      setFilteredNotifications(notifications); // Nếu chọn "Tất cả", hiển thị tất cả thông báo
    } else {
      setFilteredNotifications(
        notifications.filter((notification) => notification.Loai === type)
      ); // Lọc thông báo theo loại
    }
  };

  // Lấy danh sách các loại thông báo duy nhất từ dữ liệu
  const notificationTypes = [...new Set(notifications.map((notification) => notification.Loai))];

  // Hàm đánh dấu thông báo là đã đọc
  const markAsRead = async (notificationID) => {
    try {
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
        setFilteredNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.ID === notificationID
              ? { ...notification, DaDoc: 1 }
              : notification
          )
        );
      } else {
        console.error("❌ Lỗi khi cập nhật thông báo:", data.message);
      }
    } catch (err) {
      console.error("❌ Lỗi khi gửi yêu cầu:", err.message);
    }
  };

  return (
    <div className="container">
      <Menu1 />
      <main className="main-content">
        <Search1 />
        <div className="content-chuyendoi">
          <h2>
            <p>Danh sách thông báo</p>
          </h2>

          {/* Tạo button cho mỗi loại thông báo */}
          <div className="button-group">
            <button
              className={`button ${activeButton === "all" ? "active" : ""}`}
              onClick={() => handleSelectType("all")}
            >
              Tất cả
            </button>
            {notificationTypes.map((type) => (
              <button
                key={type}
                className={`button ${activeButton === type ? "active" : ""}`}
                onClick={() => handleSelectType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="notification-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.ID}
                className={`notification-item ${
                  activeId === notification.ID ? "active" : ""
                }`} // Thêm class "active" nếu là thông báo được nhấn
                onClick={() => handleItemClick(notification.ID)}
              >
                <h3>{notification.Name}</h3>
                <p>{new Date(notification.Ngay).toLocaleString()}</p>
                <p>{notification.Loai}</p>
                <p>{notification.ChucNang}</p>

                {/* Button để đánh dấu thông báo là đã đọc */}
                {notification.DaDoc === 0 && (
                  <button onClick={() => markAsRead(notification.ID)}>
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
