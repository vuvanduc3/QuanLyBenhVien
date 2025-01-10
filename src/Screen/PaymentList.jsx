import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import "../Styles/PaymentList.css";
import Menu1 from "../components/Menu";
import Search1 from "../components/seach_user";

const PaymentList = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [statusFilter, setStatusFilter] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Thêm state cho tìm kiếm
  const itemsPerPage = 5;
  const navigate = useNavigate();

  console.log(statusFilter);

  const statusMapping = {
    all: 3,
    paid: 1,
    unpaid: 0,
    wait: 2,
  };

  useEffect(() => {
    setIsLoading(true); // Bắt đầu tải dữ liệu khi statusFilter hoặc currentPage thay đổi
    let api = "";
    if (statusFilter === 3) {
      api = `http://localhost:5000/api/ThanhToan?page=${currentPage}&limit=${itemsPerPage}`;
    } else {
      api = `http://localhost:5000/api/ThanhToan?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter}`;
    }
    fetch(api)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setPaymentData(data.data);
          setTotalPages(Math.ceil(data.total / itemsPerPage)); // Tính tổng số trang
        } else {
          console.error("Invalid data format:", data);
        }
        setIsLoading(false); // Kết thúc tải dữ liệu
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setIsLoading(false); // Nếu có lỗi, vẫn kết thúc quá trình tải
      });
  }, [statusFilter, currentPage]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(statusMapping[value]);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (isoString) => {
    if (isoString != null) {
      // Tách riêng phần ngày và giờ từ chuỗi ISO, không chuyển đổi múi giờ
      const [datePart, timePart] = isoString.split("T");
      const timeWithoutMilliseconds = timePart.split(".")[0]; // Loại bỏ phần milliseconds
      return `${datePart.split("-").reverse().join("/")} ${timeWithoutMilliseconds}`;
    } else {
      return "";
    }
  };
  const formatNgaySinh = (ngaySinh) => {
    if (!ngaySinh) return "Không xác định";
    const date = new Date(ngaySinh);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Định dạng 24 giờ
    }).format(date);
  };


  const formatCurrency = (value) => {
    return value.toLocaleString("vi-VN");
  };

  const handleEditPayment = (paymentId) => {
    navigate(`/editPayment/${paymentId}`);
  };

  // Lọc dữ liệu theo searchQuery
  const filteredPaymentData = paymentData.filter((item) => {
    return (
      item.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="container">
      <Menu1 />
      <div className="main-content">
        <Search1 />

        <h1 className="page-title">Danh sách thanh toán</h1>

        <div className="filter-container">
          <select onChange={handleFilterChange} className="status-filter">
            <option value="all">Tất cả</option>
            <option value="paid">Đơn đã thanh toán</option>
            <option value="unpaid">Đơn không thành công</option>
            <option value="wait">Đơn chờ xử lý</option>
          </select>
        </div>
        <div className="filter-container">
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={handleSearchChange}
            className="payment_search-input"
          />
        </div>

        {/* Hiển thị loading khi đang tải dữ liệu */}
        {isLoading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : (
          <div className="table-container">
            <table className="table_paymentList">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã hóa đơn</th>
                  <th>Phương thức</th>
                  <th>Mã bệnh nhân</th>
                  <th>Số tiền</th>
                  <th>Ngày tạo</th>
                  <th>Ngày thanh toán</th>
                  <th>Mã giao dịch</th>
                  <th>Trạng thái</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaymentData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.invoiceId}</td>
                    <td>
                      {item.paymentMethod === 1 ? "Tiền mặt" : "Chuyển khoản"}
                    </td>
                    <td>{item.patientId}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{formatDate(item.paymentCreateDate)}</td>
                    <td>{formatDate(item.paymentDate)}</td>
                    <td>{item.transactionId}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.status === 1
                            ? "status-completed"
                            : item.status === 2
                            ? "status-wait"
                            : "status-pending"
                        }`}
                      >
                        {item.status === 1
                          ? "Đã thanh toán"
                          : item.status === 2
                          ? "Chờ xử lý"
                          : "Không thành công"}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button"
                          onClick={() => handleEditPayment(item.id)}
                        >
                          <Edit size={16} />
                        </button>
                        {/* <button className="action-button delete">
                          <Trash size={16} />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-buttons">
              <button
                className="pagination-button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                Đầu
              </button>
              <button
                className="pagination-button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="pagination-button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
              <button
                className="pagination-button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                Cuối
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default PaymentList;
