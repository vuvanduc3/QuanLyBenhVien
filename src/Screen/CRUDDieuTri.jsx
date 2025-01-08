import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDDieuTri.css';
import Menu1 from '../components/Menu';
import { useLocation, useNavigate } from 'react-router-dom';

const ThemSuaXoaDieuTri = () => {
  const [searchTermHoSo, setSearchTermHoSo] = useState('');
  const [filteredHoSos, setFilteredHoSos] = useState([]);
  const [isSearchVisibleHoSo, setIsSearchVisibleHoSo] = useState(false);
  const [selectedHoSo, setSelectedHoSo] = useState(null);

  const [maHoSo, setMaHoSo] = useState('');
  const [moTa, setMoTa] = useState('');
  const [phuongPhap, setPhuongPhap] = useState('');
  const [ketQua, setKetQua] = useState('');
  const [ngayDieuTri, setNgayDieuTri] = useState('');
  const [daSuDung, setDaSuDung] = useState('');
  const [daNhapHoaDon, setDaNhapHoaDon] = useState(false);

  const { state } = useLocation();
  const { action, item } = state || {};
  const navigate = useNavigate();

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
        toast.success(action === 'edit' ? 'Sửa điều trị thành công!' : 'Thêm điều trị thành công!');

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

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="light" />
      <Menu1 />
      <main className="main-content">
        <div className="content">
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
                      <label><strong>Mã bác sĩ:</strong> {selectedHoSo.BacSi}</label>
                      <label><strong>Chẩn đoán:</strong> {selectedHoSo.ChanDoan}</label>
                      <label><strong>Ngày lập:</strong> {selectedHoSo.NgayLap}</label>
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
                      <div><strong>Mã bác sĩ:</strong> {hoSo.BacSi}</div>
                      <div><strong>Chẩn đoán:</strong> {hoSo.ChanDoan}</div>
                      <div><strong>Ngày lập hồ sơ:</strong> {hoSo.NgayLap}</div>
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
              <label>Kết quả <span className="required">*</span></label>
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
              <label>Ngày điều trị <span className="required"></span></label>
              <input
                type="date"
                value={ngayDieuTri}
                onChange={(e) => setNgayDieuTri(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Đã sử dụng: thiết bị / khác</label>
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
