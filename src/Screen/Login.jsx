import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css";
import videoSource from './login_video.mp4';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleNavigateToRegister = () => {
    navigate("/Register"); // Điều hướng đến trang đăng ký
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    // Kiểm tra email và password (có thể thêm logic thực tế để kiểm tra với server)
    if (email && password) {
      console.log("Đăng nhập thành công!");
      navigate("/dashboad"); // Chuyển hướng đến trang dashboard sau khi đăng nhập
    } else {
      console.log("Vui lòng nhập đầy đủ email và mật khẩu!");
    }
  };

  return (
    <div className="loginContainer">
      {/* Video nền */}
      <video
        className="backgroundVideo"
        src={videoSource}
        autoPlay
        loop
        muted
      ></video>

      {/* Nội dung đăng nhập */}
      <div className="loginBox">
        <h2 className="title">Login to Account</h2>
        <p className="subtitle">
          Vui lòng nhập e-mail và mật khẩu để tiếp tục
        </p>
        <form onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label htmlFor="email">Email address:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@gmail.com"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="inputGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        <p className="createAccount"  onClick={handleNavigateToRegister}>
          Don’t have an account? <a href="#">Create Account</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
