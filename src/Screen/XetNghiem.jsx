// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import {
    Clock, Package, Heart, FileText, Flask, History,
    Bell, Search, Settings, LogOut, Grid, Users,
    CreditCard, PieChart, UserCircle, LayoutGrid, MessageSquare,
    Calendar, Ruler, ChevronLeft, ChevronRight
} from 'lucide-react';
import '../Styles/XetNghiem.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const XetNghiem = () => {
    const navigate = useNavigate();

   const handleChangeXetNghiem = () => {
            navigate('/crud-xet-nghiem');
   };



    return (
        <div className="container">

            <Menu1 />

            <main className="main-content">
                <Search1 />
                <div className="content">
                    <h2 className="page-title">Quản Lý Xét Nghiệm</h2>
                    <div className="patient-info">
{/*                         <p>Mã bệnh nhân: BN001</p> */}
{/*                         <p>Mã bác sĩ BS001</p> */}

                         <div className="button-info">
                             <button className="add-button" onClick={handleChangeXetNghiem}>
                                 Thêm Xét Nghiệm
                             </button>
                         </div>
                    </div>


                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Mã bệnh nhân</th>
                                    <th>Mã hồ sơ bệnh án</th>
                                    <th>Mã bác sĩ/ thuốc</th>
                                    <th>Tên thử nghiệm</th>
                                    <th>Kết quả</th>
                                    <th>Ngày xét nghiệm</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>HSBA01</td>
                                    <td className="patient-id">BN001</td>
                                    <td>LH001</td>
                                    <td>Thuốc giảm đau</td>
                                    <td>10</td>
                                    <td>10</td>
                                    <td>100.000 vnd</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn green" onClick={handleChangeXetNghiem}>Sửa dữ liệu</button>
                                            <button className="action-btn red">Xóa dữ liệu</button>

                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <span>Trang 1 của 84</span>
                        <div className="pagination-controls">
                            <button><ChevronLeft size={20} /></button>
                            <button><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default XetNghiem;