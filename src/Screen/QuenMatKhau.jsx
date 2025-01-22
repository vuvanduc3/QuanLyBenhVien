import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import crypto from "crypto-js";
import "../Styles/Login.css";
import videoSource from './login_video2.mp4';

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
  const [message, setMessage] = useState("Vui lòng nhập e-mail để đặt lại mật khẩu");
  const [timer, setTimer] = useState(-1); // Thời gian đếm ngược

  const navigate = useNavigate();

  // Bắt đầu đếm ngược 60 giây
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      setMessage("Mã OTP đã được gửi đến email của bạn.");
      return () => clearInterval(interval);
    }
    else if(timer == 0){
        setMessage("Mã OTP đã hết hạn vui lòng gửi lại!");
    }
  }, [timer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const encryptOTP = (otp) => {
    return crypto.AES.encrypt(otp, "secret_key").toString(); // Mã hóa OTP
  };

  const sendOTPToEmail = async (email, otp) => {
    try {
      const templateParams = {
        email: email,
        otp: otp
      };

      const response = await emailjs.send(
        'service_0bg8uts',
        'template_kad9owa',
        templateParams,
        'ZlYajkYUVCOi2u_wL'
      );

      if (response.status === 200) {
        setMessage("Mã OTP đã được gửi đến email của bạn.");
      } else {
        alert("Lỗi khi gửi email. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
      alert("Lỗi khi gửi email. Vui lòng thử lại sau.");
    }
  };

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
            setIsOTPSent(true);
            setTimer(60); // Bắt đầu đếm ngược 60 giây
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

  const handleResendOTP = () => {

    const otp = Math.floor(100000 + Math.random() * 900000);
    setMaOTPSendEmail(otp);
    sendOTPToEmail(formData.Email, otp);
    setTimer(60); // Reset thời gian đếm ngược
  };

  const handleOTPSubmit = (e) => {
    e.preventDefault();
    if (MaOTP === MaOTPSendEmail.toString()) {
      const encryptedOTP = encryptOTP(MaOTP);
      console.log("Mã OTP sau khi mã hóa:", encryptedOTP);
      setMaOTPSendEmail(encryptedOTP);
      setIsOTPVerified(true);
      setTimer(-1);
      setMessage("Mã OTP đúng. Vui lòng nhập mật khẩu mới.");
    } else {
      alert("Mã OTP không chính xác.");
    }
  };

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
            <button type="submit" className="signInButton" disabled={timer > 0}>
              {timer > 0 ? `Gửi lại OTP sau ${timer}s` : "Gửi OTP"}
            </button>
          </form>
        )}

        {isOTPSent && !isOTPVerified && (
          <form onSubmit={handleOTPSubmit}>
            <div className="inputGroup">
              <label htmlFor="otp">Mã OTP: </label>
              <input
                type="text"
                id="otp"
                className="input"
                placeholder="Nhập mã OTP"
                value={MaOTP}
                onChange={(e) => setMaOTP(e.target.value)}
              />
            </div>
             {timer != 0 && (
                <button type="submit" className="signInButton">
                  Xác nhận OTP ({timer})
                </button>
             )}

            {timer === 0 && (
              <button type="button" onClick={handleResendOTP} className="signInButton">
                Gửi lại OTP
              </button>
            )}
          </form>
        )}

        {isOTPVerified && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="inputGroup">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                type="password"
                id="newPassword"
                className="input"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="signInButton">
              Đặt lại mật khẩu
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
