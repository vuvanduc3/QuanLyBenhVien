import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css";
import videoSource from './login_video.mp4';

const Login = () => {
  const [formData, setFormData] = useState({
    Email: '',
    MatKhau: ''
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNavigateToRegister = () => {
    navigate("/Register"); // Điều hướng đến trang đăng ký
  };

  // Xử lý input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { Email, MatKhau } = formData;

    // Kiểm tra email và mật khẩu
    if (Email && MatKhau) {
      try {
        // Gửi yêu cầu xác thực người dùng (có thể thay bằng API thật)
        const response = await fetch('http://localhost:5000/api/thongtindedangnhap');
        const data = await response.json();

        if (data.success) {
          // Kiểm tra thông tin người dùng
          const user = data.data.find(user => user.Email === Email && user.MatKhau === MatKhau);
          if (user) {
            console.log("Đăng nhập thành công!");
            // Lấy ID người dùng và gửi yêu cầu cập nhật trạng thái đăng nhập
            const userId = user.ID; // Giả định rằng cột ID là `ID`
            console.log("Mã đang đăng nhập "+userId);

            await fetch('http://localhost:5000/api/capnhapdangnhap', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ DangDangNhap: user.ID }),
            });

          navigate("/dashboard"); // Chuyển hướng đến trang dashboard
          } else {
            console.log("Thông tin đăng nhập không chính xác.");
            alert("Thông tin đăng nhập không chính xác");
          }
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        alert("Lỗi khi gọi API, vui lòng thử lại sau");
      }
    } else {
      alert("Vui lòng nhập đầy đủ email và mật khẩu!");
    }
  };

  // Lấy dữ liệu người dùng từ API khi component load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/nguoidung');
        if (!response.ok) throw new Error('Không thể lấy dữ liệu người dùng');
        const data = await response.json();
        console.log(data); // In dữ liệu trả về để kiểm tra
        if (data.success) {
          setFormData({ Email: '', MatKhau: '' }); // Đảm bảo rằng form không có dữ liệu ban đầu
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      } finally {
        setLoading(false); // Chỉ set loading false sau khi dữ liệu đã được tải
      }
    };
    fetchUsers();
  }, []); // Chạy lần duy nhất khi component mount

  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading nếu dữ liệu chưa được tải xong
  }

  return (
    <div className="loginContainer">
      {/* Video nền */}
      <video className="backgroundVideo" src={videoSource} autoPlay loop muted></video>

      {/* Nội dung đăng nhập */}
      <div className="loginBox">
        <h2 className="title">Login to Account</h2>
        <p className="subtitle">Vui lòng nhập e-mail và mật khẩu để tiếp tục</p>
        <form onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label htmlFor="email">Email address:</label>
            <input
              type="email"
              id="email"
              name="Email"
              placeholder="example@gmail.com"
              className="input"
              value={formData.Email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="inputGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="MatKhau"
              className="input"
              value={formData.MatKhau}
              onChange={handleInputChange}
              required
            />
            <a href="#" className="forgotPassword">
              Forget Password?
            </a>
          </div>
          <div className="checkboxGroup">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember Password</label>
          </div>
          <button type="submit" className="signInButton">
            Sign In
          </button>
        </form>
        <p className="createAccount" onClick={handleNavigateToRegister}>
          Don’t have an account? <a href="#">Create Account</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
