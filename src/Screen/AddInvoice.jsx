import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit, Trash } from 'lucide-react';
import '../Styles/AddInvoice.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const AddInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { action, item } = location.state || {};
  const [formData, setFormData] = useState({
    MaBenhNhan: '',
    MaBacSi: '',
    MaHoSo: '',
    TongTien: '',
    TinhTrang: 'Chưa thanh toán',
    NgayLapHoaDon: '',
    NgayThanhToan: ''
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [MaBacSis, setMaBacSis] = useState([]);
  const [MaBenhNhans, setMaBenhNhans] = useState([]);


  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedBN, setIsExpandedBN] = useState(false);

  const handleExpandBenhNhanInfo = () => {
    setIsExpandedBN(!isExpandedBN);
  };

  // Fetch doctors data
  useEffect(() => {
    fetch('http://localhost:5000/api/nguoidung')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setDoctors(data.data.filter(user => user.VaiTro === 'Bác sĩ'));
        }
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu bác sĩ:", error));
  }, []);

  // Fetch patients data
  useEffect(() => {
    fetch('http://localhost:5000/api/medical-records')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPatients(data.data);
        }
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu bệnh nhân:", error));
  }, []);

  // Fetch data when editing invoice
  useEffect(() => {
    if (action === 'edit' && item) {
      setFormData({
        MaBenhNhan: item.MaBenhNhan,
        MaBacSi: item.MaBacSi?item.MaBacSi:0,
        MaHoSo: item.MaHoSo,
        TongTien: item.TongTien,
        TinhTrang: item.TinhTrang || 'Chưa thanh toán',
        NgayLapHoaDon: item.NgayLapHoaDon,
        NgayThanhToan: item.NgayThanhToan,
      });
    }
    setMaBenhNhans(item.MaBenhNhan);
    setMaBacSis(item.MaBacSi?item.MaBacSi:0);
  }, [action, item]);

  // Update selected patient
  useEffect(() => {
    if (formData.MaBenhNhan) {
      const patient = patients.find(patient => patient.MaBenhNhan === formData.MaBenhNhan);
      setSelectedPatient(patient);
    }
  }, [formData.MaBenhNhan, patients]);

  // Update selected doctor
  useEffect(() => {
    if (formData.MaBacSi) {
      const doctor = doctors.find(doctor => doctor.MaBacSi === formData.MaBacSi);
      setSelectedDoctor(doctor);
    }
  }, [formData.MaBacSi, doctors]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) => patient.HoVaTen?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                patient.SDT?.includes(patientSearchTerm) ||
                patient.CCCD?.includes(patientSearchTerm)
  );

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(
    (doctor) => doctor.TenDayDu?.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
                doctor.SDT?.includes(doctorSearchTerm) ||
                doctor.CCCD?.includes(doctorSearchTerm)
  );

  const handlePatientSearchChange = (e) => {
    setPatientSearchTerm(e.target.value);
  };

  const handleDoctorSearchChange = (e) => {
    setDoctorSearchTerm(e.target.value);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearchTerm(patient.HoVaTen);
    setMaBenhNhans(patient.MaBenhNhan);
    setFormData({ ...formData, MaBenhNhan: patient.MaBenhNhan, MaHoSo: patient.ID });
  };

  const handleSelectDoctor = (doctor) => {
    console.log('Bác sĩ đã chọn:', doctor); // Thêm dòng này để kiểm tra xem sự kiện có được kích hoạt không
    setSelectedDoctor(doctor);
    setDoctorSearchTerm(doctor.TenDayDu);
    setMaBacSis(doctor.ID);

    setFormData({ ...formData, MaBacSi: "" + doctor.ID });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!MaBenhNhans || !MaBacSis) {
      alert('Vui lòng chọn cả bệnh nhân và bác sĩ!');
      return;
    }

    const updatedFormData = { ...formData, MaBenhNhan: selectedPatient.MaBenhNhan, MaBacSi: MaBacSis };

    try {
      if (action === 'add') {
        const response = await fetch('http://localhost:5000/api/vienphi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFormData),
        });
        const data = await response.json();
        alert(data.success ? "Thêm hóa đơn thành công!" : data.message);
      } else if (action === 'edit') {
        const response = await fetch(`http://localhost:5000/api/vienphi/${item.MaHoaDon}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFormData),
        });
        const data = await response.json();
        alert(data.success ? "Cập nhật hóa đơn thành công!" : data.message);
      }
    } catch (error) {
      console.error("❌ Lỗi khi thực hiện thao tác:", error.message);
      alert("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

  return (
    <div className="container">
      <Menu1 />
      <div className="main-content">
        <Search1 />
        <div className="form-container">
          <div className="form-header">
            <h1 className="form-title">{action === 'edit' ? 'Sửa hóa đơn' : 'Thêm hóa đơn'}</h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Tìm kiếm bệnh nhân */}
            <div className="form-group">
              <label className="form-label">Tìm kiếm bệnh nhân (Mã bệnh nhân: {MaBenhNhans})</label>
              <input
                type="text"
                className="form-input"
                value={patientSearchTerm}
                onChange={handlePatientSearchChange}
                placeholder="Tìm kiếm bệnh nhân bằng tên, CCCD, hoặc số điện thoại..."
              />
              <div className="search-results">
                {filteredPatients.map((patient) => (
                  <div  key={patient.MaBenhNhan}  onClick={() => handleSelectPatient(patient)}>

                    <span>Mã hồ sơ bệnh án: {patient.ID}</span>
                    <span> - Mã bệnh nhân: {patient.MaBenhNhan}</span>
                    <span> - Họ và tên: {patient.HoVaTen} (  CCCD: {patient.SoCCCD_HoChieu})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tìm kiếm bác sĩ */}
            <div className="form-group">
              <label className="form-label">Tìm kiếm bác sĩ (Mã bác sĩ: {MaBacSis})</label>
              <input
                type="text"
                className="form-input"
                value={doctorSearchTerm}
                onChange={handleDoctorSearchChange}
                placeholder="Tìm kiếm bác sĩ bằng tên, CCCD, hoặc số điện thoại..."
              />
              <div className="search-results">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.MaBacSi} onClick={() => handleSelectDoctor(doctor)}>
                    <img src={doctor.Hinh} alt={doctor.TenDayDu} width="35" height="30" />
                    <span>{doctor.TenDayDu} (Chuyên môn: {doctor.ChuyenMon}, Phòng khám: {doctor.PhongKham})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other form fields */}
            <div className="form-group">
              <label className="form-label">Ngày lập hóa đơn</label>
              <input
                type="text"
                className="form-input"
                value={formData.NgayLapHoaDon || new Date().toLocaleDateString()}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tổng số tiền</label>
              <input
                type="text"
                className="form-input"
                value={formData.TongTien}
                onChange={(e) => setFormData({ ...formData, TongTien: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={formData.TinhTrang || 'Chưa thanh toán'}
                onChange={(e) => setFormData({ ...formData, TinhTrang: e.target.value })}
              >
                <option>Đã thanh toán</option>
                <option>Chưa thanh toán</option>
                <option>Đã hủy</option>
              </select>
            </div>

            <button className="add-btn" type="submit">
              {action === 'edit' ? 'Cập nhật' : 'Lưu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;
