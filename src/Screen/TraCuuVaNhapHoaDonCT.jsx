import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/TraCuuVaNhapHoaDonCT.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const DonThuoc = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [activeTab] = useState('prescriptions');
    const [page, setPage] = useState(1);
    const [MaHoaDon, setMaHoaDon] = useState(1);
    const [MaBenhNhan, setMaBenhNhan] = useState('');
    const [filterMaBenhNhan, setFilterMaBenhNhan] = useState(''); // Thêm trạng thái cho bộ lọc
    const totalPages = 84;
    const [activeCategory, setActiveCategory] = useState('prescriptions'); // Trạng thái lưu danh mục đang chọn
    const [activeButton, setActiveButton] = useState('prescriptions'); // Trạng thái lưu button đang chọn
    const [data, setData] = useState({
        history: [],
        prescriptions: [],
        tests: [],
    });
    const [loading, setLoading] = useState(false);

    // Cột hiển thị cho từng danh mục
   const columns = {
       history: ['ID', 'Mã bệnh nhân', 'Mã hồ sơ bệnh án', 'Mã bác sĩ', 'Mô tả','Kết quả', 'Ngày điều trị', 'Action'],
       prescriptions: ['ID', 'Mã bệnh nhân', 'Mã hồ sơ bệnh án', 'Mã bác sĩ', 'Mã thuốc', 'Hướng dẫn sử dụng', 'Số lượng', 'Action'],
       tests: ['ID', 'Mã bệnh nhân', 'Mã hồ sơ bệnh án', 'Mã bác sĩ', 'Tên thử nghiệm/xét nghiệm', 'Kết quả', 'Ngày xét nghiệm', 'Action']
   };


    useEffect(() => {
        setMaHoaDon(state.item.MaHoaDon);
        setMaBenhNhan(state.item.MaBenhNhan);
        setFilterMaBenhNhan(state.item.MaBenhNhan);
    }, [state]);

    // Lấy dữ liệu từ API và lọc theo Mã bệnh nhân
    useEffect(() => {
        let apiUrl = '';
        if (activeCategory === 'prescriptions') {
            apiUrl = 'http://localhost:5000/api/donthuoc';
        } else if (activeCategory === 'tests') {
            apiUrl = 'http://localhost:5000/api/xetnghiem';
        } else if (activeCategory === 'history') {
            apiUrl = 'http://localhost:5000/api/dieutri'; // Thêm API điều trị
        }

        if (apiUrl) {
            fetch(apiUrl)
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        const filteredData = result.data.filter(item =>
                            filterMaBenhNhan ? item.MaBenhNhan?.toString().includes(filterMaBenhNhan) : true
                        );

                        setData(prevData => ({
                            ...prevData,
                            [activeCategory]: filteredData,
                        }));
                    } else {
                        console.error('Failed to fetch data:', result);
                    }
                })
                .catch(error => console.error('Error fetching data:', error))
                .finally(() => setLoading(false));
        }
    }, [activeCategory, filterMaBenhNhan]);


    // Chuyển danh mục hiển thị
    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setPage(1); // Reset page khi chuyển danh mục
        setActiveButton(category); // Cập nhật button đang được chọn
    };

    const handleAdd = (item) => {
        if (item.DaNhapHoaDon === 0) {
            const serviceData = activeCategory === 'prescriptions'
                ? { TenDichVu: item.TenThuoc, SoLuong: item.SoLuongDonThuoc, DonGia: item.GiaThuoc, MaDichVu: item.MaDonThuoc }
                : activeCategory === 'tests'
                ? { TenDichVu: item.TenXetNghiem, SoLuong: 1, DonGia: 1, MaDichVu: item.MaXetNghiem }
                : { TenDichVu: item.MoTa, SoLuong: 1, DonGia: item.ChiPhi, MaDichVu: item.MaDieuTri }; // Thêm cho điều trị

            navigate('/crud-tra-cuu-va-nhap-hoa-don-chi-tiet', {
                state: {
                    action: activeCategory,
                    item,
                    MaHoaDon: MaHoaDon,
                    ...serviceData
                }
            });
        } else {
            alert('Không thể nhập hóa đơn vì hóa đơn đã được nhập!');
        }
    };


    // Định dạng ngày
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã bệnh nhân..."
                    className="search-input"
                    value={filterMaBenhNhan}
                    onChange={(e) => setFilterMaBenhNhan(e.target.value)} // Cập nhật bộ lọc
                />

                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Tra cứu và nhập hóa đơn chi tiết</h2>
                    </div>
                    <div>
                        <span>Mã hóa đơn: {MaHoaDon}</span>
                        <span> - Mã bệnh nhân: {MaBenhNhan}</span>
                    </div>

                    <div className="div-buttons">
                        <button
                            className={`danhmuc-button ${activeButton === 'history' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('history')}
                        >
                            Lịch sử điều trị
                        </button>
                        <button
                            className={`danhmuc-button ${activeButton === 'prescriptions' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('prescriptions')}
                        >
                            Đơn thuốc
                        </button>
                        <button
                            className={`danhmuc-button ${activeButton === 'tests' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('tests')}
                        >
                            Xét nghiệm
                        </button>
                    </div>

                    <div className="table-container">
                        {loading ? (
                            <p>Đang tải dữ liệu...</p>
                        ) : (
                            <table className="prescription-table">
                                <thead>
                                    <tr>
                                        {columns[activeCategory].map((column, index) => (
                                            <th key={index}>{column}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data[activeCategory]?.length > 0 ? (
                                        data[activeCategory].map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.MaDonThuoc || item.MaXetNghiem || item.MaDieuTri}</td>
                                                <td>{item.MaBenhNhan}</td>
                                                <td>{item.MaHoSo}</td>
                                                <td>{item.BacSi}</td>
                                                {activeCategory === 'prescriptions' && (
                                                    <>
                                                        <td>{item.MaThuoc}</td>
                                                        <td>{item.HuongDanSuDung}</td>
                                                        <td>{item.SoLuongDonThuoc}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'tests' && (
                                                    <>
                                                        <td>{item.TenXetNghiem}</td>
                                                        <td>{item.KetQua}</td>
                                                        <td>{formatDate(item.NgayXetNghiem)}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'history' && (
                                                          <>
                                                              <td>{item.MoTa}</td>
                                                              <td>{item.KetQua}</td>
                                                              <td>{formatDate(item.NgayDieuTri)}</td>
                                                          </>
                                                      )}
                                                <td>
                                                    <button
                                                        className={`action-btn ${item.DaNhapHoaDon === 1 ? 'brown' : 'green'}`}
                                                        onClick={() => handleAdd(item)}
                                                    >
                                                        {item.DaNhapHoaDon === 1 ? 'Đã nhập hóa đơn' : 'Nhập hóa đơn'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={columns[activeCategory].length}>Không có dữ liệu</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="pagination">
                        <span className="page-info">
                            Trang {page} của {totalPages}
                        </span>
                        <div className="pagination-buttons">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="pagination-button"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="pagination-button"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DonThuoc;
