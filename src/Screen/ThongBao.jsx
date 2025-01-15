import React, { useState, useEffect } from "react";
import "../Styles/Setting.css";
import Menu1 from "../components/Menu";
import Search1 from "../components/seach_user";
import Cookies from "js-cookie";
import { ChevronLeft, Edit, Save, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const App = () => {
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null); // ID của thông báo được nhấn
  const [selectedType, setSelectedType] = useState(null); // Loại thông báo được chọn
  const [activeButton, setActiveButton] = useState(null); // Button đang được nhấn

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    fetchNotifications();
  }, []);

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

  const deleteNotification = async (notificationID) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa thông báo này?");

    if (!confirmDelete) {
      return; // Nếu người dùng chọn Cancel, dừng hàm lại
    }

    try {
      const response = await fetch(`http://localhost:5000/api/thongbao/${notificationID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.ID !== notificationID)
        );
        setFilteredNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.ID !== notificationID)
        );
        fetchNotifications();
      } else {
        console.error("❌ Lỗi khi xóa thông báo:", data.message);
      }
    } catch (err) {
      console.error("❌ Lỗi khi gửi yêu cầu xóa:", err.message);
    }
  };

  const indexOfLastNotification = currentPage * itemsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - itemsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container">
      <Menu1 />
      <main className="main-content">

            <div
                className="content-chuyendoi"
                style={{
                    borderRadius: "10px",
                    marginBottom: "10px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width:"100%" }}>
                    <button  style={{
                                marginTop: "-20px",
                                marginLeft: "30px",
                                padding: "10px 20px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                height: "50px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                    onClick={() => navigate(-1)}
                    >
                   <i class="fa-solid fa-right-from-bracket fa-rotate-180 fa-lg"></i>
                    </button>
                    <div>
                        <Search1 />
                    </div>
                </div>

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
            {currentNotifications.map((notification) => (
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
                <p>{notification.DuLieu}</p>

                {/* Button để đánh dấu thông báo là đã đọc */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  {notification.DaDoc === 0 && (
                    <div className="button-group">
                      <button
                        style={{ marginRight: "5px" }}
                        onClick={() => markAsRead(notification.ID)}
                      >
                        Đánh dấu đã đọc
                      </button>
                    </div>
                  )}
                  <div className="button-group">
                    <button
                      style={{ background: "red" }}
                      onClick={() => deleteNotification(notification.ID)}
                      className="action-button red"
                    >
                      Xóa thông báo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>{currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
