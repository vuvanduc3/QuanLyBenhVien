import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDDonThuoc.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';
import { useNavigate, useLocation } from 'react-router-dom';

const ThemSuaXoaXetNghiem = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { action, item } = location.state || {}; // Lấy action và item từ params

    const [MaDonThuoc, setMaDonThuoc] = useState('');
    const [MaThuoc, setMaThuoc] = useState('');
    const [SoLuongDonThuoc, setSoLuongDonThuoc] = useState('');
    const [HuongDanSuDung, setHuongDanSuDung] = useState('');
    const [MaHoSo, setMaHoSo] = useState(''); // Thêm state cho mã hồ sơ
    const [error, setError] = useState('');

    // Thông tin thuốc từ API
    const [thuocs, setThuocs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedThuoc, setSelectedThuoc] = useState(null); // Thuốc đã chọn
    const [showDetails, setShowDetails] = useState(false); // Điều khiển việc hiển thị chi tiết thuốc
    const [isSearchVisible, setIsSearchVisible] = useState(true); // Điều khiển việc hiển thị bảng tìm kiếm

    // Lấy danh sách thuốc từ API
    useEffect(() => {
        const fetchThuocs = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/thuoc');
                const data = await response.json();
                if (data.success) {
                    setThuocs(data.data); // Cập nhật danh sách thuốc
                } else {
                    toast.error('Không thể tải danh sách thuốc');
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu thuốc:", error);
                toast.error('Lỗi khi tải danh sách thuốc');
            }
        };
        fetchThuocs();
    }, []);

    useEffect(() => {
        if (action === 'edit' && item) {
            setMaDonThuoc(item.MaDonThuoc);
            setMaThuoc(item.MaThuoc);
            setSoLuongDonThuoc(item.SoLuongDonThuoc);
            setHuongDanSuDung(item.HuongDanSuDung);
            setMaHoSo(item.MaHoSo); // Thiết lập mã hồ sơ khi sửa đơn thuốc
        }
    }, [action, item]);

    // Xử lý sự kiện khi nhấn vào thuốc
    const handleThuocSelect = (thuoc) => {
        setMaThuoc(thuoc.ID);
        setSelectedThuoc(thuoc); // Cập nhật thông tin thuốc đã chọn
        setShowDetails(true); // Hiển thị chi tiết thuốc khi chọn
        setIsSearchVisible(false); // Ẩn bảng tìm kiếm khi chọn thuốc
    };

    // Lọc thuốc theo từ khóa tìm kiếm
    const filteredThuocs = thuocs.filter(thuoc =>
        thuoc.TenThuoc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Xử lý việc ẩn/hiện chi tiết thuốc
    const toggleDetails = () => {
        setShowDetails(prevState => !prevState);
    };

    // Xử lý việc nhấn vào ô nhập tìm kiếm để hiển thị lại bảng tìm kiếm
    const handleSearchInputFocus = () => {
        setIsSearchVisible(true); // Hiển thị lại bảng tìm kiếm khi nhấn vào input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate input
        if (!MaThuoc || !SoLuongDonThuoc || !HuongDanSuDung || !MaHoSo) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            const response = await fetch(
                action === 'edit'
                    ? `http://localhost:5000/api/donthuoc/${MaDonThuoc}`
                    : 'http://localhost:5000/api/donthuoc',
                {
                    method: action === 'edit' ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        MaThuoc,
                        SoLuongDonThuoc,
                        HuongDanSuDung,
                        MaHoSo // Thêm MaHoSo vào body
                    })
                }
            );
            const result = await response.json();

            if (result.success) {
                toast.success(action === 'edit' ? 'Sửa đơn thuốc thành công!' : 'Thêm đơn thuốc thành công!');
                navigate('/donthuoc'); // Chuyển về trang danh sách đơn thuốc
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error("Lỗi khi thực hiện API:", err);
            setError('Lỗi khi lưu dữ liệu');
        }
    };

    return (
        <div className="container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <Menu1 />
            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">{action === 'edit' ? 'Sửa đơn thuốc' : 'Thêm đơn thuốc'}</h2>
                    </div>
                    <form className="medicine-form" onSubmit={handleSubmit}>
                        {error && <p className="error-message">{error}</p>}

                        <div className="form-group">
                            <label>Mã đơn thuốc <span className="required">*</span></label>
                            <input
                                type="text"
                                value={MaDonThuoc}
                                onChange={(e) => setMaDonThuoc(e.target.value)}
                                placeholder="Nhập mã đơn thuốc"
                                className="form-control"
                                required
                                disabled={action === 'edit'}
                            />
                        </div>

                        {/* Tìm kiếm và chọn thuốc */}
                        <div className="form-group">
                            <label>Mã thuốc <span className="required">*</span></label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={handleSearchInputFocus} // Hiển thị bảng tìm kiếm khi nhấn vào input
                                placeholder="Tìm kiếm thuốc..."
                                className="form-control"
                            />
                        {/* Hiển thị mã thuốc đã chọn */}
                        {MaThuoc && (
                            <div className="selected-medicine">
                                <label><strong>Mã thuốc đã chọn:</strong> {MaThuoc}</label>
                            </div>
                        )}

                        {/* Hiển thị thông tin chi tiết thuốc khi chọn */}
                        {selectedThuoc && (
                            <div className="thuoc-details">
                                <button type="button" onClick={toggleDetails} className="toggle-details-btn">
                                    {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                </button>

                                {showDetails && (
                                    <div className="thuoc-info">
                                        <p><strong>Tên thuốc:</strong> {selectedThuoc.TenThuoc}</p>
                                        <p><strong>Mô tả:</strong> {selectedThuoc.MoTa}</p>
                                        <p><strong>Số lượng:</strong> {selectedThuoc.SoLuong}</p>
                                        <p><strong>Giá:</strong> {selectedThuoc.GiaThuoc}</p>
                                    </div>
                                )}
                            </div>
                        )}
                            {/* Hiển thị danh sách thuốc tìm kiếm cùng thông tin */}
                            {isSearchVisible && searchTerm && (
                                <div className="search-results">
                                    {filteredThuocs.map((thuoc) => (
                                        <div
                                            key={thuoc.ID}
                                            onClick={() => handleThuocSelect(thuoc)}
                                            className="search-item"
                                        >
                                            <div>
                                                <strong>{thuoc.TenThuoc}</strong>
                                            </div>
                                            <div>
                                                <span><strong>Mô tả:</strong> {thuoc.MoTa}</span>
                                            </div>
                                            <div>
                                                <span><strong>Số lượng:</strong> {thuoc.SoLuong}</span>
                                            </div>
                                            <div>
                                                <span><strong>Giá:</strong> {thuoc.GiaThuoc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>



                        <div className="form-group">
                            <label>Số lượng đơn thuốc <span className="required">*</span></label>
                            <input
                                type="number"
                                value={SoLuongDonThuoc}
                                onChange={(e) => setSoLuongDonThuoc(e.target.value)}
                                placeholder="Nhập số lượng đơn thuốc"
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Hướng dẫn sử dụng <span className="required">*</span></label>
                            <textarea
                                value={HuongDanSuDung}
                                onChange={(e) => setHuongDanSuDung(e.target.value)}
                                placeholder="Nhập hướng dẫn sử dụng"
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mã hồ sơ <span className="required">*</span></label>
                            <input
                                type="text"
                                value={MaHoSo}
                                onChange={(e) => setMaHoSo(e.target.value)}
                                placeholder="Nhập mã hồ sơ"
                                className="form-control"
                                required
                            />
                        </div>

                        <button type="submit" className="add-button">
                            {action === 'edit' ? 'Lưu thay đổi' : 'Thêm đơn thuốc'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ThemSuaXoaXetNghiem;
