import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import '../Styles/QuanLyThuoc.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';

const QuanLyThuoc = () => {
    const [thuocs, setThuocs] = useState([]); // Lưu danh sách thuốc
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
    const [error, setError] = useState(null); // Lưu lỗi nếu có
    const navigate = useNavigate();

   

    // Fetch dữ liệu thuốc từ API
    useEffect(() => {
        fetch('http://localhost:5000/api/thuoc')
            .then((response) => response.json())
            .then((data) => {
                if (data.success && Array.isArray(data.data)) {
                    setThuocs(data.data); // Chỉ lưu mảng `data`
                } else {
                    setError('Dữ liệu không hợp lệ');
                    console.error('Invalid data format:', data);
                }
            })
            .catch((err) => {
                setError('Lỗi khi tải dữ liệu từ API');
                console.error('Error fetching data:', err);
            })
            .finally(() => {
                setLoading(false); // Kết thúc trạng thái tải
            });
    }, []);

    // Xử lý chuyển hướng khi thêm thuốc
    const handleChangeThuoc = () => {
        navigate('/themsuaxoathuoc');
    };

    // Hiển thị khi đang tải dữ liệu
    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    // Hiển thị nếu có lỗi
    if (error) {
        return <div className="error">{error}</div>;
    }

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
                            {Array.isArray(thuocs) && thuocs.length > 0 ? (
                                thuocs.map((thuoc) => (
                                    <tr key={thuoc.ID}>
                                        <td>{thuoc.ID}</td>
                                        <td>{thuoc.TenThuoc}</td>
                                        <td>{thuoc.SDT}</td>
                                        <td>{thuoc.MoTa}</td>
                                        <td><span className="quantity">{thuoc.SoLuong}</span></td>
                                        <td>{thuoc.GiaThuoc.toLocaleString()} VND</td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn-edit"><Edit /></button>
                                                <button className="btn-delete"><Trash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-data">Không có dữ liệu</td>
                                </tr>
                            )}
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
