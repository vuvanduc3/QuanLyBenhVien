import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight
} from 'lucide-react';
import '../Styles/TraCuuVaNhapHoaDonCT.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const DonThuoc = () => {
    const navigate = useNavigate();
    const [activeTab] = useState('prescriptions');
    const [page, setPage] = useState(1);
    const totalPages = 84;
    const [activeCategory, setActiveCategory] = useState('prescriptions'); // Trạng thái lưu danh mục đang chọn
    const [activeButton, setActiveButton] = useState('prescriptions'); // Trạng thái lưu button đang chọn

    // Dữ liệu cho từng danh mục
    const data = {
        history: [
            { id: 'HSBA01', patientId: 'BN001', recordId: 'HSBA001', doctorId: 'BS001', description: 'Điều trị đau bụng', treatmentDate: '2024-12-30' }
        ],
        prescriptions: [
            { id: 'HSBA01', patientId: 'BN001', recordId: 'HSBA001', doctorId: 'BS001', medicineId: 'T001', instructions: 'Ngày 3 bữa, mỗi lần 3 viên', quantity: 1 },
            { id: 'HSBA01', patientId: 'BN001', recordId: 'HSBA001', doctorId: 'BS001', medicineId: 'T002', instructions: 'Ngày 3 bữa, mỗi lần 3 viên', quantity: 1 }
        ],
        tests: [
            { id: 'HSBA01', patientId: 'BN001', recordId: 'HSBA001', doctorId: 'BS001', testName: 'Xét nghiệm máu', result: 'Bình thường', testDate: '2024-12-30' }
        ]
    };

    const chuyenTrangCRUDTraCuuVaNhapHoaDon = (item) => {
        navigate('/crud-tra-cuu-va-nhap-hoa-don-chi-tiet');
    };

    const columns = {
        history: ['ID', 'Mã bệnh nhân', 'Mã hồ sơ bệnh án', 'Mã bác sĩ', 'Mô tả', 'Ngày điều trị', 'Action'],
        prescriptions: ['ID', 'Mã bệnh nhân', 'Mã hồ sơ bệnh án', 'Mã bác sĩ', 'Mã thuốc', 'Hướng dẫn sử dụng', 'Số lượng', 'Action'],
        tests: ['ID', 'Mã bệnh nhân', 'Mã hồ sơ bệnh án', 'Mã bác sĩ', 'Tên thử nghiệm/xét nghiệm', 'Kết quả', 'Ngày xét nghiệm', 'Action']
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setPage(1); // Reset page khi chuyển danh mục
        setActiveButton(category); // Cập nhật button đang được chọn
    };

    return (
        <div className="container">
            <Menu1 />

            <main className="main-content">
                <Search1 />
                <input
                     type="text"
                     placeholder="Tìm kiếm theo id, mã bác sĩ hoặc mã bệnh nhân..."
                     className="search-input"
                 />

                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Tra cứu và nhập hóa đơn chi tiết</h2>
                    </div>

                    <div className="div-buttons">
                        <button
                            className={`danhmuc-button ${activeButton === 'history' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('history')}
                        >
                            Lịch sử điều trị
                        </button>
                        <button
                            className={`danhmuc-button ${activeButton === 'prescriptions' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('prescriptions')}
                        >
                            Đơn thuốc
                        </button>
                        <button
                            className={`danhmuc-button ${activeButton === 'tests' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('tests')}
                        >
                            Xét nghiệm
                        </button>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="prescription-table">
                            <thead>
                                <tr>
                                    {columns[activeCategory].map((column, index) => (
                                        <th key={index}>{column}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data[activeCategory].map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.id}</td>
                                        <td>{item.patientId}</td>
                                        <td>{item.recordId}</td>
                                        <td>{item.doctorId}</td>
                                        {activeCategory === 'prescriptions' && (
                                            <>
                                                <td>{item.medicineId}</td>
                                                <td>{item.instructions}</td>
                                                <td>x{item.quantity}</td>
                                            </>
                                        )}
                                        {activeCategory === 'history' && (
                                            <>
                                                <td>{item.description}</td>
                                                <td>{item.treatmentDate}</td>
                                            </>
                                        )}
                                        {activeCategory === 'tests' && (
                                            <>
                                                <td>{item.testName}</td>
                                                <td>{item.result}</td>
                                                <td>{item.testDate}</td>
                                            </>
                                        )}
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn green" onClick={chuyenTrangCRUDTraCuuVaNhapHoaDon}>Nhập hóa đơn</button>
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
