// App.js
import React from 'react';
import {
    Search, Bell, LogOut, Settings, Calendar, FileText,
    Users, CreditCard, PieChart, Activity, Database,
    FilePlus, Bookmark, Clock, ChevronLeft, ChevronRight,
    Filter, Edit, Trash2
} from 'lucide-react';
import '../Styles/QuanLyThuoc.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';

import { useNavigate } from "react-router-dom";

const QuanLyThuoc = () => {
    const navigate = useNavigate(); // Hook để điều hướng
    const handleChangeThuoc = () => {
        navigate("/themsuaxoathuoc"); 

    };
    return (
        <div className="container">

            <Menu1 />

            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Quản lý thuốc</h2>
                        <button className="add-button" onClick={handleChangeThuoc}>
                            Thêm thuốc
                        </button>
                    </div>
                    <div className="filters">
                        <div className="filter-group">
                            <Filter />
                            <select>
                                <option>Mã</option>
                            </select>
                            <select>
                                <option>Giá thuốc</option>
                            </select>
                            <select>
                                <option>Tên thuốc</option>
                            </select>
                            <select>
                                <option>Số lượng</option>
                            </select>
                        </div>
                        <div className="actions">
                            <button className="btn-reset">Reset Filter</button>
                        </div>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#ID</th>
                                <th>Tên thuốc</th>
                                <th>SĐT liên hệ</th>
                                <th>Mô tả</th>
                                <th>Số lượng</th>
                                <th>Giá thuốc</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>LH001</td>
                                <td>Thuốc A</td>
                                <td>BS001</td>
                                <td>8h30 AM</td>
                                <td><span className="quantity">100</span></td>
                                <td>100,000 VND</td>
                                <td>
                                    <div className="actions">
                                        <button className="btn-edit"><Edit /></button>
                                        <button className="btn-delete"><Trash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="pagination">
                        <span>Trang 1 của 84</span>
                        <div className="pagination-buttons">
                            <button><ChevronLeft /></button>
                            <button><ChevronRight /></button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default QuanLyThuoc;