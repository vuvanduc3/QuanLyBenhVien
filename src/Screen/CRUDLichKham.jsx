import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit, Trash,ChevronLeft, X } from 'lucide-react';
import '../Styles/CRUDLichKham.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';


const CRUDLichKham = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { action, item } = location.state || {}; // Lấy action và item từ state khi điều hướng
  const [formData, setFormData] = useState({
    MaBenhNhan: '',
    MaBacSi: '',
    NgayKham: '',
    GioKham: '',
    TrangThai: 'Đang chờ khám',
    PhongKham: ''
  });

  const [users, setUsers] = useState([]); // Lưu danh sách người dùng
  const [patientSearchTerm, setPatientSearchTerm] = useState(''); // Từ khóa tìm kiếm bệnh nhân
  const [doctorSearchTerm, setDoctorSearchTerm] = useState(''); // Từ khóa tìm kiếm bác sĩ
  const [selectedPatient, setSelectedPatient] = useState(null); // Bệnh nhân đã chọn
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Bác sĩ đã chọn
  const [isExpanded, setIsExpanded] = useState(false); // Trạng thái mở rộng thông tin
  const [showPatientResults, setShowPatientResults] = useState(false); // Kiểm soát hiển thị danh sách bệnh nhân
  const [showDoctorResults, setShowDoctorResults] = useState(false); // Kiểm soát hiển thị danh sách bác sĩ

  const [isExpandedBN, setIsExpandedBN] = useState(false); // Trạng thái mở rộng thông tin bệnh nhân
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
      const formattedNgayKham = new Date(item.NgayKham).toISOString().split('T')[0];
      const formattedTime =  item.GioKham.slice(11, 19);

      setFormData({
        MaBenhNhan: item.MaBenhNhan,
        MaBacSi: item.MaBacSi,
        NgayKham: formattedNgayKham,
        GioKham: formattedTime,
        TrangThai: item.TrangThai,
        PhongKham: item.PhongKham,
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

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (!selectedPatient || !selectedDoctor) {
        alert('Vui lòng chọn cả bệnh nhân và bác sĩ!');
        return;
      }

      // Xử lý định dạng ngày
      const formattedNgayKham = formData.NgayKham ? new Date(formData.NgayKham).toISOString().split('T')[0] : null; // Định dạng ngày 'yyyy-MM-dd'

        // Kiểm tra nếu không có giá trị
      if (!formattedNgayKham ) {
          alert('Vui lòng nhập ngày khám');
      }

      // Xử lý định dạng giờ, nếu giờ có dạng 'HH:mm' thì thêm ':00' vào
      let formattedGioKham = formData.GioKham;
      if (!formattedGioKham.includes(':00')) {
        formattedGioKham = `${formattedGioKham}:00`; // Thêm ':00' nếu không có giây
      }

      if (!formattedGioKham) {
         alert('Vui lòng nhập giờ');
      }

      const updatedFormData = {
        ...formData,
        MaBenhNhan: selectedPatient.ID,
        MaBacSi: selectedDoctor.ID,
        NgayKham: formattedNgayKham, // Cập nhật lại ngày
        GioKham: formattedGioKham,  // Cập nhật lại giờ với định dạng 'HH:mm:ss'
      };

      try {
        if (action === 'add') {
          // Thêm lịch hẹn
          const response = await fetch('http://localhost:5000/api/lichkham', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedFormData),
          });
          const data = await response.json();
          if (data.success) {
            alert("Thêm lịch hẹn thành công!");

            const tenThongBao = "Thông báo: Thêm lịch hẹn cho bệnh nhân "+ selectedPatient.TenDayDu +" với bác sĩ " + selectedDoctor.TenDayDu+ " thành công tại phòng khám " +formData.PhongKham +" !";
            const loaiThongBao = "Lịch hẹn";
            const chucNang = "Thêm dữ liệu";

            themThongBao(tenThongBao, loaiThongBao, chucNang);

          } else {
            alert(data.message);
          }
        } else if (action === 'edit') {
          // Sửa lịch hẹn
          const response = await fetch(`http://localhost:5000/api/lichkham/${item.MaLichKham}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedFormData),
          });
          const data = await response.json();
          if (data.success) {
            alert("Cập nhật lịch hẹn thành công!");

            const tenThongBao = "Thông báo: Sửa lịch hẹn cho bệnh nhân có Mã lịch khám: "+ item.MaLichKham +" - Họ tên:  " + selectedPatient.TenDayDu +" thành công!";
            const loaiThongBao = "Lịch hẹn";
            const chucNang = "Sửa dữ liệu";

            themThongBao(tenThongBao, loaiThongBao, chucNang);

          } else {
            alert(data.message);
          }
        }
      } catch (error) {
        console.error("❌ Lỗi khi thực hiện thao tác:", error.message);
        alert("Đã xảy ra lỗi, vui lòng thử lại!");
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



  // Hàm xử lý khi nhấn vào bác sĩ để mở rộng thông tin
  const handleExpandDoctorInfo = () => {
    setIsExpanded(!isExpanded); // Chuyển đổi trạng thái mở rộng
  };

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


            <div className="form-container">
              <div className="form-header">
                <h1 style={{ color: '#000' }}>{action === 'edit' ? 'Sửa lịch hẹn' : 'Thêm lịch hẹn'} {formData.NgayKham} {formData.GioKham}</h1>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Tìm kiếm bệnh nhân */}
                <div className="form-group">
                  <label style={{ color: '#000' }}>Tìm kiếm bệnh nhân *</label>
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
                  <label style={{ color: '#000' }}>Tìm kiếm bác sĩ *</label>
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
                      <div className="expanded-info">
                        <span>CCCD: {selectedDoctor.CCCD}</span>
                        <span>Chuyên môn: {selectedDoctor.ChuyenMon}</span>
                        <span>Phòng khám: {selectedDoctor.PhongKham}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Các trường còn lại */}

                <div className="form-group">
                  <label style={{ color: '#000' }}>Ngày khám *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.NgayKham}
                    onChange={(e) => setFormData({ ...formData, NgayKham: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: '#000' }}>Giờ khám *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.GioKham}
                    onChange={(e) => setFormData({ ...formData, GioKham: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: '#000' }}>Tình trạng *</label>
                  <select
                    className="form-input"
                    value={formData.TrangThai}
                    onChange={(e) => setFormData({ ...formData, TrangThai: e.target.value })}
                  >
                    <option value="Đang chờ khám">Đang chờ khám</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ color: '#000' }}>Phòng khám *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.PhongKham}
                    onChange={(e) => setFormData({ ...formData, PhongKham: e.target.value })}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="add-btn">
                    {action === 'edit' ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CRUDLichKham;
