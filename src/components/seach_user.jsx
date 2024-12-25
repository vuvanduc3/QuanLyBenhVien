import React from 'react';
import { 
    Clock, PackageSearch, Heart, ClipboardList, Shield, Users,
    Wallet, FileText, LogOut, Menu, Search 
  } from 'lucide-react';
export default function Search1() {
    return (
<div className="top-header">
    <div className="search-container">
       
    </div>
    <div className="user-profile">
        <div className="notification">
            <FileText size={20} />
            <span className="notification-badge">0</span>
        </div>
        <img src="/faviton.jpg" alt="User" className="avatar" />
        <div className="user-info">
            <span className="user-name">Moni Roy</span>
            <span className="user-role">Admin</span>
        </div>
    </div>
</div>
  );
}
