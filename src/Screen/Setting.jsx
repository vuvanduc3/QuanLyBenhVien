import React, { useState, useEffect } from 'react';
import "../Styles/Setting.css"; // Import file CSS để thay đổi style
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
const App = () => {
  const [theme, setTheme] = useState('light'); // Trạng thái theme: sáng hoặc tối

  // Dùng useEffect để áp dụng theme khi component load
  useEffect(() => {
    const cookie = Cookies.get('Theme');
    if (cookie === 'dark') {
      Cookies.set('Theme', 'dark', { expires: 1, path: '' });
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      Cookies.set('Theme', 'light', { expires: 1, path: '' });
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  // Hàm chuyển đổi giữa các theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    Cookies.set('Theme', theme, { expires: 1, path: '' });
  };
   const navigate = useNavigate();

  return (
    <div className="container">
      <Menu1 />

         <main className="main-content">
               <div
                className="content-chuyendoi"
                style={{
                    borderRadius: "10px",
                    marginBottom: "10px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width:"100%" }}>

                    <button  style={{
                                marginTop: "-20px",
                                padding: "10px 20px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                height: "50px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                    onClick={() => navigate(-1)}
                    >
                        <i class="fa-solid fa-right-from-bracket fa-rotate-180 fa-lg"></i>
                    </button>

                    <div>
                        <Search1 />
                    </div>
                </div>

             <h1>Chuyển đổi giao diện</h1>
             <button onClick={toggleTheme}>Chuyển sang chế độ {Cookies.get('Theme') === 'light' ? 'tối' : 'sáng'}</button>
             <div className="content-chuyendoi">
                <p>Chào bạn đến với ứng dụng của chúng tôi!</p>
             </div>
         </main>
    </div>
  );
};

export default App;
