import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/AddInvoice.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { Edit, Trash,ChevronLeft, X } from 'lucide-react';

const AddInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { action, item } = location.state || {};

  const [formData, setFormData] = useState({
    MaBenhNhan: '',
    MaBacSi: '',
    MaHoSo: '',
    TongTien: '0',
    TinhTrang: 'Chưa thanh toán',
    NgayLapHoaDon: '',
    NgayThanhToan: '',
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [MaBenhNhans, setMaBenhNhans] = useState('');
  const [MaBacSis, setMaBacSis] = useState('');


  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    // Fetch doctors
    fetch('http://localhost:5000/api/nguoidung')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setDoctors(data.data.filter((user) => user.VaiTro === 'Bác sĩ'));
        }
      })
      .catch((error) => console.error('Lỗi khi lấy dữ liệu bác sĩ:', error));
  }, []);

  useEffect(() => {
    // Fetch patients
    fetch('http://localhost:5000/api/medical-records')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPatients(data.data);
        }
      })
      .catch((error) => console.error('Lỗi khi lấy dữ liệu bệnh nhân:', error));
  }, []);

  useEffect(() => {
    // Handle edit mode
    if (action === 'edit' && item) {
      setFormData({
        MaBenhNhan: item.MaBenhNhan || '',
        MaBacSi: item.MaBacSi || '',
        MaHoSo: item.MaHoSo || '',
        TongTien: item.TongTien || '0',
        TinhTrang: item.TinhTrang || 'Chưa thanh toán',
        NgayLapHoaDon: item.NgayLapHoaDon || '',
        NgayThanhToan: item.NgayThanhToan || '',
      });
  setMaBacSis(item.MaBacSi);
  setMaBenhNhans(item.MaBenhNhan);
      setSelectedPatient(patients.find((p) => p.MaBenhNhan === item.MaBenhNhan) || null);
      setSelectedDoctor(doctors.find((d) => d.MaBacSi === item.MaBacSi) || null);
    }
  }, [action, item, patients, doctors]);

  const handlePatientSearchChange = (e) => {
    setPatientSearchTerm(e.target.value);
  };

  const handleDoctorSearchChange = (e) => {
    setDoctorSearchTerm(e.target.value);
  };

  const handleSelectPatient = (patient) => {
    if (!patient) return;
    setSelectedPatient(patient);
    setPatientSearchTerm(patient.HoVaTen || '');
    setMaBenhNhans(patient.MaBenhNhan);
    setFormData((prev) => ({
      ...prev,
      MaBenhNhan: patient.MaBenhNhan || '',
      MaHoSo: patient.ID || '',
    }));
  };

  const handleSelectDoctor = (doctor) => {
    if (!doctor) return;
    setSelectedDoctor(doctor);
    setDoctorSearchTerm(doctor.TenDayDu || '');
    setMaBacSis(doctor.ID);
    setFormData((prev) => ({
      ...prev,
      MaBacSi: doctor.ID || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!MaBenhNhans || !MaBacSis) {
      alert('Vui lòng chọn cả bệnh nhân và bác sĩ!');
      return;
    }

    const updatedFormData = {
      ...formData,
      MaBenhNhan: MaBenhNhans,
      MaBacSi: MaBacSis,
    };

    try {
      let response, data;
      if (action === 'add') {
        response = await fetch('http://localhost:5000/api/vienphi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFormData),
        });
      } else if (action === 'edit') {
        response = await fetch(`http://localhost:5000/api/vienphi/${item.MaHoaDon}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFormData),
        });
      }
      data = await response.json();
      alert(data.success ? 'Thành công!' : data.message);

    } catch (error) {
      console.error('❌ Lỗi khi thực hiện thao tác:', error.message);
      alert('Đã xảy ra lỗi, vui lòng thử lại!');
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.HoVaTen?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      patient.SDT?.includes(patientSearchTerm) ||
      patient.CCCD?.includes(patientSearchTerm)
  );

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.TenDayDu?.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
      doctor.SDT?.includes(doctorSearchTerm) ||
      doctor.CCCD?.includes(doctorSearchTerm)
  );

  return (
    <div className="container">
      <Menu1 />
      <div className="main-content">
          <div className="">
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
        </div>
        <div className="form-container">
          <h1 style={{ color: '#000' }}>{action === 'edit' ? 'Sửa hóa đơn' : 'Thêm hóa đơn'}</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ color: '#000' }} >Tìm kiếm bệnh nhân * (Bệnh nhân đang chọn: {MaBenhNhans})</label>
              <input
                type="text"
                value={patientSearchTerm}
                onChange={handlePatientSearchChange}
                placeholder="Nhập tên, CCCD, hoặc số điện thoại..."
              />
              <div className="search-results">
                {filteredPatients.map((patient) => (
                  <div key={patient.MaBenhNhan} onClick={() => handleSelectPatient(patient)}>
                    <span style={{ color: '#000' }} >Mã hồ sơ: {patient.ID} - Mã bệnh nhân: {patient.MaBenhNhan} - Họ và tên: {patient.HoVaTen}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label style={{ color: '#000' }} >Tìm kiếm bác sĩ * (Bác sĩ đã chọn: {MaBacSis})</label>
              <input
                type="text"
                value={doctorSearchTerm}
                onChange={handleDoctorSearchChange}
                placeholder="Nhập tên, CCCD, hoặc số điện thoại..."
              />
              <div className="search-results">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.ID} onClick={() => handleSelectDoctor(doctor)}>
                    <span style={{ color: '#000' }} >Mã bác sĩ: {doctor.ID} - Tên đầy đủ: {doctor.TenDayDu} - Chuyên khoa: {doctor.ChuyenMon} - Phòng khám {doctor.PhongKham}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label style={{ color: '#000' }} >Ngày lập hóa đơn * </label>
              <input type="text" value={formData.NgayLapHoaDon || new Date().toLocaleDateString()} disabled />
            </div>
            <div className="form-group">
              <label style={{ color: '#000' }} >Tổng tiền</label>
              <input
                type="text"
                value={formData.TongTien}
                onChange={(e) => setFormData((prev) => ({ ...prev, TongTien: e.target.value }))}
              />
            </div>
            <button type="submit" className="add-button">{action === 'edit' ? 'Cập nhật' : 'Thêm mới'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;
