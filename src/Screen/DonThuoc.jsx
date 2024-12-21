import React, { useState } from 'react';
import {
    Search, Bell, ChevronLeft, ChevronRight,
    Calendar, ListPlus, FileText, Prescription,
    Flask, ClipboardList, Receipt, Users, CreditCard,
    BarChart2, Settings, LogOut, PenSquare, Trash2
} from 'lucide-react';
import '../Styles/DonThuoc.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';


const DonThuoc = () => {
    const [activeTab] = useState('prescriptions');
    const [page, setPage] = useState(1);
    const totalPages = 84;

    const [prescriptions] = useState([
        {
            id: 'HSBA01',
            patientId: 'BN001',
            recordId: 'HSBA001',
            doctorId: 'BS001',
            medicineId: 'T001',
            instructions: 'Ngày 3 bữa, mỗi lần 3 viên',
            quantity: 1
        },
        {
            id: 'HSBA01',
            patientId: 'BN001',
            recordId: 'HSBA001',
            doctorId: 'BS001',
            medicineId: 'T002',
            instructions: 'Ngày 3 bữa, mỗi lần 3 viên',
            quantity: 2
        }
    ]);

    return (

        <div className="container">

            <Menu1 />

            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Đơn thuốc</h2>
                        <button className="add-button">
                            Thêm đơn thuốc
                        </button>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="prescription-table">
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Mã bệnh nhân</th>
                                    <th>Mã hồ sơ bệnh án</th>
                                    <th>Mã bác sĩ</th>
                                    <th>Mã thuốc</th>
                                    <th>Hướng dẫn sử dụng</th>
                                    <th>Số lượng</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.map((prescription, index) => (
                                    <tr key={index}>
                                        <td>{prescription.id}</td>
                                        <td className="patient-id">{prescription.patientId}</td>
                                        <td>{prescription.recordId}</td>
                                        <td>{prescription.doctorId}</td>
                                        <td>{prescription.medicineId}</td>
                                        <td>{prescription.instructions}</td>
                                        <td>x{prescription.quantity}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="edit-button">
                                                    <PenSquare size={16} />
                                                </button>
                                                <button className="delete-button">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <span className="page-info">
                            Trang {page} của {totalPages}
                        </span>
                        <div className="pagination-buttons">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="pagination-button"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="pagination-button"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DonThuoc;