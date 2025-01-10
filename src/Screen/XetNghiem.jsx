import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/XetNghiem.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const XetNghiem = () => {
    const [xetNghiems, setXetNghiems] = useState([]);
    const [filteredXetNghiems, setFilteredXetNghiems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterByInvoice, setFilterByInvoice] = useState('all'); // Lọc hóa đơn
    const [MaBenhNhans, setMaBenhNhans] = useState(''); // Lọc theo mã bệnh nhân

    const navigate = useNavigate();
    const location = useLocation();
    const { action, item } = location.state || {}; // Lấy action và item từ params

    // Thiết lập mã bệnh nhân nếu có
    useEffect(() => {
        if (action === 'xem' && item) {
            setMaBenhNhans(item.MaBenhNhan);
        }
    }, [action, item]);

    // Hàm gọi API để lấy danh sách xét nghiệm
    const fetchXetNghiems = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/xetnghiem');
            const data = await response.json();
            if (data.success) {
                setXetNghiems(data.data); // Lưu dữ liệu vào state
                setFilteredXetNghiems(data.data);
            } else {
                console.error('Không thể lấy dữ liệu xét nghiệm');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
        }
    };

    // Gọi API khi component được render
    useEffect(() => {
        fetchXetNghiems();
    }, []);

    // Hàm xử lý tìm kiếm và lọc
    useEffect(() => {
        let data = [...xetNghiems];

        // Lọc theo mã bệnh nhân
        if (MaBenhNhans) {
            data = data.filter((item) => item.MaBenhNhan === MaBenhNhans);
        }

        // Tìm kiếm
        if (searchQuery) {
            data = data.filter((item) =>
                Object.values(item).some((val) =>
                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Lọc hóa đơn
        if (filterByInvoice !== 'all') {
            data = data.filter(
                (item) =>
                    (filterByInvoice === 'daNhap' && item.DaNhapHoaDon === 1) ||
                    (filterByInvoice === 'chuaNhap' && item.DaNhapHoaDon === 0)
            );
        }

        // Sắp xếp
        if (sortField) {
            data.sort((a, b) => {
                const aValue = a[sortField];
                const bValue = b[sortField];

                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredXetNghiems(data);
        setCurrentPage(1); // Reset về trang đầu
    }, [searchQuery, sortField, sortOrder, filterByInvoice, xetNghiems, MaBenhNhans]);

    // Hàm sửa dữ liệu
    const handleEdit = (item) => {
        navigate('/crud-xet-nghiem', { state: { action: 'edit', item } });
    };

    // Hàm thêm dữ liệu
    const handleAdd = () => {
        navigate('/crud-xet-nghiem', { state: { action: 'add' } });
    };

    // Hàm xóa dữ liệu
    const handleDelete = async (maXetNghiem) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa xét nghiệm này?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/xetnghiem/${maXetNghiem}`, {
                    method: 'DELETE',
                });

                const data = await response.json();
                if (data.success) {
                    setXetNghiems(xetNghiems.filter((xetNghiem) => xetNghiem.MaXetNghiem !== maXetNghiem)); // Xóa xét nghiệm khỏi danh sách
                    alert('Xóa xét nghiệm thành công');
                } else {
                    alert('Xóa xét nghiệm thất bại');
                }
            } catch (error) {
                console.error('Lỗi khi xóa xét nghiệm:', error);
                alert('Lỗi khi xóa xét nghiệm');
            }
        }
    };

    const resetFilters = () => {
        setSearchQuery('');         // Reset ô tìm kiếm
        setFilterByInvoice('all');  // Reset bộ lọc hóa đơn
        setSortField('');           // Reset sắp xếp
        setSortOrder('asc');        // Reset thứ tự sắp xếp
        setCurrentPage(1);          // Quay lại trang đầu tiên
    };

    // Xử lý phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredXetNghiems.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredXetNghiems.length / itemsPerPage);

    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />
                <div className="content">
                    <h2 className="page-title">
                        Xét Nghiệm {MaBenhNhans ? `(Mã bệnh nhân: ${MaBenhNhans})` : ''}
                    </h2>
                    <div className="filters">
                        <button className="add-button" onClick={handleAdd}>
                            Thêm xét nghiệm
                        </button>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <select onChange={(e) => setFilterByInvoice(e.target.value)} value={filterByInvoice}>
                            <option value="all">Tất cả</option>
                            <option value="daNhap">Đã nhập hóa đơn</option>
                            <option value="chuaNhap">Chưa nhập hóa đơn</option>
                        </select>
                        <button onClick={resetFilters} className="reset-button">Reset bộ lọc</button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th
                                        className={sortField === 'MaXetNghiem' ? 'sorted' : ''}
                                        onClick={() => setSortField('MaXetNghiem')}
                                    >
                                        #ID
                                    </th>
                                    <th
                                        className={sortField === 'MaBenhNhan' ? 'sorted' : ''}
                                        onClick={() => setSortField('MaBenhNhan')}
                                    >
                                        Mã bệnh nhân
                                    </th>
                                    <th
                                        className={sortField === 'MaHoSo' ? 'sorted' : ''}
                                        onClick={() => setSortField('MaHoSo')}
                                    >
                                        Mã hồ sơ bệnh án
                                    </th>
                                    <th
                                        className={sortField === 'TenXetNghiem' ? 'sorted' : ''}
                                        onClick={() => setSortField('TenXetNghiem')}
                                    >
                                        Tên thử nghiệm
                                    </th>
                                    <th
                                        className={sortField === 'KetQua' ? 'sorted' : ''}
                                        onClick={() => setSortField('KetQua')}
                                    >
                                        Kết quả
                                    </th>
                                    <th
                                        className={sortField === 'NgayXetNghiem' ? 'sorted' : ''}
                                        onClick={() => setSortField('NgayXetNghiem')}
                                    >
                                        Ngày xét nghiệm
                                    </th>
                                    <th
                                        className={sortField === 'DaNhapHoaDon' ? 'sorted' : ''}
                                        onClick={() => setSortField('DaNhapHoaDon')}
                                    >
                                        Nhập hóa đơn
                                    </th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((xetNghiem) => (
                                    <tr key={xetNghiem.MaXetNghiem}>
                                        <td>{xetNghiem.MaXetNghiem}</td>
                                        <td>{xetNghiem.MaBenhNhan}</td>
                                        <td>{xetNghiem.MaHoSo}</td>
                                        <td>{xetNghiem.TenXetNghiem}</td>
                                        <td>{xetNghiem.KetQua}</td>
                                        <td>{new Date(xetNghiem.NgayXetNghiem).toLocaleDateString('vi-VN')}</td>
                                        <td>{xetNghiem.DaNhapHoaDon ? 'Có' : 'Không'}</td>
                                        <td>
                                            <div className="action-buttons-row">
                                                <button className="edit-button" onClick={() => handleEdit(xetNghiem)}>Sửa</button>
                                                <button className="delete-button" onClick={() => handleDelete(xetNghiem.MaXetNghiem)}>Xóa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination">
                        <span>
                            Trang {currentPage} / {totalPages}
                        </span>
                        <div className="pagination-buttons-row">
                            <button className="pagination-buttons" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
                                <ChevronLeft size={20} />
                            </button>
                            <button className="pagination-buttons" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default XetNghiem;
