import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Clock, PackageSearch, Heart, ClipboardList, Shield, Users,
    Wallet, FileText, LogOut, Menu, Search 
  } from 'lucide-react';


export default function Search1() {
    const [loading, setLoading] = useState(true);
    const [DangDangNhap, setDangDangNhap] = useState('');
    const [Hinh, setHinh] = useState('');
    const [HoVaTen, setHoVaTen] = useState('');
    const [VaiTro, setVaiTro] = useState('');
    const navigate = useNavigate();

    const handleNavigateToCaiDatThongTinCaNhan = () => {
        navigate("/quan-ly-tai-khoan"); // Điều hướng đến trang đăng ký
    };

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
                        setHinh(matchedUser.Hinh);
                        setHoVaTen(matchedUser.TenDayDu);
                        setVaiTro(matchedUser.VaiTro);
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

    return (
    <div className="top-header">
        <div className="search-container">

        </div>
        <div className="user-profile">
            <div className="notification">
                <FileText size={20} />
                <span className="notification-badge">0</span>
            </div>
            <img src={ Hinh || 'default_image_url'} alt="Hình" className="user-image" onClick={handleNavigateToCaiDatThongTinCaNhan} />

            <div className="user-info" onClick={handleNavigateToCaiDatThongTinCaNhan}>
                <span className="user-name">{HoVaTen}</span>
                <span className="user-role" >{VaiTro}</span>
            </div>
        </div>
    </div>
  );
}
