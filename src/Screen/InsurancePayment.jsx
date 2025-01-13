import React, { useEffect, useState } from 'react';
import { Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/InsurancePayment.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const InsurancePayment = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu đã lọc theo tìm kiếm
  const [editingData, setEditingData] = useState(null); // Lưu thông tin đang sửa
  const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [itemsPerPage] = useState(5); // Số bản ghi mỗi trang

  // Lấy dữ liệu từ API khi component render
  useEffect(() => {
    const api = 'http://localhost:5000/api/getAllChiPhiBHYT'; // Địa chỉ API

    fetch(api)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.data) {
          setPaymentData(data.data);
          setFilteredData(data.data); // Dữ liệu khi chưa tìm kiếm
        } else {
          console.error('Không tìm thấy dữ liệu chi phí BHYT');
        }
      })
      .catch((err) => {
        console.error('Lỗi khi gọi API:', err);
      });
  }, []);

  // Lọc dữ liệu khi thay đổi từ khóa tìm kiếm
  useEffect(() => {
    const filtered = paymentData.filter((item) =>
      item.MaSoTheBHYT.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
  }, [searchTerm, paymentData]);

  // Tính toán dữ liệu hiển thị theo phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Hàm xóa dữ liệu
  const handleDelete = (id) => {
    const api = `http://localhost:5000/api/ChiPhiBHYT/${id}`;

    if (window.confirm('Bạn có chắc muốn xóa dữ liệu này không?')) {
      fetch(api, { method: 'DELETE' })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert('Xóa dữ liệu thành công!');
            setPaymentData(paymentData.filter((item) => item.MaChiPhiBHYT !== id));
          } else {
            console.error('Xóa thất bại:', data.message);
          }
        })
        .catch((err) => console.error('Lỗi khi gọi API xóa:', err));
    }
  };

  // Hàm lưu chỉnh sửa
  const handleUpdate = () => {
    const api = `http://localhost:5000/api/ChiPhiBHYT/${editingData.MaChiPhiBHYT}`;

    fetch(api, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('Cập nhật thành công!');
          setPaymentData(
            paymentData.map((item) =>
              item.MaChiPhiBHYT === editingData.MaChiPhiBHYT ? editingData : item
            )
          );
          setEditingData(null);
        } else {
          console.error('Cập nhật thất bại:', data.message);
        }
      })
      .catch((err) => console.error('Lỗi khi gọi API cập nhật:', err));
  };

  // Chuyển đến trang trước
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Chuyển đến trang kế tiếp
  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container">
      <Menu1 />
      <div className="main-content">
        <Search1 />
        {/* Tìm kiếm */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã số thẻ BHYT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật từ khóa tìm kiếm
            className="search-input"
          />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>
          Quản lý chi phí bảo hiểm y tế
        </h1>

        {editingData && (
          <div className="edit-form">
            <h2 style={{ color: '#000' }}>Chỉnh sửa thông tin</h2>
            <label style={{ color: '#000' }}>
              Mã số thẻ BHYT:
              <input
                type="text"
                value={editingData.MaSoTheBHYT}
                onChange={(e) =>
                  setEditingData({ ...editingData, MaSoTheBHYT: e.target.value })
                }
              />
            </label>
            <label style={{ color: '#000' }}>
              Số tiền BHYT chi trả:
              <input
                type="number"
                value={editingData.SoTienBHYTChiTra}
                onChange={(e) =>
                  setEditingData({ ...editingData, SoTienBHYTChiTra: e.target.value })
                }
              />
            </label>
            <label style={{ color: '#000' }}>
              Ngày thanh toán:
              <input
                type="date"
                value={new Date(editingData.NgayBHYTThanhToan)
                  .toISOString()
                  .split('T')[0]}
                onChange={(e) =>
                  setEditingData({
                    ...editingData,
                    NgayBHYTThanhToan: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </label>
            <button onClick={handleUpdate}>Lưu</button>
            <button onClick={() => setEditingData(null)}>Hủy</button>
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã hóa đơn</th>
                <th>Mã bảo hiểm</th>
                <th>Số tiền đã thanh toán</th>
                <th>Ngày thanh toán</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.MaChiPhiBHYT}>
                  <td>{item.MaChiPhiBHYT}</td>
                  <td>{item.MaSoTheBHYT}</td>
                  <td>{item.MaSoTheBHYT}</td>
                  <td>{item.SoTienBHYTChiTra}</td>
                  <td>{new Date(item.NgayBHYTThanhToan).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => setEditingData(item)}
                      >
                        <Edit size={16} /> Sửa
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(item.MaChiPhiBHYT)}
                      >
                        <Trash size={16} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="pagination">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <ChevronLeft size={16} />
          </button>
          <span>{`Trang ${currentPage} / ${Math.ceil(filteredData.length / itemsPerPage)}`}</span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
            className="pagination-button"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsurancePayment;
