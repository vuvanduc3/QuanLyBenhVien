import React, { useEffect, useState } from "react";
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/nguoidung');
                if (!response.ok) throw new Error('Không thể lấy dữ liệu người dùng');
                const data = await response.json();
                if (data.success) setUsers(data.data);
                else console.error(data.message);
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
        const { Email, SDT } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,15}$/;

        if (!emailRegex.test(Email)) {
            alert('Email không hợp lệ!');
            return false;
        }
        if (!phoneRegex.test(SDT)) {
            alert('Số điện thoại phải từ 10 đến 15 chữ số!');
            return false;
        }
        return true;
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
            console.log('Phản hồi từ server khi thêm mới:', data);  // Thêm logging để kiểm tra phản hồi
    
            if (data.success) {
                setUsers([...users, data.data]);
                setShowModal(false);
                setFormData({ Hinh: '', TenDayDu: '', Email: '', SDT: '', CCCD: '' });
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
                setFormData({ Hinh: '', TenDayDu: '', Email: '', SDT: '', CCCD: '' });
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
            setFormData({ ...user });
        } else {
            setFormData({ Hinh: '', TenDayDu: '', Email: '', SDT: '', CCCD: '' });
        }
    };

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Quản lý người dùng</h2>
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
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">Đang tải dữ liệu...</td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user.ID}>
                                        <td>{user.ID}</td>
                                        <td><img src={user.Hinh || 'default_image_url'} alt="Hình" className="user-image" /></td>
                                        <td>{user.TenDayDu}</td>
                                        <td>{user.Email}</td>
                                        <td>{user.SDT}</td>
                                        <td>{user.CCCD}</td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn-edit" onClick={() => openModal('edit', user)}><Edit /></button>
                                                <button className="btn-delete" onClick={() => deleteUser(user.ID)}><Trash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7">Không có dữ liệu</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default QuanLyNguoiDungScreen;
