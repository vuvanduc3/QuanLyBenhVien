import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/QuanLyHoaDonChiTiet.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import { Printer, Send } from 'lucide-react';

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "@fontsource/roboto"; // Import font Roboto

import emailjs from 'emailjs-com';

const HoaDonChiTiet = () => {
    const { state } = useLocation();
    const { item } = state || {}; // Lấy item từ state
    const navigate = useNavigate();

    const [hoaDonChiTiet, setHoaDonChiTiet] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 10;
    const [emailInput, setEmailInput] = useState(''); // Thêm state để lưu email người dùng nhập

    const [AnEmailInput, setAnEmailInput] = useState(''); // Thêm state để lưu email người dùng nhập

    // Lấy dữ liệu chi tiết hóa đơn
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/hoadonchitiet');
                const data = await response.json();
                if (data.success) {
                    setHoaDonChiTiet(data.data);
                } else {
                    throw new Error(data.message || 'Không thể tải dữ liệu');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

     const formatNgaySinh = (ngaySinh) => {
       if (!ngaySinh) return "Không xác định";
       const date = new Date(ngaySinh);

       const day = date.getDate();
       const month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
       const year = date.getFullYear();

       return `Ngay ${day} thang ${month} nam ${year}`;
     };
    const formatNgaySinh2 = (ngaySinh) => {
        if (!ngaySinh) return "Không xác định";
        const date = new Date(ngaySinh);

        const day = date.getDate();
        const month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
        const year = date.getFullYear();

        return `Ngày ${day} tháng ${month} năm ${year}`;
      };

    // Hàm chuẩn hóa văn bản, loại bỏ dấu và chuyển chữ có dấu thành không dấu
    const removeDiacritics = (text) => {
        if (typeof text === 'string') {
            // Chuyển chữ có dấu thành không dấu
            return text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Loại bỏ dấu
        }
        return text; // Trả về nguyên vẹn nếu không phải chuỗi
    };

    // Lọc danh sách chi tiết hóa đơn theo MaHoaDon
    const displayedData = item?.MaHoaDon
        ? hoaDonChiTiet.filter(hd => hd.MaHoaDon === item.MaHoaDon)
        : [];

    const totalPages = Math.ceil(displayedData.length / itemsPerPage);
    const paginatedData = displayedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Tính tổng tiền cho các mục đang hiển thị trên trang
    const calculateTotalAmount = () => {
        return paginatedData.reduce((total, item) => {
            const totalPrice = item.SoLuong * item.DonGia;
            return total + totalPrice;
        }, 0);
    };

    const totalAmount = calculateTotalAmount();

    // Hàm chuẩn hóa văn bản, loại bỏ tất cả dấu và ký tự đặc biệt
    const normalizeText = (text) => {
        if (typeof text === 'string') {
            // Loại bỏ dấu và ký tự đặc biệt (chỉ giữ lại chữ cái và số)
            return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
                .replace(/[^a-zA-Z0-9\s]/g, ''); // Loại bỏ ký tự đặc biệt
        }
        return text; // Trả về nguyên vẹn nếu không phải chuỗi
    };
    const formatNumberWithSplit = (number) => {
        const numberString = number.toString(); // Chuyển số thành chuỗi
        const parts = numberString.split('').reverse(); // Chia chuỗi thành mảng các ký tự và đảo ngược

        const formattedParts = [];
        for (let i = 0; i < parts.length; i++) {
            if (i > 0 && i % 3 === 0) {
                formattedParts.push('.'); // Thêm dấu chấm sau mỗi ba ký tự
            }
            formattedParts.push(parts[i]);
        }

        // Đảo lại chuỗi và nối thành chuỗi cuối cùng
        return formattedParts.reverse().join('');
    };

    // Xuất hóa đơn ra PDF
    // Xuất hóa đơn ra PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        // Đảm bảo font Roboto được tải
        doc.addFont("https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92F8zY7UBbX.woff2", "Roboto", "normal");
        doc.setFont('Roboto');
        doc.setFontSize(16);
        doc.text(removeDiacritics('Chi tiet hoa don'), 15, 20); // Chuyển chữ có dấu thành không dấu

        doc.setFontSize(12);
        doc.text(`Ma benh nhan: ${removeDiacritics(item?.MaBenhNhan || 'Không có')}`, 15, 30); // Áp dụng chuẩn hóa cho mã bệnh nhân
        doc.text(`Ngay tao hoa don: ${removeDiacritics(formatNgaySinh(item?.NgayLapHoaDon) || 'Không có')}`, 15, 40);
        doc.text(`Ma hoa don: ${removeDiacritics(item?.MaHoaDon || 'Không có')}`, 15, 50);

        const MaHoaDonS = item?.MaHoaDon;
        const filteredData = hoaDonChiTiet.filter(item => item.MaHoaDon === MaHoaDonS);

        // Dùng toàn bộ dữ liệu từ hoaDonChiTiet thay vì dữ liệu phân trang
        const tableData = filteredData.map(item => [
            item.MaChiTiet,
            item.MaHoaDon,
            normalizeText(removeDiacritics(item.TenDichVu)), // Áp dụng chuẩn hóa cho tên dịch vụ
            item.SoLuong,
            item.DonGia ? formatNumberWithSplit(item.DonGia)+' VND' : 'Chưa có',
            formatNumberWithSplit(item.SoLuong * item.DonGia)+' VND'
        ]);

        doc.autoTable({
            head: [['#ID', 'Ma hoa don', 'Ten dich vu/loai thuoc', 'So luong', 'Don gia', 'Thanh tien']].map(row => row.map(removeDiacritics)), // Loại bỏ dấu toàn bộ tiêu đề
            body: tableData,
            startY: 60,
        });

        doc.text(`Tong tien: ${ formatNumberWithSplit(item.TongTien)+" VND"}`, 140, doc.lastAutoTable.finalY + 10);
        doc.save(`HoaDon_${removeDiacritics(item.MaHoaDon)}.pdf`); // Tên file cũng được chuẩn hóa
    };
    const recipientEmail = item?.Email || "tuanbmt753753@gmail.com"; // Nếu có email trong item thì sử dụng, nếu không thì lấy mặc định


    const YOUR_SERVICE_ID2 = 'service_mbd8hfn';
    const YOUR_TEMPLATE_ID2 = 'template_cia43od';
    const YOUR_USER_ID2 = 'Z5ioka3xZwwjSWtkA';

    const YOUR_SERVICE_ID = 'service_0bg8uts';
    const YOUR_TEMPLATE_ID = 'template_536oeqm';
    const YOUR_USER_ID = 'ZlYajkYUVCOi2u_wL';

    const handleSendInvoice = async () => {
        if (emailInput.trim()) {

            try {
                handleSendInvoiceEmail(YOUR_SERVICE_ID,YOUR_TEMPLATE_ID,YOUR_USER_ID);
            } catch (error) {
                alert('Error sending email:', error);
                console.error('Error sending email:', error);

            }
        }
        else{
             alert('E-mail không được để trống!');
        }
    };

    const handleSendInvoiceEmail = async (SERVICE_ID,TEMPLATE_ID,USER_ID) => {

            const recipientEmail = item?.Email || "tuanbmt753753@gmail.com"; // Đảm bảo recipientEmail không rỗng

                 // Tạo nội dung bảng chi tiết hóa đơn dưới dạng HTML
                 const tableRows = displayedData.map(item => `
                     <tr>
                         <td>${item.MaChiTiet}</td>
                         <td>${item.MaHoaDon}</td>
                         <td>${normalizeText(item.TenDichVu)}</td>
                         <td>${item.SoLuong}</td>
                         <td>${item.DonGia ? item.DonGia.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'Chưa có'}</td>
                         <td>${(item.SoLuong * item.DonGia).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                     </tr>
                 `).join('');

                 const htmlMessage = `
                                     <!DOCTYPE html>
                                     <html lang="vi">
                                     <head>
                                       <meta charset="UTF-8">
                                       <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                       <title>Quản lý bệnh viện</title>
                                       <style>
                                         body {
                                           font-family: 'Arial', sans-serif;
                                           background-color: #e9f7fb;
                                           margin: 0;
                                           padding: 0;
                                           box-sizing: border-box;
                                         }

                                         h1 {
                                           font-size: 64px;
                                           font-weight: bold;
                                           text-align: center;
                                           margin-top: 50px;
                                           color: #3498db;
                                           text-transform: uppercase;
                                           letter-spacing: 5px;
                                           animation: slideIn 3s ease-in-out;
                                         }

                                         @keyframes slideIn {
                                           0% {
                                             transform: translateY(-100%);
                                             opacity: 0;
                                           }
                                           100% {
                                             transform: translateY(0);
                                             opacity: 1;
                                           }
                                         }

                                         h2 {
                                           font-size: 32px;
                                           font-weight: bold;
                                           text-align: center;
                                           color: #555;
                                           margin-top: 30px;
                                           animation: fadeIn 2s ease-in;
                                         }

                                         @keyframes fadeIn {
                                           0% {
                                             opacity: 0;
                                           }
                                           100% {
                                             opacity: 1;
                                           }
                                         }

                                         p {
                                           font-size: 18px;
                                           line-height: 1.6;
                                           margin: 15px 0;
                                           color: #333;
                                           text-align: left;
                                         }

                                         table {
                                           width: 85%;
                                           margin: 40px auto;
                                           border-collapse: collapse;
                                           background-color: #fff;
                                           box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.1);
                                           transform: scale(1);
                                           transition: transform 0.3s ease-in-out;
                                         }

                                         table:hover {
                                           transform: scale(1.05);
                                         }

                                         table th, table td {
                                           padding: 12px;
                                           text-align: center;
                                           border: 1px solid #ddd;
                                           font-size: 16px;
                                         }

                                         table th {
                                           background-color: #3498db;
                                           color: white;
                                         }

                                         table td {
                                           color: #555;
                                         }

                                         table tbody tr:nth-child(odd) {
                                           background-color: #f9f9f9;
                                         }

                                         table tbody tr:hover {
                                           background-color: #f1f1f1;
                                           cursor: pointer;
                                           transform: translateY(-5px);
                                           transition: transform 0.2s;
                                         }

                                         .total-price {
                                           font-size: 22px;
                                           font-weight: bold;
                                           color: #27ae60;
                                           text-align: center;
                                           margin-top: 30px;
                                           padding: 10px;
                                           background-color: #fff;
                                           border-radius: 10px;
                                           box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                                         }

                                         /* Button Styling */
                                         button {
                                           padding: 12px 24px;
                                           font-size: 18px;
                                           background-color: #3498db;
                                           color: white;
                                           border: none;
                                           border-radius: 5px;
                                           cursor: pointer;
                                           transition: background-color 0.3s ease;
                                           margin-top: 20px;
                                         }

                                         button:hover {
                                           background-color: #2980b9;
                                         }

                                         /* Responsive Design */
                                         @media (max-width: 768px) {
                                           h1 {
                                             font-size: 48px;
                                           }
                                           h2 {
                                             font-size: 28px;
                                           }
                                           table {
                                             width: 95%;
                                           }
                                           .total-price {
                                             font-size: 18px;
                                           }
                                         }
                                       </style>
                                     </head>
                                     <body>

                                       <h1>Quản lý bệnh viện</h1>
                                       <h2>Hóa đơn chi tiết</h2>
                                       <p>Mã bệnh nhân: ${normalizeText(item?.MaBenhNhan || 'Không có')}</p>
                                       <p>Ngày tạo hóa đơn: ${normalizeText(formatNgaySinh2(item?.NgayLapHoaDon) || 'Không có')}</p>
                                       <p>Mã hóa đơn: ${normalizeText(item?.MaHoaDon || 'Không có')}</p>

                                       <table>
                                         <thead>
                                           <tr>
                                             <th>#ID</th>
                                             <th>Mã hóa đơn</th>
                                             <th>Tên dịch vụ/loại thuốc</th>
                                             <th>Số lượng</th>
                                             <th>Đơn giá</th>
                                             <th>Thành tiền</th>
                                           </tr>
                                         </thead>
                                         <tbody>
                                           ${tableRows}
                                         </tbody>
                                       </table>

                                       <p class="total-price">Tổng tiền: ${formatNumberWithSplit(item.TongTien)} VND</p>

                                     </body>
                                     </html>



                 `;

                  const emailData = {
                     from_name: item?.MaBenhNhan || 'Không có tên',
                     from_email: emailInput,
                     to_email: recipientEmail,
                     subject: `Hóa đơn ${item?.MaHoaDon}`,
                     message_html: htmlMessage, // Gửi nội dung bảng chi tiết trong email
                 };

                 const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailData, USER_ID);

                   // Kiểm tra kết quả trả về từ EmailJS
                   if (result.status === 200) {
                     // Gửi thành công
                     alert('Email sent successfully');
                     console.log('Email sent successfully:', result.text);
                 } else {
                     // Nếu không phải status 200, có thể xảy ra lỗi
                     alert('Email gửi bị lỗi. Tôi đang dùng thêm tài khoản khác để gửi !.');
                     console.log('Email send failed:', result);
                     handleSendInvoiceEmail(YOUR_SERVICE_ID2,YOUR_TEMPLATE_ID2,YOUR_USER_ID2);



                 }
                 setEmailInput('');
                 setAnEmailInput('');
    }

