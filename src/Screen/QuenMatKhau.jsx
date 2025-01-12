import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import "../Styles/Login.css";
import videoSource from './login_video3.mp4';

const Login = () => {
  const [formData, setFormData] = useState({
    Email: '',
    MatKhau: ''
  });

  const [MaOTP, setMaOTP] = useState('');
  const [MaOTPSendEmail, setMaOTPSendEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Vui lòng nhập e-mail để đặt lại mật khẩu");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);  // State để quản lý ẩn/hiện mật khẩu

  const navigate = useNavigate();

  const handleNavigateToRegister = () => {
    navigate("/Register");
  };

  // Xử lý input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Xử lý gửi OTP qua email
  const sendOTPToEmail = async (email, otp) => {
    try {
      const templateParams = {
        email: email,
        otp: otp
      };

      const response = await emailjs.send(
        'service_0bg8uts', // Thay bằng service ID của bạn
        'template_kad9owa', // Thay bằng template ID của bạn
        templateParams,
        'ZlYajkYUVCOi2u_wL' // Thay bằng user ID của bạn
      );

      if (response.status === 200) {
        setMessage("Mã OTP đã được gửi đến email của bạn.");
        setIsEmailSent(true);
      } else {
        alert("Lỗi khi gửi email. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
      alert("Lỗi khi gửi email. Vui lòng thử lại sau.");
    }
  };

  // Xử lý kiểm tra email và gửi OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const { Email } = formData;

    if (Email) {
      try {
        const response = await fetch('http://localhost:5000/api/thongtindedangnhap');
        const data = await response.json();

        if (data.success) {
          const user = data.data.find(user => user.Email === Email);
          if (user) {
            setIsEmailChecked(true);
            const otp = Math.floor(100000 + Math.random() * 900000);
            setMaOTPSendEmail(otp);
            sendOTPToEmail(Email, otp);
            setIsOTPSent(true); // Sau khi gửi OTP thành công
          } else {
            alert("E-mail không tồn tại");
          }
        }
      } catch (error) {
        alert("Lỗi khi gọi API, vui lòng thử lại sau");
      }
    } else {
      alert("Vui lòng nhập email");
    }
  };

  // Xử lý nhập OTP
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (MaOTP == MaOTPSendEmail) {
      setIsOTPVerified(true);
      setMessage("Mã OTP đúng. Vui lòng nhập mật khẩu mới.");
    } else {
      alert("Mã OTP không chính xác.");
    }
  };

  // Xử lý nhập mật khẩu mới
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword) {
      try {
        const response = await fetch('http://localhost:5000/api/capnhatmatkhau', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.Email, newPassword })
        });
        const data = await response.json();
        if (data.success) {
          alert("Mật khẩu đã được thay đổi thành công!");
          navigate("/login");
        } else {
          alert("Lỗi khi thay đổi mật khẩu");
        }
      } catch (error) {
        alert("Lỗi khi thay đổi mật khẩu");
      }
    } else {
      alert("Vui lòng nhập mật khẩu mới");
    }
  };

  // Hàm toggle ẩn/hiện mật khẩu
  const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="loginContainer">
      <video className="backgroundVideo" src={videoSource} autoPlay loop muted></video>

      <div className="loginBox">
        <h2 className="title">Đặt lại mật khẩu</h2>
        <p className="subtitle">{message}</p>

        {!isEmailChecked && (
          <form onSubmit={handleEmailSubmit}>
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
            <button type="submit" className="signInButton">
              Send OTP
            </button>
          </form>
        )}

{/*         {isEmailSent && !isOTPVerified && ( */}
{/*           <div className="emailSentMessage"> */}
{/*             <p style={{ color: 'green', fontWeight: 'bold' }}>Mã OTP đã được gửi đến email của bạn!</p> */}
{/*           </div> */}
{/*         )} */}

        {isOTPSent && !isOTPVerified && (
          <form onSubmit={handleOTPSubmit}>
            <div className="inputGroup">
              <label htmlFor="otp">Mã OTP:</label>
              <input
                type="text"
                id="otp"
                name="MatKhau"
                className="input"
                placeholder="Nhập mã OTP"
                value={MaOTP}
                onChange={(e) => setMaOTP(e.target.value)}
              />
            </div>
            <button type="submit" className="signInButton">
              Xác nhận OTP
            </button>
          </form>
        )}

        {isOTPVerified && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="inputGroup">
                 <label htmlFor="newPassword">Mật khẩu mới</label>
                 <div className="inputGroup2">
                       <input
                       type={isPasswordVisible ? "text" : "password"}
                       className="input"
                       placeholder="Nhập mật khẩu"
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                       required
                       />

                       <div className="inputGroup_togglePasswordBtn">
                         <button type="button" onClick={togglePasswordVisibility} className="togglePasswordBtn">
                           <i className={isPasswordVisible ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                         </button>
                       </div>
                 </div>

            </div>
            <button type="submit" className="signInButton">
              Đặt lại mật khẩu
            </button>
          </form>
        )}

        <p className="createAccount">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
