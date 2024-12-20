// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import {
    Clock, Package, Heart, FileText, Flask, History,
    Bell, Search, Settings, LogOut, Grid, Users,
    CreditCard, PieChart, UserCircle, LayoutGrid, MessageSquare,
    Calendar, Ruler, ChevronLeft, ChevronRight
} from 'lucide-react';
import '../Styles/HoSoBenhAn.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
const MedicalRecordList = () => {
    const navigate = useNavigate();

    return (
        <div className="container">

            <Menu1 />

            <main className="main-content">
                <Search1 />
                <div className="content">
                    <h2 className="page-title">Hồ sơ bệnh án</h2>
                    <div className="patient-info">
                        <p>Mã bệnh nhân: BN001</p>
                        <p>Mã bác sĩ BS001</p>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Mã bệnh nhân</th>
                                    <th>Mã lịch hẹn</th>
                                    <th>Bác sĩ</th>
                                    <th>Chẩn đoán</th>
                                    <th>Ngày lập</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>HSBA01</td>
                                    <td className="patient-id">BN001</td>
                                    <td>LH001</td>
                                    <td>BS001</td>
                                    <td></td>
                                    <td>24/12/2021 8h30</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn green">Lịch sử điều trị</button>
                                            <button className="action-btn green">Sửa dữ liệu</button>
                                            <button className="action-btn">Đơn thuốc</button>
                                            <button className="action-btn red">Xóa dữ liệu</button>
                                            <button className="action-btn brown">Xét nghiệm</button>
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

export default MedicalRecordList;