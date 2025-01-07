import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight
} from 'lucide-react';
import '../Styles/TraCuuVaNhapHoaDonCT.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const DonThuoc = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [activeTab] = useState('prescriptions');
    const [page, setPage] = useState(1);
    const [MaHoaDon, setMaHoaDon] = useState(1);
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
        history: ['ID', 'Mã bệnh nhân', 'Mã hồ sơ bệnh án', 'Mã bác sĩ', 'Mô tả', 'Ngày điều trị', 'Action'],
        prescriptions: ['ID', 'Mã bệnh nhân', 'Mã hồ sơ bệnh án', 'Mã bác sĩ', 'Mã thuốc', 'Hướng dẫn sử dụng', 'Số lượng', 'Action'],
        tests: ['ID', 'Mã bệnh nhân', 'Mã hồ sơ bệnh án', 'Mã bác sĩ', 'Tên thử nghiệm/xét nghiệm', 'Kết quả', 'Ngày xét nghiệm', 'Action']
    };
     useEffect(() => {
        setMaHoaDon(state.item.MaHoaDon);
     }, [state]);

    // Lấy dữ liệu từ API
    useEffect(() => {
        setLoading(true);
        let apiUrl = '';
        if (activeCategory === 'prescriptions') {
            apiUrl = 'http://localhost:5000/api/donthuoc';
        } else if (activeCategory === 'tests') {
            apiUrl = 'http://localhost:5000/api/xetnghiem';
        }

        if (apiUrl) {
            fetch(apiUrl)
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        setData(prevData => ({
                            ...prevData,
                            [activeCategory]: result.data,
                        }));
                    } else {
                        console.error('Failed to fetch data:', result);
                    }
                })
                .catch(error => console.error('Error fetching data:', error))
                .finally(() => setLoading(false));
        }
    }, [activeCategory]);

    // Chuyển danh mục hiển thị
    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setPage(1); // Reset page khi chuyển danh mục
        setActiveButton(category); // Cập nhật button đang được chọn
    };

 const handleAdd = (item) => {
     if (item.DaNhapHoaDon === 0) { // Kiểm tra nếu DaNhapHoaDon = 0 mới cho phép chuyển trang
         // Xử lý tên dịch vụ và số lượng tùy theo loại đơn
         const serviceData = activeCategory === 'prescriptions'
             ? { TenDichVu: item.TenThuoc, SoLuong: item.SoLuongDonThuoc, DonGia: item.GiaThuoc, MaDichVu: item.MaDonThuoc }
             : { TenDichVu: item.TenXetNghiem, SoLuong: 1, DonGia: 1, MaDichVu: item.MaXetNghiem };  // Đối với xét nghiệm, số lượng = 1, không có giá

         // Truyền MaHoaDon riêng biệt vào state
         navigate('/crud-tra-cuu-va-nhap-hoa-don-chi-tiet', {
             state: {
                 action: activeCategory,
                 item,
                 MaHoaDon: MaHoaDon, // Truyền MaHoaDon riêng biệt
                 ...serviceData
             }
         });
     } else {
         // Thông báo cho người dùng rằng họ không thể nhập hóa đơn nếu DaNhapHoaDon khác 1
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
                    placeholder="Tìm kiếm theo id, mã bác sĩ hoặc mã bệnh nhân..."
                    className="search-input"
                />

                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Tra cứu và nhập hóa đơn chi tiết </h2>
                    </div>
                    <span>Mã hóa đơn: {MaHoaDon}</span>

                    {/* Danh mục nút */}
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

                    {/* Bảng dữ liệu */}
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
                                                <td>{item.MaDonThuoc || item.MaXetNghiem}</td>
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
                                                <td>
                                                    <button
                                                        className={`action-btn ${item.DaNhapHoaDon === 1 ? 'brown' : 'green'}`}
                                                       // Disable nếu DaNhapHoaDon không phải 1
                                                        onClick={() => handleAdd(item)} // Gọi hàm handleAdd khi nhấn nút
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

                    {/* Phân trang */}
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
