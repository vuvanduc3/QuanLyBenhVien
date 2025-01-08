import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit, Trash } from 'lucide-react';
import '../Styles/AddInvoice.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const AddInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { action, item } = location.state || {}; // Lấy action và item từ state khi điều hướng
  const [formData, setFormData] = useState({
    MaBenhNhan: '',
    MaBacSi: '',
    TongTien: '',
    TinhTrang: 'Chưa thanh toán',
    NgayLapHoaDon: '',
    NgayThanhToan: ''
  });

  const [users, setUsers] = useState([]); // Lưu danh sách người dùng
  const [patientSearchTerm, setPatientSearchTerm] = useState(''); // Từ khóa tìm kiếm bệnh nhân
  const [doctorSearchTerm, setDoctorSearchTerm] = useState(''); // Từ khóa tìm kiếm bác sĩ
  const [selectedPatient, setSelectedPatient] = useState(null); // Bệnh nhân đã chọn
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Bác sĩ đã chọn
  const [isExpanded, setIsExpanded] = useState(false); // Trạng thái mở rộng thông tin
  const [showPatientResults, setShowPatientResults] = useState(false); // Kiểm soát hiển thị danh sách bệnh nhân
  const [showDoctorResults, setShowDoctorResults] = useState(false); // Kiểm soát hiển thị danh sách bác sĩ

  const [isExpandedBN, setIsExpandedBN] = useState(false); // Trạng thái mở rộng thông tin
  const handleExpandBenhNhanInfo = () => {
      setIsExpandedBN(!isExpandedBN); // Chuyển đổi trạng thái mở rộng
  };

  // Fetch dữ liệu người dùng từ API khi tải trang
  useEffect(() => {
    fetch('http://localhost:5000/api/nguoidung')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data); // Lấy toàn bộ người dùng
        }
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu người dùng:", error));
  }, []);

  // Fetch dữ liệu khi sửa hóa đơn
  useEffect(() => {
    if (action === 'edit' && item) {
      setFormData({
        MaBenhNhan: item.MaBenhNhan,
        MaBacSi: item.MaBacSi,
        TongTien: item.TongTien,
        TinhTrang: item.TinhTrang?item.TinhTrang:'Chưa thanh toán',
        NgayLapHoaDon: item.NgayLapHoaDon,
        NgayThanhToan: item.NgayThanhToan,
      });
    }
  }, [action, item]);

  // Cập nhật thông tin bệnh nhân và bác sĩ khi formData thay đổi
  useEffect(() => {
    if (formData.MaBenhNhan) {
      const patient = users.find(user => user.ID === formData.MaBenhNhan);
      setSelectedPatient(patient); // Cập nhật thông tin bệnh nhân
    }
  }, [formData.MaBenhNhan, users]);

  useEffect(() => {
    if (formData.MaBacSi) {
      const doctor = users.find(user => user.ID === formData.MaBacSi);
      setSelectedDoctor(doctor); // Cập nhật thông tin bác sĩ
    }
  }, [formData.MaBacSi, users]);

  // Lọc danh sách người dùng theo từ khóa tìm kiếm bệnh nhân
  const filteredPatients = users.filter(
    (user) => user.VaiTro === 'Bệnh nhân' &&
              (user.TenDayDu.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
               user.SDT.includes(patientSearchTerm) ||
               user.CCCD.includes(patientSearchTerm))
  );

  // Lọc danh sách người dùng theo từ khóa tìm kiếm bác sĩ
  const filteredDoctors = users.filter(
    (user) => user.VaiTro === 'Bác sĩ' &&
              (user.TenDayDu.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
               user.SDT.includes(doctorSearchTerm) ||
               user.CCCD.includes(doctorSearchTerm))
  );

  // Xử lý thay đổi tìm kiếm bệnh nhân
  const handlePatientSearchChange = (e) => {
    setPatientSearchTerm(e.target.value);
    setShowPatientResults(true); // Hiển thị lại danh sách tìm kiếm
  };

  // Xử lý thay đổi tìm kiếm bác sĩ
  const handleDoctorSearchChange = (e) => {
    setDoctorSearchTerm(e.target.value);
    setShowDoctorResults(true); // Hiển thị lại danh sách tìm kiếm
  };

  // Xử lý chọn bệnh nhân
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient); // Chọn bệnh nhân
    setPatientSearchTerm(patient.TenDayDu); // Cập nhật từ khóa tìm kiếm
    setShowPatientResults(false); // Ẩn danh sách tìm kiếm
    setFormData({ ...formData, MaBenhNhan: patient.ID }); // Cập nhật MaBenhNhan
  };

  // Xử lý chọn bác sĩ
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor); // Chọn bác sĩ
    setDoctorSearchTerm(doctor.TenDayDu); // Cập nhật từ khóa tìm kiếm
    setShowDoctorResults(false); // Ẩn danh sách tìm kiếm
    setFormData({ ...formData, MaBacSi: doctor.ID }); // Cập nhật MaBacSi
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatient || !selectedDoctor) {
      alert('Vui lòng chọn cả bệnh nhân và bác sĩ!');
      return;
    }

    const updatedFormData = { ...formData, MaBenhNhan: selectedPatient.ID, MaBacSi: selectedDoctor.ID };

    try {
      if (action === 'add') {
        // Thêm hóa đơn
        const response = await fetch('http://localhost:5000/api/vienphi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormData),
        });
        const data = await response.json();
        if (data.success) {
          alert("Thêm hóa đơn thành công!");
        } else {
          alert(data.message);
        }
      } else if (action === 'edit') {
        // Sửa hóa đơn
        const response = await fetch(`http://localhost:5000/api/vienphi/${item.MaHoaDon}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormData),
        });
        const data = await response.json();
        if (data.success) {
          alert("Cập nhật hóa đơn thành công!");
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi thực hiện thao tác:", error.message);
      alert("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

  // Hàm xử lý khi nhấn vào bác sĩ để mở rộng thông tin
  const handleExpandDoctorInfo = () => {
    setIsExpanded(!isExpanded); // Chuyển đổi trạng thái mở rộng
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
              <label className="form-label">Tìm kiếm bệnh nhân</label>
              <input
                type="text"
                className="form-input"
                value={patientSearchTerm}
                onChange={handlePatientSearchChange}
                placeholder="Tìm kiếm bệnh nhân bằng tên, CCCD, hoặc số điện thoại..."
              />
              {showPatientResults && (
                <div className="search-results">
                  {filteredPatients.map((user) => (
                    <div
                      key={user.ID}
                      className="search-result-item"
                      onClick={() => handleSelectPatient(user)}
                    >
                      <img src={user.Hinh} alt={user.TenDayDu} width="35" height="30" />
                      <span>{user.TenDayDu} (SDT: {user.SDT}, CCCD: {user.CCCD})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedPatient && (
              <div className="selected-medicine" onClick={handleExpandBenhNhanInfo}>
                <span>Đã chọn bệnh nhân: {selectedPatient.TenDayDu}</span>
                            {isExpandedBN && (
                            <div className="expanded-info">
                              <span>CCCD: {selectedPatient.CCCD}</span>
                              <span>SDT: {selectedPatient.SDT}</span>

                            </div>
                             )}
              </div>
            )}

            {/* Tìm kiếm bác sĩ */}
            <div className="form-group">
              <label className="form-label">Tìm kiếm bác sĩ</label>
              <input
                type="text"
                className="form-input"
                value={doctorSearchTerm}
                onChange={handleDoctorSearchChange}
                placeholder="Tìm kiếm bác sĩ bằng tên, CCCD, hoặc số điện thoại..."
              />
              {showDoctorResults && (
                <div className="search-results">
                  {filteredDoctors.map((user) => (
                    <div
                      key={user.ID}
                      className="search-result-item"
                      onClick={() => handleSelectDoctor(user)}
                    >
                      <img src={user.Hinh} alt={user.TenDayDu} width="35" height="30" />
                      <span>{user.TenDayDu} (Chuyên môn: {user.ChuyenMon}, Phòng khám: {user.PhongKham})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedDoctor && (
              <div className="selected-medicine" onClick={handleExpandDoctorInfo}>
                <span>Đã chọn bác sĩ: {selectedDoctor.TenDayDu}</span>


                {isExpanded && (
                  <div className="expanded-info" >
                    <span>CCCD: {selectedDoctor.CCCD}</span>
                    <span>Chuyên môn: {selectedDoctor.ChuyenMon}</span>
                    <span>Phòng khám: {selectedDoctor.PhongKham}</span>
                  </div>
                )}
              </div>
            )}

            {/* Các trường còn lại */}
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

            <div className="content-header">
              <button className="add-btn" type="submit">
                {action === 'edit' ? 'Cập nhật' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;
