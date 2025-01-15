import React, { useState, useEffect } from 'react';
import "../Styles/light-theme.css";
import "../Styles/dark-theme.css";
import "../Styles/blue-theme.css";
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = Cookies.get('Theme') || 'light';
    setTheme(savedTheme);
    document.body.className = `${savedTheme}-theme`;
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    Cookies.set('Theme', newTheme, { expires: 1, path: '' });
    document.body.className = `${newTheme}-theme`;
  };

  return (
    <div className="container">
      <Menu1 />
      <main className="main-content">
        <div className="content-chuyendoi" style={{ borderRadius: "10px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <button style={{ marginTop: "-20px", padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", height: "50px", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={() => navigate(-1)}>
            <i className="fa-solid fa-right-from-bracket fa-rotate-180 fa-lg"></i>
          </button>
          <div>
            <Search1 />
          </div>
        </div>
        <h1>Chuyển đổi giao diện</h1>
        <div>
          <button onClick={() => changeTheme('light')}>Chủ đề Sáng</button>
          <button onClick={() => changeTheme('dark')}>Chủ đề Tối</button>
          <button onClick={() => changeTheme('blue')}>Chủ đề Xanh</button>
        </div>
        <div className="content-chuyendoi">
          <p>Chào bạn đến với ứng dụng của chúng tôi!</p>
        </div>
      </main>
    </div>
  );
};

export default App;
