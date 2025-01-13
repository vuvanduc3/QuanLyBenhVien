import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Register.module.css"; // CSS Module
import videoSource from './login_video2.mp4';

const Register = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cccd, setCccd] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
      e.preventDefault();
      if (email && fullName && phone && cccd && age && address && password) {
          try {
              const response = await fetch("http://localhost:5000/api/themtaikhoandangnhap", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                      TenDayDu: fullName,
                      Email: email,
                      SDT: phone,
                      CCCD: cccd,
                      DiaChi: address,
                      Tuoi: parseInt(age),
                      MatKhau: password,
                      VaiTro: "Bệnh nhân", // Gửi vai trò là bệnh nhân
                  }),
              });

              const data = await response.json();
              if (data.success) {
                  alert("Tạo tài khoản thành công!");
                  navigate("/login");
              } else {
                  alert(data.message);
              }
          } catch (error) {
              console.error("Lỗi khi gửi dữ liệu:", error);
              alert("Có lỗi xảy ra khi gửi dữ liệu, vui lòng thử lại.");
          }
      } else {
          alert("Vui lòng điền đầy đủ thông tin!");
      }
  };

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);  // State để quản lý ẩn/hiện mật khẩu
  const togglePasswordVisibility = () => {
          setIsPasswordVisible(!isPasswordVisible);
  };


  return (
    <div className="loginContainer">
        <video
            className="backgroundVideo"
            src={videoSource}
            autoPlay
            loop
            muted
        ></video>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Vui lòng nhập thông tin để tạo tài khoản</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email address *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="example@gmail.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              required
              name="fullName"
              placeholder="Nguyen Van A"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">Phone *</label>
            <input
              type="text"
              id="phone"
              name="phone"
              required
              placeholder="0123456789"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="cccd">CCCD/CMND *</label>
            <input
              type="text"
              id="cccd"
              name="cccd"
              required
              placeholder="123456789"
              className={styles.input}
              value={cccd}
              onChange={(e) => setCccd(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              required
              placeholder="18"
              className={styles.input}
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              required
              placeholder="Hanoi, Vietnam"
              className={styles.input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>

            <label htmlFor="password">Password *</label>
            <div className="inputGroup2">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  placeholder="Nhập mật khẩu"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                    <div className="inputGroup_togglePasswordBtn">
                      <button type="button" onClick={togglePasswordVisibility} className="togglePasswordBtn">
                        <i className={isPasswordVisible ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                      </button>
                    </div>
            </div>
          </div>

          <button type="submit" className={styles.signInButton}>Register</button>
        </form>
        <p className={styles.createAccount}>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
