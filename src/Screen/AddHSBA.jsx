import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import '../Styles/AddHSBA.css';

const AddMedicalRecord = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { action, item } = location.state || {}; // Lấy action và item từ params

    const [formData, setFormData] = useState({
        maBenhNhan: '',
        maLichHen: '',
        hoVaTen: '',
        ngaySinh: '',
        tuoi: '',
        gioiTinh: '',
        danToc: '',
        diaChiCuTru: '',
        thonPho: '',
        xaPhuong: '',
        huyen: '',
        tinhThanhPho: '',
        soTheBHYT: '',
        soCCCD_HoChieu: '',
        vaoVien: new Date().toISOString().slice(0, 10),
        raVien: '',
        chanDoanVaoVien: '',
        chanDoanRaVien: '',
        lyDoVaoVien: '',
        tomTatBenhLy: '',
        hanhDong: ''
    });

    useEffect(() => {
       if (action === 'add' && item) {
         setFormData({
            maBenhNhan: '',
            maLichHen: '',
            hoVaTen: item.TenDayDu || '',
            ngaySinh: new Date(item.NgaySinh).toISOString().split('T')[0] || '',
            tuoi: item.Tuoi || '',
            gioiTinh: item.GioiTinh || '',
            danToc: 'Kinh',
            diaChiCuTru: item.DiaChi || '',
            thonPho: '',
            xaPhuong: '',
            huyen: '',
            tinhThanhPho: '',
            soTheBHYT: item.SoHopDongBaoHiem || '',
            soCCCD_HoChieu: item.CCCD || '',
            vaoVien: new Date().toISOString().slice(0, 10),
            raVien: '',
            chanDoanVaoVien: '',
            chanDoanRaVien: '',
            lyDoVaoVien: '',
            tomTatBenhLy: '',
            hanhDong: ''
         });
       }
    }, [action, item]);

    const formatNgaySinh = (ngaySinh) => {
        if (!ngaySinh) return "Không xác định";
        const date = new Date(ngaySinh);
        return new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(date);
      };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // State for location data
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    useEffect(() => {
        fetchNextCodes();
        fetchProvinces();
    }, []);

    // Fetch initial provinces
    const fetchProvinces = async () => {
        setLoadingLocations(true);
        try {
            const response = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await response.json();
            setProvinces(data);
        } catch (err) {
            console.error('Error fetching provinces:', err);
            setError('Lỗi khi tải danh sách tỉnh thành');
        } finally {
            setLoadingLocations(false);
        }
    };

    // Fetch districts based on selected province
    const fetchDistricts = async (provinceCode) => {
        setLoadingLocations(true);
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts);
            setWards([]); // Reset wards when province changes
        } catch (err) {
            console.error('Error fetching districts:', err);
            setError('Lỗi khi tải danh sách quận huyện');
        } finally {
            setLoadingLocations(false);
        }
    };

    // Fetch wards based on selected district
    const fetchWards = async (districtCode) => {
        setLoadingLocations(true);
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await response.json();
            setWards(data.wards);
        } catch (err) {
            console.error('Error fetching wards:', err);
            setError('Lỗi khi tải danh sách phường xã');
        } finally {
            setLoadingLocations(false);
        }
    };

    const fetchNextCodes = async () => {
        try {
            const patientResponse = await fetch('http://localhost:5000/api/medical-records/next-patient-code');
            const patientData = await patientResponse.json();
            
            const appointmentResponse = await fetch('http://localhost:5000/api/medical-records/next-appointment-code');
            const appointmentData = await appointmentResponse.json();
            
            if (patientData.success && appointmentData.success) {
                setFormData(prev => ({
                    ...prev,
                    maBenhNhan: patientData.nextCode,
                    maLichHen: appointmentData.nextCode
                }));
            }
        } catch (err) {
            console.error('Error fetching next codes:', err);
            setError('Lỗi khi lấy mã tự động. Vui lòng thử lại.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        setFormData(prev => {
            // Tạo đối tượng mới từ `prev` và cập nhật trường `name` với `value`
            const updatedData = { ...prev, [name]: value };
    
            // Tính tuổi nếu `name` là `ngaySinh`
            if (name === "ngaySinh") {
                updatedData.tuoi = calculateAge(value);
            }
    
            // Trả về `updatedData` đã cập nhật
            return updatedData;
        });
    
        // Handle location changes
        if (name === 'tinhThanhPho') {
            const province = provinces.find(p => p.name === value);
            if (province) {
                fetchDistricts(province.code);
            }
            // Reset dependent fields
            setFormData(prev => ({
                ...prev,
                huyen: '',
                xaPhuong: ''
            }));
        }
    
        if (name === 'huyen') {
            const district = districts.find(d => d.name === value);
            if (district) {
                fetchWards(district.code);
            }
            // Reset dependent field
            setFormData(prev => ({
                ...prev,
                xaPhuong: ''
            }));
        }
    };
    
    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age > 0 ? age : 0; // Nếu tuổi tính ra âm, trả về 0
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/medical-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Thêm hồ sơ bệnh án thành công!');
                const body2 = {
                     MaBenhNhanKhamBenh: formData.maBenhNhan,  // Sử dụng item.MaHoaDon nếu có
                };

                const tenThongBao = "Thông báo: Thêm hồ sơ bệnh án có 'Mã lịch khám : "+ formData.maLichHen +" - Mã bệnh nhân: "+formData.maBenhNhan+"' thành công!";
                const loaiThongBao = "Hồ sơ bệnh án";
                const chucNang = "Thêm dữ liệu";

                themThongBao(tenThongBao, loaiThongBao, chucNang);

                if (action === 'add' && item) {
                    try {
                        const updateResponse = await fetch(`http://localhost:5000/api/lichkhammabenhnhankhambenh/${item.MaLichKham}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(body2),
                        });

                        // Kiểm tra xem response có thành công không
                        if (!updateResponse.ok) {
                            const errorData = await updateResponse.json(); // Đọc dữ liệu lỗi từ server nếu có

                            return;
                        }

                        const updateResult = await updateResponse.json();
                        if (updateResult.success) {
                            alert('Cập nhập lịch khám thành công!');

                        } else {
                           setError(updateResult.message || 'Có lỗi xảy ra khi cập nhật!');
                        }
                    } catch (error) {
                        console.error('Lỗi khi gọi API:', error);
                        setError('Có lỗi xảy ra, vui lòng thử lại!');
                    }
                }
                navigate('/hosobenhan');
            } else {
                setError(data.message || 'Có lỗi xảy ra khi thêm hồ sơ');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                
                <div className="add-record-content">
                    <div className="form-header">
                        <h2 style={{ color: '#000' }}>Thêm Hồ Sơ Bệnh Án</h2>
                        <button 
                            className="back-button"
                            onClick={() => navigate('/hosobenhan')}
                        >
                            Quay lại
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="add-record-form">
                        {/* Basic Information */}
                        <div className="form-row">
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="maBenhNhan">Mã bệnh nhân </label>
                                <input
                                    type="text"
                                    id="maBenhNhan"
                                    name="maBenhNhan"
                                    value={formData.maBenhNhan}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="maLichHen">Mã lịch hẹn</label>
                                <input
                                    type="text"
                                    id="maLichHen"
                                    name="maLichHen"
                                    value={formData.maLichHen}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="form-row">
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="hoVaTen">Họ và tên *</label>
                                <input
                                    type="text"
                                    id="hoVaTen"
                                    name="hoVaTen"
                                    value={formData.hoVaTen}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập họ và tên"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="ngaySinh">Ngày sinh *</label>
                                <input
                                    type="date"
                                    id="ngaySinh"
                                    name="ngaySinh"
                                    value={formData.ngaySinh}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="tuoi">Tuổi *</label>
                                <input
                                    type="number"
                                    id="tuoi"
                                    name="tuoi"
                                    value={formData.tuoi}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    max="120"
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="gioiTinh">Giới tính *</label>
                                <select
                                    id="gioiTinh"
                                    name="gioiTinh"
                                    value={formData.gioiTinh}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="form-row">
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="tinhThanhPho">Tỉnh/Thành phố</label>
                                <select
                                    id="tinhThanhPho"
                                    name="tinhThanhPho"
                                    value={formData.tinhThanhPho}
                                    onChange={handleChange}
                                    disabled={loadingLocations}
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {provinces.map(province => (
                                        <option key={province.code} value={province.name}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label  style={{ color: '#000' }} htmlFor="huyen">Quận/Huyện</label>
                                <select
                                    id="huyen"
                                    name="huyen"
                                    value={formData.huyen}
                                    onChange={handleChange}
                                    disabled={!formData.tinhThanhPho || loadingLocations}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {districts.map(district => (
                                        <option key={district.code} value={district.name}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="xaPhuong">Phường/Xã</label>
                                <select
                                    id="xaPhuong"
                                    name="xaPhuong"
                                    value={formData.xaPhuong}
                                    onChange={handleChange}
                                    disabled={!formData.huyen || loadingLocations}
                                >
                                    <option value="">Chọn phường/xã</option>
                                    {wards.map(ward => (
                                        <option key={ward.code} value={ward.name}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="thonPho">Thôn/Phố</label>
                                <input
                                    type="text"
                                    id="thonPho"
                                    name="thonPho"
                                    value={formData.thonPho}
                                    onChange={handleChange}
                                    placeholder="Nhập thôn/phố"
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label style={{ color: '#000' }} htmlFor="diaChiCuTru">Địa chỉ cụ thể</label>
                            <input
                                type="text"
                                id="diaChiCuTru"
                                name="diaChiCuTru"
                                value={formData.diaChiCuTru}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ cụ thể"
                            />
                        </div>

                        {/* Additional Information */}
                        <div className="form-row">
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="danToc">Dân tộc</label>
                                <input
                                    type="text"
                                    id="danToc"
                                    name="danToc"
                                    value={formData.danToc}
                                    onChange={handleChange}
                                    placeholder="Nhập dân tộc"
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="soTheBHYT">Số thẻ BHYT</label>
                                <input
                                    type="text"
                                    id="soTheBHYT"
                                    name="soTheBHYT"
                                    value={formData.soTheBHYT}
                                    onChange={handleChange}
                                    placeholder="Nhập số thẻ BHYT"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="soCCCD_HoChieu">Số CCCD/Hộ chiếu</label>
                                <input
                                    type="text"
                                    id="soCCCD_HoChieu"
                                    name="soCCCD_HoChieu"
                                    value={formData.soCCCD_HoChieu}
                                    onChange={handleChange}
                                    placeholder="Nhập số CCCD/Hộ chiếu"
                                />
                            </div>

                            <div className="form-group">
                            <label style={{ color: '#000' }} htmlFor="vaoVien">Ngày vào viện *</label>
                                <input
                                    type="date"
                                    id="vaoVien"
                                    name="vaoVien"
                                    value={formData.vaoVien}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="raVien">Ngày ra viện</label>
                                <input
                                    type="date"
                                    id="raVien"
                                    name="raVien"
                                    value={formData.raVien}
                                    onChange={handleChange}
                                    min={formData.vaoVien}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#000' }} htmlFor="hanhDong">Hành động *</label>
                                <select
                                    id="hanhDong"
                                    name="hanhDong"
                                    value={formData.hanhDong}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Chọn hành động</option>
                                    <option value="KhamMoi">Khám mới</option>
                                    <option value="TaiKham">Tái khám</option>
                                    <option value="CapCuu">Cấp cứu</option>
                                    <option value="TheoDoi">Theo dõi</option>
                                </select>
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div className="form-group full-width">
                            <label  style={{ color: '#000' }} htmlFor="lyDoVaoVien">Lý do vào viện</label>
                            <textarea
                                id="lyDoVaoVien"
                                name="lyDoVaoVien"
                                value={formData.lyDoVaoVien}
                                onChange={handleChange}
                                placeholder="Nhập lý do vào viện"
                                rows="3"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label style={{ color: '#000' }} htmlFor="chanDoanVaoVien">Chẩn đoán vào viện</label>
                            <textarea
                                id="chanDoanVaoVien"
                                name="chanDoanVaoVien"
                                value={formData.chanDoanVaoVien}
                                onChange={handleChange}
                                placeholder="Nhập chẩn đoán vào viện"
                                rows="3"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label style={{ color: '#000' }} htmlFor="chanDoanRaVien">Chẩn đoán ra viện</label>
                            <textarea
                                id="chanDoanRaVien"
                                name="chanDoanRaVien"
                                value={formData.chanDoanRaVien}
                                onChange={handleChange}
                                placeholder="Nhập chẩn đoán ra viện"
                                rows="3"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label style={{ color: '#000' }} htmlFor="tomTatBenhLy">Tóm tắt bệnh lý</label>
                            <textarea
                                id="tomTatBenhLy"
                                name="tomTatBenhLy"
                                value={formData.tomTatBenhLy}
                                onChange={handleChange}
                                placeholder="Nhập tóm tắt bệnh lý"
                                rows="4"
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => navigate('/hosobenhan')}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                className="submit-button" 
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Thêm hồ sơ'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddMedicalRecord;