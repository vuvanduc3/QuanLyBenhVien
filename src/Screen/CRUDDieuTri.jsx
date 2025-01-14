import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../Styles/CRUDDieuTri.css';
import Menu1 from '../components/Menu';
import { ChevronLeft, Edit, Save, X } from 'lucide-react';
import Search1 from '../components/seach_user';

const ThemSuaXoaDieuTri = () => {
  const [searchTermHoSo, setSearchTermHoSo] = useState('');
  const [filteredHoSos, setFilteredHoSos] = useState([]);
  const [isSearchVisibleHoSo, setIsSearchVisibleHoSo] = useState(false);
  const [selectedHoSo, setSelectedHoSo] = useState(null);

  const [maHoSo, setMaHoSo] = useState('');
  const [moTa, setMoTa] = useState('');
  const [phuongPhap, setPhuongPhap] = useState('');
  const [ketQua, setKetQua] = useState('Đang điều trị');
  const [ngayDieuTri, setNgayDieuTri] = useState('');
  const [daSuDung, setDaSuDung] = useState('');
  const [daNhapHoaDon, setDaNhapHoaDon] = useState(false);

  const { state } = useLocation();
  const { action, item } = state || {};
  const navigate = useNavigate();
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
  });

  useEffect(() => {
    if (action === 'add' && item) {
      setSearchTermHoSo(item.ID);
      setMaHoSo(item.ID);
    }
    if (action === 'edit' && item) {
      setMaHoSo(item.MaHoSo);
      setMoTa(item.MoTa);
      setPhuongPhap(item.PhuongPhap);
      setKetQua(item.KetQua);
      setNgayDieuTri(item.NgayDieuTri ? item.NgayDieuTri.split('T')[0] : '');
      setDaSuDung(item.DaSuDung);
      setDaNhapHoaDon(item.DaNhapHoaDon === 1); // Nếu giá trị DaNhapHoaDon là 1, là đã nhập
      setSearchTermHoSo(item.MaHoSo);
    }
  }, [action, item]);

  const handleHoSoSelect = (hoSo) => {
    setMaHoSo(hoSo.ID);
    setSelectedHoSo(hoSo);
    setIsSearchVisibleHoSo(false);
    setSearchTermHoSo(hoSo.MaHoSo);
  };

  const ketQuaOptions = [
      'Đã điều trị thành công',
      'Đã phục hồi',
      'Đang điều trị',
      'Đang theo dõi',
  ];

  const handleKetQuaChange = (e) => {
      setKetQua(e.target.value);
  };


  const handleSearchChange = (e) => {
    setSearchTermHoSo(e.target.value);
    if (e.target.value === '') {
      setFilteredHoSos([]);
    } else {
      setIsSearchVisibleHoSo(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dieuTriData = {
      MaHoSo: maHoSo,
      MoTa: moTa,
      PhuongPhap: phuongPhap,
      KetQua: ketQua,
      NgayDieuTri: ngayDieuTri || new Date().toISOString().split('T')[0],
      DaSuDung: daSuDung,
      DaNhapHoaDon: daNhapHoaDon ? 1 : 0,
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

    try {
      const apiUrl = action === 'edit'
        ? `http://localhost:5000/api/dieutri/${item.MaDieuTri}`
        : 'http://localhost:5000/api/dieutri';

      const response = await fetch(apiUrl, {
        method: action === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dieuTriData),
      });

      if (response.ok) {
        alert(action === 'edit' ? 'Sửa điều trị thành công!' : 'Thêm điều trị thành công!');
        if(action === 'edit'){
            const tenThongBao = "Thông báo: Sửa điều trị có 'Mã điều trị: "+item.MaDieuTri +" - Mã hồ sơ : "+ dieuTriData.MaHoSo +" - Mô tả: "+ dieuTriData.MoTa +"' thành công!";
            const loaiThongBao = "Điều trị";
            const chucNang = "Sửa dữ liệu";

            themThongBao(tenThongBao, loaiThongBao, chucNang);

        }
        else{
            const tenThongBao = "Thông báo: Thêm điều trị có 'Mã hồ sơ : "+ dieuTriData.MaHoSo +" - Mô tả: "+ dieuTriData.MoTa +"' thành công!";
            const loaiThongBao = "Điều trị";
            const chucNang = "Thêm dữ liệu";

            themThongBao(tenThongBao, loaiThongBao, chucNang);
        }

      } else {
        throw new Error('Lỗi khi thêm/sửa điều trị');
      }
    } catch (err) {
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/dieutri/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Xoá điều trị thành công!');
        navigate('/CRUDDieuTri');
      } else {
        throw new Error('Lỗi khi xoá điều trị');
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="light" />
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
            <h2 className="card-title">{action === 'edit' ? 'Sửa điều trị' : 'Thêm điều trị'}</h2>
          </div>
          <form className="medicine-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Mã hồ sơ <span className="required">*</span></label>
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
                    <label><strong>Mã hồ sơ đã chọn:</strong> {selectedHoSo.ID}</label>
                  </div>
                  {!isSearchVisibleHoSo && (
                    <>
                      <label><strong>Mã bệnh nhân:</strong> {selectedHoSo.MaBenhNhan}</label>
                      <label><strong>Họ và tên:</strong> {selectedHoSo.HoVaTen}</label>
                      <label>
                          <strong>Ngày sinh:</strong> {formatNgaySinh(selectedHoSo.NgaySinh)}
                      </label>
                      <label><strong>CCCD/HC:</strong> {selectedHoSo.SoCCCD_HoChieu}</label>
                    </>
                  )}
                </div>
              )}

              {isSearchVisibleHoSo && searchTermHoSo && (
                <div className="search-results">
                  {filteredHoSos.map((hoSo) => (
                    <div key={hoSo.ID} onClick={() => handleHoSoSelect(hoSo)} className="search-item">
                      <div><strong>{hoSo.ID}</strong></div>
                      <div><strong>Mã bệnh nhân:</strong> {hoSo.MaBenhNhan}</div>
                      <div><strong>Họ và tên:</strong> {hoSo.HoVaTen}</div>
                      <div><strong>Ngày sinh:</strong> {formatNgaySinh(hoSo.NgaySinh)}</div>
                      <div><strong>Số CCCD_HoChieu:</strong> {hoSo.SoCCCD_HoChieu}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

           <div className="form-group">
             <label>Mô tả <span className="required">*</span></label>
             <textarea
               value={moTa}
               onChange={(e) => setMoTa(e.target.value)}
               placeholder="Nhập mô tả"
               className="form-control"
               rows="4" // Số dòng của textarea
             />
           </div>


            <div className="form-group">
              <label>Phương pháp <span className="required">*</span></label>
              <textarea
                type="text"
                value={phuongPhap}
                onChange={(e) => setPhuongPhap(e.target.value)}
                placeholder="Nhập phương pháp"
                className="form-control"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Kết quả:  {ketQua}<span className="required">*</span></label>
              <select
                 value={ketQua}
                 onChange={handleKetQuaChange}
                 className="form-control"
               >
                 {ketQuaOptions.map((option, index) => (
                   <option key={index} value={option}>
                     {option}
                   </option>
                 ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ngày điều trị <span className="required">*</span></label>
              <input
                type="date"
                value={ngayDieuTri}
                onChange={(e) => setNgayDieuTri(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Đã sử dụng: thiết bị / khác <span className="required">*</span></label>
              <textarea
                type="text"
                value={daSuDung}
                onChange={(e) => setDaSuDung(e.target.value)}
                placeholder="Nhập đã sử dụng"
                className="form-control"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="add-button btn-primary">
                {action === 'edit' ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ThemSuaXoaDieuTri;
