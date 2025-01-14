import React, { useState, useEffect } from 'react';
import "../Styles/Setting.css"; // Import file CSS để thay đổi style
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import Cookies from 'js-cookie';
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

  return (
    <div className="container">
      <Menu1 />

         <main className="main-content">
              <Search1 />

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
