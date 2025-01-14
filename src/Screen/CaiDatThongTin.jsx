import React, { useEffect, useState } from "react";
import { Edit, Trash2, ChevronLeft, X } from 'lucide-react';
import '../Styles/QuanLyNguoiDung.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import Cookies from 'js-cookie';

import { useNavigate, useLocation } from 'react-router-dom';

const QuanLyNguoiDungScreen = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('edit'); // 'add' hoặc 'edit'
    const [imageURL, setImageURL] = useState('https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [formData, setFormData] = useState({
        ID: '',
        Hinh: '',
        TenDayDu: '',
        Email: '',
        SDT: '',
        CCCD: '',
        VaiTro: '',
        DiaChi: '',
        Tuoi: '',
        GioiTinh: 'Nam',
        ChuyenMon: '',
        PhongKham: '',
    });
    const [viewRole, setViewRole] = useState('Bệnh nhân'); // Default view is "Bệnh nhân"
    const [searchTerm, setSearchTerm] = useState(""); // State để lưu từ khóa tìm kiếm
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const itemsPerPage = 2; // Số lượng người dùng trên mỗi trang

    const [DangDangNhap, setDangDangNhap] = useState('');

    useEffect(() => {
        const fetchLoginInfo = async () => {
            try {
                // Gọi API /api/login_info
                const response = await fetch('http://localhost:5000/api/login_info');
                if (!response.ok) throw new Error('Không thể lấy dữ liệu từ /api/login_info');
                const loginData = await response.json();
                console.log('Dữ liệu login_info:', loginData);

                if (loginData.success && loginData.data.length > 0) {
                    const firstLogin = loginData.data[0]; // Lấy dòng đầu tiên
                    setDangDangNhap(firstLogin.DangDangNhap); // Lưu ID vào state
                    return firstLogin.DangDangNhap; // Trả về ID để sử dụng tiếp
                }
            } catch (error) {
                console.error('Lỗi khi gọi API login_info:', error);
            }
            return null; // Trả về null nếu lỗi
        };

        const fetchUsers = async (loginID) => {
            try {
                // Gọi API /api/nguoidung
                const response = await fetch('http://localhost:5000/api/nguoidung');
                if (!response.ok) throw new Error('Không thể lấy dữ liệu từ /api/nguoidung');
                const userData = await response.json();
                console.log('Dữ liệu nguoidung:', userData);

                if (userData.success && userData.data.length > 0) {
                    // Tìm người dùng có ID khớp
                    const matchedUser = userData.data.find((user) => user.ID === loginID);
                    if (matchedUser) {
                        openModal('edit', matchedUser); // Thực hiện hành động với user khớp
                    } else {
                        console.log('Không tìm thấy người dùng với ID:', loginID);
                    }
                }
            } catch (error) {
                console.error('Lỗi khi gọi API nguoidung:', error);
            }
        };

        const fetchData = async () => {
            setLoading(true); // Bắt đầu loading
            const loginID = await fetchLoginInfo(); // Lấy ID đăng nhập
            if (loginID) {
                await fetchUsers(loginID); // Gọi API người dùng nếu có ID
            }
            setLoading(false); // Kết thúc loading
        };

        fetchData(); // Gọi hàm chính
    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setImageURL(e.target.value || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-h1vrv3P4-_aHOIkmZjhtiIfxWKD6n4f3ig&s');

    };

    const handlePaste = (event) => {
        // Lấy nội dung dán vào
        const pastedText = event.clipboardData.getData('text');
        // Cập nhật giá trị input
        setImageURL(pastedText || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-h1vrv3P4-_aHOIkmZjhtiIfxWKD6n4f3ig&s');
    };




    const validateInput = () => {
        const { Email, SDT, Tuoi, VaiTro, TenDayDu } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,15}$/;

        // Kiểm tra tên đầy đủ
        if (!TenDayDu.trim()) {
            alert('Tên đầy đủ không được để trống!');
            return false;
        }

        // Kiểm tra vai trò
        if (!VaiTro) {
            alert('Bạn phải chọn vai trò!');
            return false;
        }

        // Kiểm tra email
        if (!emailRegex.test(Email)) {
            alert('Email không hợp lệ!');
            return false;
        }

        // Kiểm tra số điện thoại
        if (!phoneRegex.test(SDT)) {
            alert('Số điện thoại phải từ 10 đến 15 chữ số!');
            return false;
        }

        // Kiểm tra các trường riêng cho "Bệnh nhân"
        if (VaiTro === 'Bệnh nhân') {
            const { DiaChi, Tuoi, GioiTinh } = formData;
            if (!DiaChi.trim()) {
                alert('Địa chỉ không được để trống!');
                return false;
            }
            if (isNaN(Tuoi) || Tuoi <= 0 || Tuoi > 120) {
                alert('Tuổi phải là một số hợp lệ trong khoảng từ 1 đến 120!');
                return false;
            }
            if (!GioiTinh.trim()) {
                alert('Giới tính không được để trống!');
                return false;
            }
        }

        // Kiểm tra các trường riêng cho "Bác sĩ"
        if (VaiTro === 'Bác sĩ') {
            const { ChuyenMon, PhongKham } = formData;
            if (!ChuyenMon.trim()) {
                alert('Chuyên môn không được để trống!');
                return false;
            }
            if (!PhongKham.trim()) {
                alert('Phòng khám không được để trống!');
                return false;
            }
        }

        return true; // Dữ liệu hợp lệ
    };

    const addUser = async () => {
        if (!validateInput()) return;

        try {
            const response = await fetch('http://localhost:5000/api/nguoidung', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                setUsers([...users, data.data]);
                setShowModal(false);
                setFormData({
                    ID:'',
                    Hinh: '',
                    TenDayDu: '',
                    Email: '',
                    SDT: '',
                    CCCD: '',
                    VaiTro: '',
                    DiaChi: '',
                    Tuoi: '',
                    GioiTinh: '',
                    ChuyenMon: '',
                    PhongKham: ''
                });
            } else alert(data.message);
        } catch (error) {
            console.error('Lỗi khi thêm người dùng:', error);
        }
    };

    const editUser = async () => {
        if (!validateInput()) return;

        try {
            const response = await fetch(`http://localhost:5000/api/nguoidung/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                setUsers(users.map(user => (user.ID === currentUserId ? data.data : user)));
                alert("Sửa dữ liệu thành công");
                window.location.reload(true);
            } else alert(data.message);
        } catch (error) {
            console.error('Lỗi khi chỉnh sửa người dùng:', error);
        }
    };



    const openModal = (type, user = null) => {
        setModalType(type);
        setShowModal(true);
        if (type === 'edit' && user) {
            setCurrentUserId(user.ID);
            setFormData({
                ID: user.ID,
                Hinh: user.Hinh || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-h1vrv3P4-_aHOIkmZjhtiIfxWKD6n4f3ig&s',
                TenDayDu: user.TenDayDu,
                Email: user.Email,
                SDT: user.SDT,
                CCCD: user.CCCD,
                VaiTro: user.VaiTro || '',
                DiaChi: user.DiaChi || '',
                Tuoi: user.Tuoi || '',
                GioiTinh: user.GioiTinh || 'Nam', // Giới tính lấy giá trị từ người dùng
                ChuyenMon: user.ChuyenMon || '',
                PhongKham: user.PhongKham || ''
            });
            setImageURL(user.Hinh || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-h1vrv3P4-_aHOIkmZjhtiIfxWKD6n4f3ig&s');
        } else {
            setFormData({
                ID:'',
                Hinh: '',
                TenDayDu: '',
                Email: '',
                SDT: '',
                CCCD: '',
                VaiTro: '',
                DiaChi: '',
                Tuoi: '',
                GioiTinh: '', // Giới tính mặc định là trống khi thêm mới
                ChuyenMon: '',
                PhongKham: ''
            });
        }
    };

    // Lọc người dùng theo vai trò
    const filterUsersByRole = (role) => {
        return users.filter(user => user.VaiTro === role);
    };

    // Tìm kiếm người dùng theo từ khóa
    const searchUsers = (term) => {
        return users.filter(user =>
            Object.values(user).some(value =>
                String(value).toLowerCase().includes(term.toLowerCase())
            )
        );
    };

    // Kết quả tìm kiếm hoặc lọc theo vai trò
    const filteredResults = searchTerm ? searchUsers(searchTerm) : filterUsersByRole(viewRole);
    // Phân trang
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredResults.slice(indexOfFirstUser, indexOfLastUser);


    const handleSave = () => {
        // Cập nhật hình ảnh khi nhấn "Lưu"
        setImageURL(formData.Hinh || 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg'); // Nếu không có URL, dùng 'default_image_url'
    };

    // Cập nhật trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
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
                <div className="form-container">
                    <div className="card-header">
                        <h2 style={{ color: '#000' }}>Cài đặt người dùng</h2>
                    </div>
                    {showModal && (
                        <div className="modal2">
                            <div className="modal-content2">
{/*                                 <h3 */}
{/*                                      style={{ */}
{/*                                       color: Cookies.get('Theme') === 'dark' ? '#000' : '#000' */}
{/*                                       }} */}
{/*                                 >{modalType === 'add' ? 'Thêm người dùng' : 'Chỉnh sửa người dùng'}</h3> */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <img
                                            src={imageURL} // Hiển thị hình ảnh từ state imageURL
                                            alt="Hình"
                                            className="user-image-demo"
                                        />
                                    </div>
                                    <div  style={{ display: "flex", alignItems: 'center' }}>
                                        <div className="input-container">
                                            <label>Hình URL *</label>
                                            <input
                                                type="text"
                                                name="Hinh"
                                                onPaste={handlePaste}
                                                value={formData.Hinh}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <button
                                            style={{
                                                width: '15%',
                                                marginTop: '24px',
                                                padding: "10px 20px",
                                                border: "none",
                                                height: "40px",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                                fontWeight: 'bolder',
                                                cursor: "pointer",
                                                transition: "background-color 0.3s ease",
                                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                                backgroundColor: "#16a2de",
                                                color: 'white',
                                            }}
                                            onClick={handleSave} // Khi bấm "Lưu", thay đổi hình ảnh
                                        >
                                            Cập nhật
                                        </button>
                                    </div>
                                </div>

                                <div style={{ fontSize: "15px", paddingBottom: "15px", color: '#000', fontWeight: 'bolder',marginTop: "10px" }}>Thông tin chính
                                   <div style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "8px", marginTop: "10px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div className="input-container2">
                                                <label>Mã người dùng</label>
                                                <input
                                                    type="text"
                                                    name="MaNguoiDung"
                                                    value={formData.ID}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="input-container2">
                                                <label>Tên đầy đủ *</label>
                                                <input
                                                    type="text"
                                                    name="TenDayDu"
                                                    value={formData.TenDayDu}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>


                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                                            <div className="input-container2">
                                                <label>E-mail *</label>
                                                <input
                                                    type="email"
                                                    name="Email"
                                                    value={formData.Email}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="input-container2">
                                                <label>Số điện thoại *</label>
                                                <input
                                                    type="text"
                                                    name="SDT"
                                                    value={formData.SDT}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingBottom: "10px" }}>
                                            <div className="input-container3">
                                            <label>CCCD *</label>
                                            <input
                                                type="text"
                                                name="CCCD"
                                                value={formData.CCCD}
                                                onChange={handleInputChange}
                                            />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ fontSize: "15px", paddingBottom: "10px", color: '#000', fontWeight: 'bolder',marginTop: "10px" }}>Thông tin Thêm
                                    <div style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "8px", marginTop: "10px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div className="input-container3">
                                                <label>Vai trò *</label>
                                                <select
                                                    name="VaiTro"
                                                    value={formData.VaiTro}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Chọn vai trò</option>
                                                    <option value="Bệnh nhân">Bệnh nhân</option>
                                                    <option value="Bác sĩ">Bác sĩ</option>
                                                </select>
                                            </div>
                                        </div>



                                        {formData.VaiTro === 'Bệnh nhân' && (
                                            <>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                                                    <div className="input-container2">
                                                        <label>Giới tính *</label>
                                                        <select
                                                            name="GioiTinh"
                                                            value={formData.GioiTinh} // Chọn giới tính hiện tại
                                                            onChange={handleInputChange}
                                                        >
                                                            <option value="">Chọn giới tính *</option>
                                                            <option value="Nam">Nam</option>
                                                            <option value="Nữ">Nữ</option>
                                                            <option value="Khác">Khác</option>
                                                        </select>
                                                    </div>
                                                   <div className="input-container2">
                                                        <label>Tuổi *</label>
                                                        <input
                                                            type="number"
                                                            name="Tuoi"
                                                            value={formData.Tuoi}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                                                    <div className="input-container3">
                                                        <label>Địa chỉ *</label>
                                                        <input
                                                            type="text"
                                                            name="DiaChi"
                                                            value={formData.DiaChi}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>


                                            </>
                                        )}


                                        {formData.VaiTro === 'Bác sĩ' && (
                                            <>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px",paddingBottom: "10px" }}>
                                                    <div className="input-container2">
                                                        <label>Chuyên môn *</label>
                                                        <input
                                                            type="text"
                                                            name="ChuyenMon"
                                                            value={formData.ChuyenMon}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>

                                                    <div className="input-container2">
                                                        <label>Phòng khám *</label>
                                                        <input
                                                            type="text"
                                                            name="PhongKham"
                                                            value={formData.PhongKham}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button onClick={modalType === 'add' ? addUser : editUser}>
                                        {modalType === 'add' ? 'Thêm' : 'Lưu'}
                                    </button>
{/*                                     <button onClick={() => setShowModal(false)}>Hủy</button> */}
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            </main>
        </div>
    );
};

export default QuanLyNguoiDungScreen;