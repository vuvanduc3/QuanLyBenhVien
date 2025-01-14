import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDDonThuoc.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Edit, Save, X } from 'lucide-react';

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

    const [MaBenhNhan, setMaBenhNhan] = useState('');
    const [MaBacSi, setMaBacSi] = useState('');
    const [ChanDoan, setChanDoan] = useState('');
    const [NgayLap, setNgayLap] = useState('');

     const [DaNhapHoaDon, setDaNhapHoaDon] = useState(0);

    const [TenThuoc, setTenThuoc] = useState('');
    const [MoTa, setMoTa] = useState('');
    const [SoLuong, setSoLuong] = useState('');
    const [GiaThuoc, setGiaThuoc] = useState('');



    const [isCollapsedHoSo, setIsCollapsedHoSo] = useState(true); // Đặt trạng thái mặc định là thu gọn hồ sơ

      const toggleCollapseHoSo = () => {
        setIsCollapsedHoSo(prevState => !prevState); // Đổi trạng thái khi nhấn vào
      };

    const [isCollapsedThuoc, setIsCollapsedThuoc] = useState(true); // Đặt trạng thái mặc định là thu gọn thuốc

      const toggleCollapseThuoc = () => {
        setIsCollapsedThuoc(prevState => !prevState); // Đổi trạng thái khi nhấn vào thuoc
      };

    // Thông tin thuốc từ API
    const [thuocs, setThuocs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedThuoc, setSelectedThuoc] = useState(null); // Thuốc đã chọn
    const [showDetails, setShowDetails] = useState(false); // Điều khiển việc hiển thị chi tiết thuốc
    const [isSearchVisible, setIsSearchVisible] = useState(true); // Điều khiển việc hiển thị bảng tìm kiếm thuốc

    // Thông tin mã hồ sơ từ API
    const [maHoSos, setMaHoSos] = useState([]); // Danh sách mã hồ sơ
    const [selectedHoSo, setSelectedHoSo] = useState(null); // Hồ sơ đã chọn
    const [searchTermHoSo, setSearchTermHoSo] = useState(''); // Từ khóa tìm kiếm mã hồ sơ
    const [isSearchVisibleHoSo, setIsSearchVisibleHoSo] = useState(true); // Điều khiển hiển thị bảng tìm kiếm mã hồ sơ

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

    const themThongBao = async (name, type, feature ) => {
      if (!name || !type || !feature) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      const notification = { Name: name, Loai: type, ChucNang: feature };

      try {
              const response = await fetch("http://localhost:5000/api/thongbao", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(notification),
              });

              const result = await response.json();
              if (response.ok) {
                  window.location.reload(true);
              } else {
                  alert(result.message);
              }
          } catch (error) {
            console.error("Lỗi khi thêm thông báo:", error);
            alert("Có lỗi xảy ra!");
          }
    }

    // Lấy danh sách mã hồ sơ từ API
    useEffect(() => {
        const fetchHoSos = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/medical-records');
                const data = await response.json();

                if (data.success) {
                    setMaHoSos(data.data); // Cập nhật danh sách mã hồ sơ
                } else {
                    toast.error('Không thể tải danh sách mã hồ sơ');
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu mã hồ sơ:", error);
                toast.error('Lỗi khi tải danh sách mã hồ sơ');
            }
        };
        fetchHoSos();
    }, []);

    useEffect(() => {
        if (action === 'add' && item) {
            setMaHoSo(item.ID);
            setMaBenhNhan(item.MaBenhNhan);
            setMaBacSi(item.HoVaTen);
            setChanDoan(item.NgaySinh);
            setNgayLap(item.SoCCCD_HoChieu);
        }
        if (action === 'edit' && item) {
            setMaDonThuoc(item.MaDonThuoc);
            setMaThuoc(item.MaThuoc);
            setSoLuongDonThuoc(item.SoLuongDonThuoc);
            setHuongDanSuDung(item.HuongDanSuDung);
            setMaHoSo(item.MaHoSo);

            setMaBenhNhan(item.MaBenhNhan);
            setMaBacSi(item.HoVaTen);
            setChanDoan(item.NgaySinh);
            setNgayLap(item.SoCCCD_HoChieu);

            setDaNhapHoaDon(item.DaNhapHoaDon);

            setSelectedThuoc(item);
            setTenThuoc(item.TenThuoc);
            setSoLuong(item.SoLuong);

            const GiaThuoc = item.GiaThuoc;
            const formattedPrice = GiaThuoc.toLocaleString('vi-VN'); // Định dạng theo kiểu Việt Nam


            setGiaThuoc(formattedPrice);
            setMoTa(item.MoTa);

            // Thiết lập mã hồ sơ khi sửa đơn thuốc
        }
    }, [action, item]);

    // Lọc thuốc và mã hồ sơ theo từ khóa tìm kiếm
    const filteredThuocs = thuocs.filter(thuoc =>
        thuoc.TenThuoc && thuoc.TenThuoc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredHoSos = maHoSos.filter(hoSo => {
        // Chuyển mã hồ sơ, mã bệnh nhân, mã bác sĩ thành chuỗi và so sánh với từ khóa tìm kiếm
        const id = String(hoSo.ID).toLowerCase();
        const maBenhNhan = String(hoSo.MaBenhNhan).toLowerCase();
        const maBacSi = String(hoSo.MaBacSi).toLowerCase();
        return (
            id.includes(searchTermHoSo.toLowerCase()) ||
            maBenhNhan.includes(searchTermHoSo.toLowerCase()) ||
            maBacSi.includes(searchTermHoSo.toLowerCase())
        );
    });

    // Xử lý sự kiện khi nhấn vào thuốc
    const handleThuocSelect = (thuoc) => {
         // Cập nhật thông tin thuốc đã chọn
        setMaThuoc(thuoc.ID);
        setSelectedThuoc(thuoc);
        setTenThuoc(thuoc.TenThuoc);
        setSoLuong(thuoc.SoLuong);

        const GiaThuoc = thuoc.GiaThuoc;
        const formattedPrice = GiaThuoc.toLocaleString('vi-VN'); // Định dạng theo kiểu Việt Nam


        setGiaThuoc(formattedPrice);
        setMoTa(thuoc.MoTa);

        setShowDetails(true); // Hiển thị chi tiết thuốc khi chọn
        setIsSearchVisible(false); // Ẩn bảng tìm kiếm khi chọn thuốc
    };

    // Xử lý sự kiện khi nhấn vào mã hồ sơ
    const handleHoSoSelect = (hoSo) => {
        setMaHoSo(hoSo.ID);
        setMaBenhNhan(hoSo.MaBenhNhan);
        setMaBacSi(hoSo.HoVaTen);
        setChanDoan(hoSo.NgaySinh);
        setNgayLap(hoSo.SoCCCD_HoChieu);

        setSelectedHoSo(hoSo); // Cập nhật thông tin mã hồ sơ đã chọn
        setIsSearchVisibleHoSo(false); // Ẩn bảng tìm kiếm mã hồ sơ khi chọn
    };

    // Xử lý việc ẩn/hiện chi tiết thuốc
    const toggleDetails = () => {
        setShowDetails(prevState => !prevState);
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
                        MaHoSo,
                        DaNhapHoaDon// Thêm MaHoSo vào body
                    })
                }
            );
            const result = await response.json();

            if (result.success) {
                alert(action === 'edit' ? 'Sửa đơn thuốc thành công!' : 'Thêm đơn thuốc thành công!');
                if(action === 'edit'){
                     const tenThongBao = "Thông báo: Sửa đơn thuốc có 'Mã hồ sơ : "+ MaHoSo +" - Mã bệnh nhân: "+ MaBenhNhan +" - Tên thuốc "+ TenThuoc +" ' thành công!";
                     const loaiThongBao = "Đơn thuốc";
                     const chucNang = "Sửa dữ liệu";

                     themThongBao(tenThongBao, loaiThongBao, chucNang);
                }
                else{
                     const tenThongBao = "Thông báo: Thêm đơn thuốc có 'Mã hồ sơ : "+ MaHoSo +" - Mã bệnh nhân: "+ MaBenhNhan +" - Tên thuốc "+ TenThuoc +" ' thành công!";
                     const loaiThongBao = "Đơn thuốc";
                     const chucNang = "Thêm dữ liệu";

                     themThongBao(tenThongBao, loaiThongBao, chucNang);
                }

            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error("Lỗi khi thực hiện API:", err);
            setError('Lỗi khi lưu dữ liệu');
        }
    };
     const formatNgaySinh = (ngaySinh) => {
        if (!ngaySinh) return "Không xác định";
        const date = new Date(ngaySinh);
        return new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(date);
      };

    const datLaiTuKhoa = () => {
        setSearchTerm('');
        setSearchTermHoSo('');
    };

    return (
        <div className="container"  onClick={() => datLaiTuKhoa()} >
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
                <div
                className="main-content"
                style={{
                    borderRadius: "10px",
                    marginBottom: "10px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width:"100%" }}>
                    <button  style={{
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
                    <ChevronLeft />
                    </button>
                    <div>
                        <Search1 />
                    </div>
                </div>

                <div className="main-content">
                    <div className="card-header">
                        <h2 className="card-title">{action === 'edit' ? 'Sửa đơn thuốc' : 'Thêm đơn thuốc'}</h2>
                    </div>
                    <form className="medicine-form" onSubmit={handleSubmit}>
                        {error && <p className="error-message">{error}</p>}

                        <div className="form-group">
                            <label>Mã đơn thuốc <span className="required"></span></label>
                            <input
                                type="text"
                                value={MaDonThuoc}
                                onChange={(e) => setMaDonThuoc(e.target.value)}
                                placeholder="Nhập mã đơn thuốc"
                                className="form-control"
                                required
                                readOnly
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
                                onFocus={() => setIsSearchVisible(true)} // Hiển thị bảng tìm kiếm khi nhấn vào input
                                placeholder="Tìm kiếm thuốc..."
                                className="form-control"
                            />
                            {MaThuoc && (
                                <div className="selected-medicine" onClick={toggleCollapseThuoc}>
                                    <div className="selected-medicine-row">
                                        <label><strong>Mã thuốc đã chọn:</strong> {MaThuoc} </label>
                                        <label><strong>{isCollapsedThuoc?'Mở rộng':''}</strong></label>
                                    </div>
                                    {!isCollapsedThuoc && (
                                     <>
                                        <label><strong>Tên thuốc:</strong> {TenThuoc}</label>
                                        <label><strong>Mô tả:</strong> {MoTa}</label>
                                        <label><strong>Số lượng:</strong> {SoLuong}</label>
                                        <label><strong>Gía thuốc:</strong> {GiaThuoc?GiaThuoc:0} đ</label>
                                    </>
                                    )}
                                </div>
                            )}
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
                                                <span><strong>Giá:</strong> {thuoc.GiaThuoc} </span>đ
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tìm kiếm và chọn mã hồ sơ */}
                        <div className="form-group">
                            <label>Mã hồ sơ <span className="required">*</span></label>
                            <input
                                type="text"
                                value={searchTermHoSo}
                                onChange={(e) => setSearchTermHoSo(e.target.value)}
                                onFocus={() => setIsSearchVisibleHoSo(true)} // Hiển thị bảng tìm kiếm khi nhấn vào input
                                placeholder="Tìm kiếm mã hồ sơ..."
                                className="form-control"
                            />
                            {MaHoSo && (
                             <div className="selected-hososo" onClick={toggleCollapseHoSo}>
                                 <div className="selected-hososo-row">
                                      <label><strong>Mã hồ sơ đã chọn:</strong> {MaHoSo}</label>
                                      <label><strong>{isCollapsedHoSo?'Mở rộng':''}</strong></label>
                                 </div>
                                  {!isCollapsedHoSo && (
                                    <>
                                      <label><strong>Mã bệnh nhân:</strong> {MaBenhNhan} </label>
                                      <label><strong>Họ và tên:</strong> {MaBacSi}</label>
                                      <label><strong>Ngày sinh:</strong> {formatNgaySinh(ChanDoan)}</label>
                                      <label><strong>Số CCCD_HoChieu:</strong> {NgayLap}</label>
                                    </>
                                  )}
                             </div>
                             )}

                            {isSearchVisibleHoSo && searchTermHoSo && (
                                <div className="search-results">
                                    {filteredHoSos.map((hoSo) => (
                                        <div
                                            key={hoSo.MaHoSo}
                                            onClick={() => handleHoSoSelect(hoSo)}
                                            className="search-item"
                                        >
                                            <div>
                                                <strong>Mã hồ sơ: {hoSo.ID}</strong>
                                            </div>
                                            <div>
                                                <span><strong>Mã bệnh nhân:</strong> {hoSo.MaBenhNhan}</span>
                                            </div>
                                            <div>
                                                <span><strong>Họ và tên:</strong> {hoSo.HoVaTen}</span>
                                            </div>
                                            <div>
                                                <span><strong>Ngày sinh:</strong> {formatNgaySinh(hoSo.NgaySinh)}</span>
                                            </div>

                                            <div>
                                                <span><strong>CCCD/HC:</strong> {hoSo.SoCCCD_HoChieu}</span>
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

                        <button type="submit" className="add-button btn-primary">{action === 'edit' ? 'Sửa đơn thuốc' : 'Thêm đơn thuốc'}</button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default ThemSuaXoaXetNghiem;
