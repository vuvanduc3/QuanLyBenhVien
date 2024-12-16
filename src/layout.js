// Layout.js
import React from 'react';
import Menu1 from './components/Menu';

const Layout = ({ children }) => (
  <div className="app-container">
    <Menu1 />
    <div className="main-content">
      {children}
    </div>
  </div>
);

export default Layout;
