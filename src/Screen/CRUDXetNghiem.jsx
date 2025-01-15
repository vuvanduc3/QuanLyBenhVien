import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDXetNghiem.css';
import Menu1 from '../components/Menu';
import { useLocation } from 'react-router-dom';
import Search1 from '../components/seach_user';
import { ChevronLeft, Edit, Save, X } from 'lucide-react';

const ThemSuaXoaXetNghiem = () => {
    const navigate = useNavigate();
    const [searchTermHoSo, setSearchTermHoSo] = useState('');
    const [filteredHoSos, setFilteredHoSos] = useState([]);
    const [isSearchVisibleHoSo, setIsSearchVisibleHoSo] = useState(false);
    const [selectedHoSo, setSelectedHoSo] = useState(null);
    const [maHoSo, setMaHoSo] = useState('');
    const [maBenhNhan, setMaBenhNhan] = useState('');
    const [maBacSi, setMaBacSi] = useState('');
    const [chanDoan, setChanDoan] = useState('');
    const [ngayLap, setNgayLap] = useState('');
    const [tenXetNghiem, setTenXetNghiem] = useState('');
    const [ketQua, setKetQua] = useState('');
    const [ngayXetNghiem, setNgayXetNghiem] = useState('');
    const [daNhapHoaDon, setDaNhapHoaDon] = useState(false);
    const { state } = useLocation();
    const { action, item } = state || {};

    useEffect(() => {
        const fetchHoSos = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/medical-records');
                const data = await response.json();
                if (data.success) {
                    setFilteredHoSos(data.data);
                } else {
                    toast.error('Không thể tải danh sách hồ sơ');
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu hồ sơ:", error);
                toast.error('Lỗi khi tải danh sách hồ sơ');
            }
        };
        fetchHoSos();
    }, []);
    const themThongBao = async (name, type, feature, data ) => {
      if (!name || !type || !feature) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      const notification = { Name: name, Loai: type, ChucNang: feature, Data: data };

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
                  //window.location.reload(true);
              } else {
                  alert(result.message);
              }
          } catch (error) {
            console.error("Lỗi khi thêm thông báo:", error);
            alert("Có lỗi xảy ra!");
          }
    }

    useEffect(() => {
        const fetchHoSos = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/medical-records');
                const data = await response.json();
                if (data.success) {
                    // Lọc danh sách ngay sau khi lấy dữ liệu
                    const filtered = data.data.filter((hoSo) => {
                        const id = String(hoSo.ID).toLowerCase();
                        const maBenhNhan = String(hoSo.MaBenhNhan).toLowerCase();
                        const maBacSi = String(hoSo.BacSi).toLowerCase();
                        return (
                            id.includes(searchTermHoSo.toLowerCase()) ||
                            maBenhNhan.includes(searchTermHoSo.toLowerCase()) ||
                            maBacSi.includes(searchTermHoSo.toLowerCase())
                        );
                    });
                    setFilteredHoSos(filtered);
                } else {
                    toast.error('Không thể tải danh sách hồ sơ');
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu hồ sơ:", error);
                //toast.error('Lỗi khi tải danh sách hồ sơ');
            }
        };

        // Gọi API mỗi khi `searchTermHoSo` thay đổi
        fetchHoSos();
    }, [searchTermHoSo]);


    const handleHoSoSelect = (hoSo) => {
        setMaHoSo(hoSo.ID);
        setMaBenhNhan(hoSo.MaBenhNhan);
        setMaBacSi(hoSo.BacSi);
        setChanDoan(hoSo.ChanDoan);
        setNgayLap(hoSo.NgayLap);
        setSelectedHoSo(hoSo);
        setIsSearchVisibleHoSo(true);
        setSearchTermHoSo(hoSo.MaHoSo);
    };

    const handleSearchChange = (e) => {
        setSearchTermHoSo(e.target.value);
        if (e.target.value === '') {
            setFilteredHoSos([]);
        } else {
            setIsSearchVisibleHoSo(true);
        }
    };

    useEffect(() => {
        if (action === 'add' && item) {
            setMaHoSo(item.ID);
             setSearchTermHoSo(item.ID);

        }
        if (action === 'edit' && item) {
            setMaHoSo(item.MaHoSo);
            setMaBenhNhan(item.MaBenhNhan);
            setMaBacSi(item.MaBacSi);
            setChanDoan(item.ChanDoan);
            setNgayLap(item.NgayLap);

            setTenXetNghiem(item.TenXetNghiem);
            setKetQua(item.KetQua);
            setNgayXetNghiem(convertToISODate(formatNgayXetNghiem(item.NgayXetNghiem)));
            setDaNhapHoaDon(item.DaNhapHoaDon);

            setSearchTermHoSo(item.MaHoSo);
        }
    }, [action, item]);

    // Hàm chuyển đổi định dạng
      const convertToISODate = (dateString) => {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
      };

    const formatNgayXetNghiem = (dateString) => {
      const date = new Date(dateString); // Parse chuỗi ngày
      return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const xetNghiemData = {
            MaHoSo: maHoSo,
            TenXetNghiem: tenXetNghiem,
            KetQua: ketQua,
            NgayXetNghiem: ngayXetNghiem || new Date().toISOString().split('T')[0],
            DaNhapHoaDon: daNhapHoaDon || 0,
        };

        try {
            const apiUrl = action === 'edit'
                ? `http://localhost:5000/api/xetnghiem/${item.MaXetNghiem}` // Sử dụng ID từ item trong state
                : 'http://localhost:5000/api/xetnghiem';

            const response = await fetch(apiUrl, {
                method: action === 'edit' ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(xetNghiemData),
            });

            if (response.ok) {
                alert(action === 'edit' ? 'Sửa xét nghiệm thành công!' : 'Thêm xét nghiệm thành công!');
                if(action === 'edit'){
                    const tenThongBao = "Thông báo: Sửa xét nghiệm có 'Mã xét nghiệm: "+item.MaXetNghiem +" - Mã hồ sơ : "+ xetNghiemData.MaHoSo +" - Tên xét nghiệm: "+ xetNghiemData.TenXetNghiem +"' thành công!";
                    const loaiThongBao = "Xét nghiệm";
                    const chucNang = "Sửa dữ liệu";

                    themThongBao(tenThongBao, loaiThongBao, chucNang, item);
                }
                else{
                     const tenThongBao = "Thông báo: Thêm xét nghiệm có 'Mã hồ sơ : "+ xetNghiemData.MaHoSo +" - Tên xét nghiệm: "+ xetNghiemData.TenXetNghiem +"' thành công!";
                     const loaiThongBao = "Xét nghiệm";
                     const chucNang = "Thêm dữ liệu";

                     themThongBao(tenThongBao, loaiThongBao, chucNang, item);

                }

            } else {
                throw new Error('Lỗi khi thêm/sửa xét nghiệm');
            }
        } catch (err) {
            toast.error(`Lỗi: ${err.message}`);
        }
    };


    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/xetnghiem/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Xoá xét nghiệm thành công!');
                setFilteredHoSos(filteredHoSos.filter(hoSo => hoSo.ID !== id));
            } else {
                throw new Error('Lỗi khi xoá xét nghiệm');
            }
        } catch (err) {
            toast.error(`Lỗi: ${err.message}`);
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
                <div
                className="form-container"
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
                    <ChevronLeft />
                    </button>
                    <div>
                        <Search1 />
                    </div>
                </div>

                <div>
                    <div className="form-container">
                        <div className="card-header">
                            <h2 style={{color: "#000"}}   className="card-title">{action === 'edit' ? 'Sửa xét nghiệm' : 'Thêm xét nghiệm'}</h2>
                        </div>
                        <form className="medicine-form" onSubmit={handleSubmit}>
                            {/* Tìm kiếm và chọn mã hồ sơ */}
                            <div className="form-group">
                                <label style={{color: "#000"}}  >Mã hồ sơ <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={searchTermHoSo}
                                    onChange={handleSearchChange}
                                    onFocus={() => setIsSearchVisibleHoSo(true)}
                                    placeholder="Tìm kiếm mã hồ sơ..."
                                    className="form-control"
                                />
                                {selectedHoSo && (
                                    <div className="selected-hososo" onClick={() => setIsSearchVisibleHoSo(!isSearchVisibleHoSo)}>
                                        <div className="selected-hososo-row">
                                            <label style={{color: "#000"}}  ><strong>Mã hồ sơ đã chọn:</strong> {selectedHoSo.ID}</label>
                                        </div>
                                        {!isSearchVisibleHoSo && (
                                            <>
                                                <label style={{color: "#000"}}  ><strong style={{color: "#000"}}  >Mã bệnh nhân:</strong> {selectedHoSo.MaBenhNhan}</label>
                                                <label style={{color: "#000"}}  ><strong style={{color: "#000"}}  >Họ và tên:</strong> {selectedHoSo.HoVaTen}</label>
                                                <label style={{color: "#000"}}  ><strong style={{color: "#000"}}  >Ngày sinh:</strong> {formatNgaySinh(selectedHoSo.NgaySinh)}</label>
                                                <label style={{color: "#000"}}  ><strong style={{color: "#000"}}  >Số CCCD và Hộ chiếu:</strong> {selectedHoSo.SoCCCD_HoChieu}</label>
                                            </>
                                        )}
                                    </div>
                                )}

                                {isSearchVisibleHoSo && searchTermHoSo && (
                                    <div className="search-results">
                                        {filteredHoSos.map((hoSo) => (
                                            <div
                                                key={hoSo.ID}
                                                onClick={() => handleHoSoSelect(hoSo)}
                                                className="search-item"
                                            >
                                                <div style={{color: "#000"}}  ><strong style={{color: "#000"}}  >{hoSo.ID}</strong></div>
                                                <div style={{color: "#000"}}  ><strong style={{color: "#000"}}  >Mã bệnh nhân:</strong> {hoSo.MaBenhNhan}</div>
                                                <div style={{color: "#000"}}  ><strong style={{color: "#000"}}  >Họ và tên:</strong> {hoSo.HoVaTen}</div>
                                                <div style={{color: "#000"}}  ><strong style={{color: "#000"}}  >Ngày sinh:</strong> {formatNgaySinh(hoSo.NgaySinh)}</div>
                                                <div style={{color: "#000"}}  ><strong style={{color: "#000"}}  >Số CCCD_HoChieu:</strong> {hoSo.SoCCCD_HoChieu}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Các trường dữ liệu khác */}
                            <div className="form-group">
                                <label style={{color: "#000"}}  >Tên thử nghiệm <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={tenXetNghiem}
                                    onChange={(e) => setTenXetNghiem(e.target.value)}
                                    placeholder="Nhập tên thử nghiệm"
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{color: "#000"}}  >Kết quả <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={ketQua}
                                    onChange={(e) => setKetQua(e.target.value)}
                                    placeholder="Nhập kết quả"
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{color: "#000"}}  >Ngày xét nghiệm: <span className="required"></span></label>
                                <input
                                    type="date"
                                    value={ngayXetNghiem}
                                    onChange={(e) => setNgayXetNghiem(e.target.value)}
                                    className="form-control"
                                />
                            </div>


                            <div className="form-actions">
                                <button type="submit" className="add-button btn-primary">
                                    {action === 'edit' ? 'Cập nhật' : 'Thêm'}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ThemSuaXoaXetNghiem;
