import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from 'lucide-react';
import '../Styles/QuanLyNguoiDung.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const QuanLyNguoiDungScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' hoặc 'edit'
    const [currentUserId, setCurrentUserId] = useState(null);
    const [formData, setFormData] = useState({
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


    const filterUsersByRole = (role) => {
        return users.filter(user => user.VaiTro === role);
    };

    console.log('Users:', users); // In ra dữ liệu trước khi lọc
    const filteredUsers = filterUsersByRole(viewRole);
    console.log('Filtered Users:', filteredUsers); // In ra dữ liệu đã lọc


    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Quản lý người dùng</h2>
                        <div className="role-switcher">
                            <button
                                className={`role-btn ${viewRole === 'Bệnh nhân' ? 'active' : ''}`}
                                onClick={() => setViewRole('Bệnh nhân')}>
                                Danh sách bệnh nhân
                            </button>
                            <button
                                className={`role-btn ${viewRole === 'Bác sĩ' ? 'active' : ''}`}
                                onClick={() => setViewRole('Bác sĩ')}>
                                Danh sách bác sĩ
                            </button>
                        </div>
                        <button className="add-button" onClick={() => openModal('add')}>Thêm người dùng</button>
                    </div>
                    {showModal && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>{modalType === 'add' ? 'Thêm người dùng' : 'Chỉnh sửa người dùng'}</h3>
                                <label>Hình URL:</label>
                                <input
                                    type="text"
                                    name="Hinh"
                                    value={formData.Hinh}
                                    onChange={handleInputChange}
                                />
                                <label>Tên đầy đủ:</label>
                                <input
                                    type="text"
                                    name="TenDayDu"
                                    value={formData.TenDayDu}
                                    onChange={handleInputChange}
                                />
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleInputChange}
                                />
                                <label>SĐT:</label>
                                <input
                                    type="text"
                                    name="SDT"
                                    value={formData.SDT}
                                    onChange={handleInputChange}
                                />
                                <label>CCCD:</label>
                                <input
                                    type="text"
                                    name="CCCD"
                                    value={formData.CCCD}
                                    onChange={handleInputChange}
                                />
                                <label>Vai trò:</label>
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
                                        <label>Địa chỉ:</label>
                                        <input
                                            type="text"
                                            name="DiaChi"
                                            value={formData.DiaChi}
                                            onChange={handleInputChange}
                                        />
                                        <label>Tuổi:</label>
                                        <input
                                            type="number"
                                            name="Tuoi"
                                            value={formData.Tuoi}
                                            onChange={handleInputChange}
                                        />
                                        <label>Giới tính:</label>
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
                                    </>
                                )}


                                {formData.VaiTro === 'Bác sĩ' && (
                                    <>
                                        <label>Chuyên môn:</label>
                                        <input
                                            type="text"
                                            name="ChuyenMon"
                                            value={formData.ChuyenMon}
                                            onChange={handleInputChange}
                                        />
                                        <label>Phòng khám:</label>
                                        <input
                                            type="text"
                                            name="PhongKham"
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
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#ID</th>
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
                                // Lọc người dùng theo vai trò chỉ một lần
                                filterUsersByRole(viewRole).length > 0 ? (
                                    filterUsersByRole(viewRole).map(user => (
                                        <tr key={user.ID}>
                                            <td>{user.ID}</td>
                                            <td><img src={user.Hinh || 'default_image_url'} alt="Hình" className="user-image" /></td>
                                            <td>{user.TenDayDu}</td>
                                            <td>{user.Email}</td>
                                            <td>{user.SDT}</td>
                                            <td>{user.CCCD}</td>
                                            <td>{user.VaiTro}</td>
                                            {viewRole === 'Bệnh nhân' && (
                                                <>
                                                    <td>{user.DiaChi || ''}</td>
                                                    <td>{user.Tuoi || ''}</td>
                                                    <td>{user.GioiTinh || ''}</td>
                                                </>
                                            )}
                                            {viewRole === 'Bác sĩ' && (
                                                <>
                                                    <td>{user.ChuyenMon || ''}</td>
                                                    <td>{user.PhongKham || ''}</td>
                                                </>
                                            )}
                                            <td>
                                                <div className="actions">
                                                    <button className="btn-edit" onClick={() => openModal('edit', user)}><Edit /></button>
                                                    <button className="btn-delete" onClick={() => deleteUser(user.ID)}><Trash2 /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Thông báo khi không có dữ liệu người dùng
                                    <tr>
                                        <td colSpan="13">Không có người dùng trong hệ thống</td>
                                    </tr>
                                )
                            )}
                        </tbody>


                    </table>
                </div>
            </main>
        </div>
    );
};

export default QuanLyNguoiDungScreen;
