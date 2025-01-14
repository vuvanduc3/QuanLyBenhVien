import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from 'lucide-react';
import '../Styles/QuanLyNguoiDung.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import Cookies from 'js-cookie';

const QuanLyNguoiDungScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' hoặc 'edit'
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
        GioiTinh: '',
        ChuyenMon: '',
        PhongKham: '',
    });
    const [viewRole, setViewRole] = useState('Bệnh nhân'); // Default view is "Bệnh nhân"
    const [searchTerm, setSearchTerm] = useState(""); // State để lưu từ khóa tìm kiếm
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const itemsPerPage = 5; // Số lượng người dùng trên mỗi trang

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/nguoidung');
                if (!response.ok) throw new Error('Không thể lấy dữ liệu người dùng');
                const data = await response.json();
                console.log(data); // In dữ liệu trả về ở đây để kiểm tra
                if (data.success) {
                    setUsers(data.data);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
                setCurrentUserId(null);
            } else alert(data.message);
        } catch (error) {
            console.error('Lỗi khi chỉnh sửa người dùng:', error);
        }
    };

    const deleteUser = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/nguoidung/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) setUsers(users.filter(user => user.ID !== id));
            else alert(data.message);
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
        }
    };

    const openModal = (type, user = null) => {
        setModalType(type);
        setShowModal(true);
        if (type === 'edit' && user) {
            setCurrentUserId(user.ID);
            setFormData({
                ID: user.ID,
                Hinh: user.Hinh,
                TenDayDu: user.TenDayDu,
                Email: user.Email,
                SDT: user.SDT,
                CCCD: user.CCCD,
                VaiTro: user.VaiTro || '',
                DiaChi: user.DiaChi || '',
                Tuoi: user.Tuoi || '',
                GioiTinh: user.GioiTinh || '', // Giới tính lấy giá trị từ người dùng
                ChuyenMon: user.ChuyenMon || '',
                PhongKham: user.PhongKham || ''
            });
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
                <Search1 />
                <div className="content">
                    <div class={Cookies.get('Theme') === 'dark'? "dark-theme" : "light-theme"}>
                    <div className="card-header">
                        <h2 className="card-title">Quản lý người dùng</h2>

                    </div>
                    {showModal && (
                        <div className="modal3">
                            <div className="modal-content">
                                <h3>{modalType === 'add' ? 'Thêm người dùng' : 'Chỉnh sửa người dùng'}</h3>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: "100%" }}>
                                        <img
                                            src={imageURL} // Hiển thị hình ảnh từ state imageURL
                                            alt="Hình"
                                            className="user-image-demo"
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: 'center', justifyContent: "space-between", width: "100%" }}>
                                        <div style={{ width: "70%", marginRight: "10px" }}>
                                            <label
                                             style={{
                                                 color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                                 fontWeight: 'normal'
                                             }}

                                            >Hình URL</label>
                                            <input
                                                type="text"
                                                name="Hinh"
                                                placeholder="Nhập địa chỉ hình ảnh https://..."
                                                value={formData.Hinh}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <button
                                            style={{
                                                width: '30%',
                                                marginTop: '17px',
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

                                <div style={{ fontSize: "11px", paddingBottom: "15px", color: '#a6adba', fontWeight: 'bolder' }}>Thông tin chính</div>

                                    <div style={{ width: "100%" }} >
                                        <label
                                               style={{
                                                  color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                                  fontWeight: 'normal'
                                               }}
                                        >Mã người dùng</label>
                                        <input
                                            type="text"
                                            placeholder="Tự động tăng"
                                            name="MaNguoiDung"
                                            value={formData.ID}
                                            readOnly
                                        />
                                    </div>
                                    <div style={{ width: "100%" }}>
                                        <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}

                                        >Tên đầy đủ *</label>
                                        <input
                                            type="text"
                                            name="TenDayDu"
                                            placeholder="Nhập tên đầy đủ"
                                            value={formData.TenDayDu}
                                            onChange={handleInputChange}
                                        />
                                    </div>




                                    <div style={{ width: "100%" }}>
                                        <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}
                                        >E-mail *</label>
                                        <input
                                            type="email"
                                            name="Email"
                                            placeholder="example@gmail.com"
                                            value={formData.Email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div style={{ width: "100%" }}>
                                        <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}
                                        >Số điện thoại *</label>
                                        <input
                                            type="text"
                                            name="SDT"
                                            placeholder="Nhập số điện thoại"
                                            value={formData.SDT}
                                            onChange={handleInputChange}
                                        />
                                    </div>



                                <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}


                                >CCCD *</label>
                                <input
                                    type="text"
                                    name="CCCD"
                                    placeholder="Nhập CCCD/CMND"
                                    value={formData.CCCD}
                                    onChange={handleInputChange}
                                />

                                <div style={{ fontSize: "11px", paddingBottom: "15px", color: '#a6adba', fontWeight: 'bolder' }}>Thông tin Thêm</div>

                                <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}

                                >Vai trò *</label>
                                <select
                                    name="VaiTro"
                                    value={formData.VaiTro}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Chọn vai trò</option>
                                    <option value="Bệnh nhân">Bệnh nhân</option>
                                    <option value="Bác sĩ">Bác sĩ</option>
                                </select>



                                {formData.VaiTro === 'Bệnh nhân' && (
                                    <>

                                            <div style={{ width: "100%" }}>
                                                <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}



                                                >Giới tính *</label>
                                                <select
                                                    name="GioiTinh"

                                                    value={formData.GioiTinh} // Chọn giới tính hiện tại
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Chọn giới tính</option>
                                                    <option value="Nam">Nam</option>
                                                    <option value="Nữ">Nữ</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            </div>
                                            <div style={{ width: "100%" }}>
                                                <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}

                                                >Tuổi *</label>
                                                <input
                                                    type="number"
                                                    name="Tuoi"
                                                    placeholder="Nhập tuổi"
                                                    value={formData.Tuoi}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                        <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}

                                        >Địa chỉ *</label>
                                        <input
                                            type="text"
                                            name="DiaChi"
                                            placeholder="Nhập địa chỉ"
                                            value={formData.DiaChi}
                                            onChange={handleInputChange}
                                        />


                                    </>
                                )}


                                {formData.VaiTro === 'Bác sĩ' && (
                                    <>
                                        <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}


                                        >Chuyên môn *</label>
                                        <input
                                            type="text"
                                            name="ChuyenMon"
                                            placeholder="Nhập chuyên môn"
                                            value={formData.ChuyenMon}
                                            onChange={handleInputChange}
                                        />
                                        <label
                                              style={{
                                               color: Cookies.get('Theme') === 'dark' ? '#000' : '#000',
                                               fontWeight: 'normal'
                                               }}

                                        >Phòng khám *</label>
                                        <input
                                            type="text"
                                            name="PhongKham"
                                            placeholder="Nhập khoa nội/khoa ngoại"
                                            value={formData.PhongKham}
                                            onChange={handleInputChange}
                                        />
                                    </>
                                )}

                                <div className="modal-actions">
                                    <button onClick={modalType === 'add' ? addUser : editUser}>
                                        {modalType === 'add' ? 'Thêm' : 'Lưu'}
                                    </button>
                                    <button onClick={() => setShowModal(false)}>Hủy</button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="role-switcher">
                    {/* Input tìm kiếm */}
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                                className={`role-btn ${viewRole === 'Bệnh nhân' ? 'benhnhan' : ''}`}
                                onClick={() => setViewRole('Bệnh nhân')}>
                                Danh sách bệnh nhân
                        </button>
                        <button
                                className={`role-btn ${viewRole === 'Bác sĩ' ? 'bacsi' : ''}`}
                                onClick={() => setViewRole('Bác sĩ')}>
                                Danh sách bác sĩ
                        </button>

                        <button className="add-button-nguoidung" onClick={() => openModal('add')}>Thêm người dùng</button>
                    </div>

                    {/* Bảng người dùng */}

                        <table className="table-quanlynguoidung">
                            <thead>
                                <tr >
                                    <th >#ID</th>
                                    <th>Hình</th>
                                    <th>Tên đầy đủ</th>
                                    <th>Email</th>
                                    <th>SĐT</th>
                                    <th>CCCD</th>
                                    <th>Vai trò</th>
                                    {viewRole === 'Bệnh nhân' && (
                                        <>
                                            <th>Địa chỉ</th>
                                            <th>Tuổi</th>
                                            <th>Giới tính</th>
                                        </>
                                    )}
                                    {viewRole === 'Bác sĩ' && (
                                        <>
                                            <th>Chuyên môn</th>
                                            <th>Phòng khám</th>
                                        </>
                                    )}
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="13">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : (
                                    filteredResults.length > 0 ? (
                                        currentUsers.map(user => (
                                            <tr key={user.ID}>
                                                <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.ID}</td>
                                                <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}><img src={user.Hinh || 'default_image_url'} alt="Hình" className="user-image" /></td>
                                                <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.TenDayDu}</td>
                                                <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.Email}</td>
                                                <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.SDT}</td>
                                                <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.CCCD}</td>
                                                <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.VaiTro}</td>
                                                {viewRole === 'Bệnh nhân' && (
                                                    <>
                                                        <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.DiaChi || ''}</td>
                                                        <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.Tuoi || ''}</td>
                                                        <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.GioiTinh || ''}</td>
                                                    </>
                                                )}
                                                {viewRole === 'Bác sĩ' && (
                                                    <>
                                                        <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.ChuyenMon || ''}</td>
                                                        <td style={{ color: Cookies.get('Theme') === 'dark' ? 'white' : '' }}>{user.PhongKham || ''}</td>
                                                    </>
                                                )}
                                                <td>
                                                    <div className="">
                                                        <button className="action-btn-nguoidung" onClick={() => openModal('edit', user)}>Sửa</button>
                                                        <button className="action-btn-bacsi" onClick={() => deleteUser(user.ID)}>Xóa</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="13">Không có kết quả tìm kiếm</td>
                                        </tr>
                                    )
                                )}
                            </tbody>

                        </table>



                    {/* Phân trang */}
                    <div className={Cookies.get('Theme') === 'dark' ?"pagination-dark":"pagination"}>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}>
                            Trước
                        </button>
                        <span>{currentPage}</span>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage * itemsPerPage >= filteredResults.length}>
                            Sau
                        </button>
                    </div>
                </div>
                </div>
            </main>
        </div>
    );
};

export default QuanLyNguoiDungScreen;