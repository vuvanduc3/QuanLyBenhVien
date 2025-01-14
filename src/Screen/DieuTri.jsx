import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/DieuTri.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { useNavigate, useLocation } from "react-router-dom";

const DieuTri = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { action, item } = location.state || {}; // Lấy action và item từ params

  const [MaBenhNhans, setMaBenhNhans] = useState('');
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Trạng thái sắp xếp
  const [filter, setFilter] = useState({
    MaDieuTri: '',
    MaHoSo: '',
    MaBenhNhan: '',
  });

  const itemsPerPage = 7;

  useEffect(() => {
    if (action === 'xem' && item) {
      setMaBenhNhans(item.MaBenhNhan);
    }
  }, [action, item]);

  useEffect(() => {
    if (MaBenhNhans) {
      const filtered = originalData.filter(data => data.MaBenhNhan === MaBenhNhans);
      setFilteredData(filtered);
    } else {
      setFilteredData(originalData);
    }
  }, [MaBenhNhans, originalData]);

  const fetchDieuTriData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/DieuTri`);
      const data = await response.json();

      if (data.success) {
        setOriginalData(data.data);
        setFilteredData(data.data);
        setTotalPages(Math.ceil(data.data.length / itemsPerPage));
      } else {
        console.error('Lỗi khi lấy dữ liệu điều trị');
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (direction) => {
    const nextPage = currentPage + direction;
    if (nextPage > 0 && nextPage <= totalPages) {
      setCurrentPage(nextPage);
    }
  };

  const handleAdd = (item) => {
    navigate('/CRUDDieuTri', { state: { action: 'add', item } });
  };

  const handleEdit = (item) => {
    navigate('/CRUDDieuTri', { state: { action: 'edit', item } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      try {
        await fetch(`http://localhost:5000/api/DieuTri/${id}`, { method: 'DELETE' });
        fetchDieuTriData();
      } catch (error) {
        console.error('Lỗi khi xóa điều trị:', error);
      }
    }
  };

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortConfig({ key, direction });
    setFilteredData(sortedData);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value,
    });
  };

  const handleFilter = () => {
    const filtered = originalData.filter(dieutri => {
      const maDieuTri = String(dieutri.MaDieuTri);
      const maHoSo = String(dieutri.MaHoSo);
      const maBenhNhan = String(dieutri.MaBenhNhan);

      return (
        maDieuTri.includes(filter.MaDieuTri) &&
        maHoSo.includes(filter.MaHoSo) &&
        maBenhNhan.includes(filter.MaBenhNhan)
      );
    });
    setFilteredData(filtered);
  };

  const resetFilter = () => {
    setFilter({
      MaDieuTri: '',
      MaHoSo: '',
      MaBenhNhan: '',
    });
    setFilteredData(originalData);
  };

  useEffect(() => {
    fetchDieuTriData();
  }, []);

  const displayedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container">
      <Menu1 />
      <main className="main-content">
        <Search1 />
        <div className="content">
          <div className="card-header">
            <h2>Điều trị {MaBenhNhans ? `(Mã bệnh nhân: ${MaBenhNhans})` : ''}</h2>

          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <input
              type="text"
              name="MaDieuTri"
              placeholder="Tìm theo Mã điều trị"
              value={filter.MaDieuTri}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="MaHoSo"
              placeholder="Tìm theo Mã hồ sơ"
              value={filter.MaHoSo}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="MaBenhNhan"
              placeholder="Tìm theo Mã bệnh nhân"
              value={filter.MaBenhNhan}
              onChange={handleFilterChange}
            />
            <button onClick={handleFilter}>Tìm</button>

            <button onClick={resetFilter}>Reset</button>
            <button className="add-btn" onClick={() => handleAdd(item ? item : '')}>Thêm điều trị</button>

          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => sortData('MaDieuTri')}>Mã điều trị</th>
                  <th onClick={() => sortData('MaBenhNhan')}>Mã bệnh nhân</th>
                  <th onClick={() => sortData('MaHoSo')}>Hồ sơ bệnh án</th>
                  <th onClick={() => sortData('MoTa')}>Mô tả</th>
                  <th onClick={() => sortData('PhuongPhap')}>Phương pháp</th>
                  <th onClick={() => sortData('KetQua')}>Kết quả</th>
                  <th onClick={() => sortData('NgayDieuTri')}>Ngày điều trị</th>
                  <th onClick={() => sortData('DaSuDung')}>Đã sử dụng</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9">Đang tải dữ liệu...</td></tr>
                ) : (
                  displayedData.map((dieutri) => {
                    const formattedDate = new Date(dieutri.NgayDieuTri).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });

                    return (
                      <tr key={dieutri.MaDieuTri}>
                        <td>{dieutri.MaDieuTri}</td>
                        <td>{dieutri.MaBenhNhan}</td>
                        <td>{dieutri.MaHoSo}</td>
                        <td>{dieutri.MoTa}</td>
                        <td>{dieutri.PhuongPhap}</td>
                        <td>{dieutri.KetQua}</td>
                        <td>{formattedDate}</td>
                        <td>{dieutri.DaSuDung}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn green" onClick={() => handleEdit(dieutri)}>Sửa</button>
                            <button className="action-btn red" onClick={() => handleDelete(dieutri.MaDieuTri)}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>Trang {currentPage} / {totalPages}</span>
            <div className="pagination-buttons">
              <button className="page-btn" onClick={() => handlePageChange(-1)} disabled={currentPage === 1}>
                <i className="fas fa-chevron-left" style={{ fontSize: '20px' }}></i>
              </button>
              <button className="page-btn" onClick={() => handlePageChange(1)} disabled={currentPage === totalPages}>
                <i className="fas fa-chevron-right" style={{ fontSize: '20px' }}></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DieuTri;