//     useEffect(() => {
//         if (AnEmailInput) {
//             const interval = setInterval(() => {
//                 setAnEmailInput(false); // Dừng ẩn hiện
//             }, 3000); // Lặp trong 3 giây
//             return () => clearInterval(interval);
//         }
//     }, [AnEmailInput]);

   const HienInPutNhanEmail = () => {
       setAnEmailInput('Hiện'); // Đổi trạng thái ẩn/hiện
   };

    const DongInPutNhanEmail = async () => {
        setAnEmailInput('');
    }


    const generatePdfBase64 = async () => {
        const doc = new jsPDF();

        // Thiết lập font và tiêu đề
        doc.addFont("https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92F8zY7UBbX.woff2", "Roboto", "normal");
        doc.setFont('Roboto');
        doc.setFontSize(16);
        doc.text(removeDiacritics('Chi tiet hoa don'), 15, 20);
        doc.setFontSize(12);
        doc.text(`Ma benh nhan: ${removeDiacritics(item?.MaBenhNhan || 'Không có')}`, 15, 30);
        doc.text(`Ngay tao hoa don: ${removeDiacritics(formatNgaySinh(item?.NgayLapHoaDon) || 'Không có')}`, 15, 40);
        doc.text(`Ma hoa don: ${removeDiacritics(item?.MaHoaDon || 'Không có')}`, 15, 50);

        // Kiểm tra và chuẩn bị dữ liệu cho bảng
        const tableData = hoaDonChiTiet.map(detail => [
            detail.MaChiTiet,
            detail.MaHoaDon,
            normalizeText(removeDiacritics(detail.TenDichVu)),
            detail.SoLuong,
            detail.DonGia ? formatNumberWithSplit(detail.DonGia) + ' VND' : 'Chưa có',
            formatNumberWithSplit(detail.SoLuong * detail.DonGia) + ' VND'
        ]);

        // Kiểm tra dữ liệu bảng trước khi sử dụng
        if (tableData.length === 0) {
            console.error("Dữ liệu bảng không hợp lệ: ", tableData);
        }

        // Đảm bảo rằng tableData không phải là null hoặc undefined
        if (!tableData || tableData.length === 0) {
            throw new Error("Dữ liệu bảng không hợp lệ.");
        }

        // Sử dụng autoTable để tạo bảng
        doc.autoTable({
            head: [['#ID', 'Ma hoa don', 'Ten dich vu/loai thuoc', 'So luong', 'Don gia', 'Thanh tien']],
            body: tableData,
            startY: 60,
        });

        // In tổng tiền
        doc.text(`Tong tien: ${ formatNumberWithSplit(item.TongTien) + " VND"}`, 140, doc.lastAutoTable.finalY + 10);

        // Trả về PDF dưới dạng base64
        return doc.output('datauristring');
    };





    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="error">Lỗi: {error}</div>;
    }

    return (
        <div className="container" >
            <Menu1 />
            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="page-title">Chi tiết hóa đơn</h2>
                    </div>
                    <div className="card-header">
                        <span>Mã bệnh nhân: {normalizeText(item?.MaBenhNhan || 'Không có')}</span>
                        <span>Ngày tạo hóa đơn: {normalizeText(formatNgaySinh(item?.NgayLapHoaDon) || 'Không có')}</span>
                    </div>
                    <div className="card-header">
                        <span>Mã hóa đơn: {normalizeText(item?.MaHoaDon || 'Không có')}</span>
                    </div>
                    <div className="table-container">
                        {displayedData.length === 0 ? (
                            <p>Không có chi tiết nào cho mã hóa đơn này.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>#ID</th>
                                        <th>Mã hóa đơn</th>
                                        <th>Tên dịch vụ/loại thuốc</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền {AnEmailInput}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((item) => (
                                        <tr key={item.MaChiTiet}>
                                            <td>{item.MaChiTiet}</td>
                                            <td>{item.MaHoaDon}</td>
                                            <td>{normalizeText(item.TenDichVu)}</td> {/* Áp dụng chuẩn hóa */}
                                            <td>{item.SoLuong}</td>
                                            <td>
                                                {item.DonGia
                                                    ? item.DonGia.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                                                    : 'Chưa có'}
                                            </td>
                                            <td>
                                                {(item.SoLuong * item.DonGia).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {displayedData.length > 0 && (
                        <div className="pagination">
                            <span>Trang {currentPage} của {totalPages}</span>
                            <div className="pagination-controls">
                                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Hiển thị tổng tiền cho các mục trên trang hiện tại */}
                    <div className="total-amount" style={{ textAlign: 'right' }}>
                        <h3>Tổng tiền: {item.TongTien.toLocaleString('vi-VN')} VND</h3>
                    </div>
                    {AnEmailInput && (
                        <div className={`email-input-hoadon ${AnEmailInput ? 'show' : ''}`}>
                            <label htmlFor="email">Nhập email nhận hóa đơn:</label>
                            <input
                                type="email"
                                id="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="Nhập email"
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop:"10px", width:"100%" }}>
                                <button style={{ width: "48%" }} onClick={() => setAnEmailInput('')}>Hủy hành động</button>
                                <button style={{ width: "48%" }} onClick={handleSendInvoice}>Gửi hóa đơn</button>
                            </div>
                        </div>
                    )}



                    <div className="action-buttons-hoadon">
                        <button className="action-btn-hoadon brown" disabled={displayedData.length === 0} onClick={handleExportPDF}>
                            <span className="icon"><Printer size={20} /></span> Xuất PDF
                        </button>
                        <button
                            className="action-btn-hoadon green"
                            disabled={displayedData.length === 0}
                            onClick={() => setAnEmailInput('Hiện')}
                        >
                            <span className="icon" onClick={() => setAnEmailInput('Hiện')}><Send size={20} /></span> Gửi hóa đơn
                        </button>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default HoaDonChiTiet;
