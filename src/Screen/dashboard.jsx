import React, { useState, useEffect, useRef  } from 'react';
import { Bell, Search, ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';
import { ChevronUp, ChevronDown, Users, FileText } from 'lucide-react';
import { AreaChart, BarChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Chart as ChartJS, Title, Tooltip as ChartTooltip, Legend as ChartLegend, ArcElement, CategoryScale } from 'chart.js';

import { Pie } from 'react-chartjs-2';

import '../Styles/Dashboard.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


// Đảm bảo đường dẫn đúng
ChartJS.register(ArcElement, CategoryScale, ChartTooltip, ChartLegend, Title);

// Hàm định dạng tiền VND
const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);
};

// Component StatCard
function StatCard({ title, value, change, icon, iconColor, isPositive }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${iconColor}15`, color: iconColor }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {change}
        </div>
      </div>
    </div>
  );
}

// Component SecondaryStatCard
function SecondaryStatCard({ title, value, change, isPositive }) {
  return (
    <div className="secondary-stat-card">
      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {change}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [statsData, setStatsData] = useState([]);
  const [secondaryStats, setSecondaryStats] = useState([]);
  const [SoLuongBN, setSoLuongBN] = useState('');
  const [chartData, setChartData] = useState([]);
  const [previousStats, setPreviousStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    totalInsurance: 0,
    totalTests: 0,
    totalTreatment: 0,
    totalMedicalSupplies: 0,
    totalInvoicesDetails: 0
  });
  const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,  // Hiển thị 1 item tại một thời điểm
      slidesToScroll: 1, // Kéo từng item
  };

  const [pieChartData, setPieChartData] = useState({
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: ['#ff5722', '#16a34a', '#dc2626', '#6366f1', '#fbbf24', '#4f8c91'],
          hoverBackgroundColor: ['#ff7043', '#38a169', '#f87171', '#3b82f6', '#fbbf24', '#4f8c91'],
        },
      ],
  });

  // Hàm tính phần trăm thay đổi
  const calculateChangePercentage = (newValue, oldValue) => {
    if (oldValue === 0) return newValue === 0 ? 0 : 1;
    return ((newValue - oldValue) / oldValue * 100).toFixed(2);
  };



   const [TongSoPhanTu, setTongSoPhanTu] = useState([]);
  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const updateResponse = await fetch('http://localhost:5000/api/thongketonghop_vathuthapthongtin', {
          method: 'PUT', // Sử dụng phương thức PUT để cập nhật dữ liệu
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ /* Tham số cần thiết cho API */ }),
        });

        const updateData = await updateResponse.json();

        if (!updateData.success) {
          console.error('Lỗi khi cập nhật tổng tiền');
          return; // Dừng lại nếu không cập nhật thành công
        }

       const updateResponse2 = await fetch('http://localhost:5000/api/ThongKe_TongHopThongTinKhac', {
           method: 'PUT', // Sử dụng phương thức PUT để cập nhật dữ liệu
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ /* Tham số cần thiết cho API */ }),
       });

        const updateData2 = await updateResponse2.json();

        if (!updateData2.success) {
           console.error('Lỗi khi cập nhật thông tin khác');
           return; // Dừng lại nếu không cập nhật thành công
        }


        const response = await fetch('http://localhost:5000/api/tonghopthongtin');
        const data = await response.json();

        const sortedData = data.data.sort((a, b) => new Date(b.Ngay) - new Date(a.Ngay));

        const totalPatients = sortedData.reduce((acc, curr) => acc + curr.SoLuongBenhNhan, 0);
        const totalDoctors = sortedData.reduce((acc, curr) => acc + curr.SoLuongBacSi, 0);
        const totalInvoices = sortedData.reduce((acc, curr) => acc + curr.SoLuongHoaDon, 0);
        const totalRevenue = sortedData.reduce((acc, curr) => acc + curr.DoanhThu, 0);
        const totalInsurance = sortedData.reduce((acc, curr) => acc + curr.ChiPhiBHYT, 0);
        const totalTests = sortedData.reduce((acc, curr) => acc + curr.SoLuongXetNghiem, 0);
        const totalTreatment = sortedData.reduce((acc, curr) => acc + curr.SoLuongDieuTri, 0);
        const totalMedicalSupplies = sortedData.reduce((acc, curr) => acc + curr.SoLuongVatTuYTe, 0);
        const totalInvoicesDetails = sortedData.reduce((acc, curr) => acc + curr.SoLuongHoaDonChiTiet, 0);

        // Thêm các giá trị SoLuongThuoc và SoLuongDonThuoc
        const totalSoLuongThuoc = sortedData.reduce((acc, curr) => acc + curr.SoLuongThuoc, 0);
        const totalSoLuongDonThuoc = sortedData.reduce((acc, curr) => acc + curr.SoLuongDonThuoc, 0);

        setTongSoPhanTu(sortedData.reduce((acc, curr) => acc + 1, 0));

        // Cập nhật statsData để chứa thêm các thông tin
        setStatsData([
          {
            title: "Số lượng người dùng",
            value: totalPatients.toString(),
            change: `${calculateChangePercentage(totalPatients, previousStats.totalPatients)}% Up from yesterday`,
            icon: <Users size={20} />,
            iconColor: "#6366f1",
            isPositive: totalPatients >= 0
          },
          {
            title: "Số lượng bác sĩ",
            value: totalDoctors.toString(),
            change: `${calculateChangePercentage(totalDoctors, previousStats.totalDoctors)}% Up from yesterday`,
            icon: <Users size={20} />,
            iconColor: "#16a34a",
            isPositive: totalDoctors >= 0
          },
          {
            title: "Số lượng hóa đơn",
            value: totalInvoices.toString(),
            change: `${calculateChangePercentage(totalInvoices, previousStats.totalInvoices)}% Up from yesterday`,
            icon: <FileText size={20} />,
            iconColor: "#dc2626",
            isPositive: totalInvoices >= 0
          },
          {
            title: "Số lượng hóa đơn chi tiết",
            value: totalInvoicesDetails.toString(),
            change: `${calculateChangePercentage(totalInvoicesDetails, previousStats.totalInvoicesDetails)}% Up from yesterday`,
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: totalInvoicesDetails >= 0
          },
          {
            title: "Doanh thu",
            value: formatCurrency(totalRevenue),
            change: `${calculateChangePercentage(totalRevenue, previousStats.totalRevenue)}% Up from yesterday`,
            icon: <FileText size={20} />,
            iconColor: "#6366f1",
            isPositive: totalRevenue >= 0
          },
          {
            title: "Số lượng xét nghiệm",
            value: totalTests.toString(),
            change: `${calculateChangePercentage(totalTests, previousStats.totalTests)}% Up from yesterday`,
            icon: <FileText size={20} />,
            iconColor: "#ff5722",
            isPositive: totalTests >= 0
          },
          {
            title: "Số lượng điều trị",
            value: totalTreatment.toString(),
            change: `${calculateChangePercentage(totalTreatment, previousStats.totalTreatment)}% Up from yesterday`,
            icon: <FileText size={20} />,
            iconColor: "#fbbf24",
            isPositive: totalTreatment >= 0
          },
          {
            title: "Số lượng vật tư y tế",
            value: totalMedicalSupplies.toString(),
            change: `${calculateChangePercentage(totalMedicalSupplies, previousStats.totalMedicalSupplies)}% Up from yesterday`,
            icon: <FileText size={20} />,
            iconColor: "#ff9800",
            isPositive: totalMedicalSupplies >= 0
          },
          // Thêm thông tin về thuốc
          {
            title: "Số lượng thuốc",
            value: totalSoLuongThuoc.toString(),
            change: `${calculateChangePercentage(totalSoLuongThuoc, previousStats.totalSoLuongThuoc)}% Up from yesterday`,
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: totalSoLuongThuoc >= 0
          },
          {
            title: "Số lượng đơn thuốc",
            value: totalSoLuongDonThuoc.toString(),
            change: `${calculateChangePercentage(totalSoLuongDonThuoc, previousStats.totalSoLuongDonThuoc)}% Up from yesterday`,
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: totalSoLuongDonThuoc >= 0
          }
        ]);

        const otherStatsResponse = await fetch('http://localhost:5000/api/ThongKe_TongHopThongTinKhac');
        const otherStatsData = await otherStatsResponse.json();

        // Lấy đối tượng đầu tiên trong mảng "data"
        const stats = otherStatsData.data[0];
        setPieChartData({
              labels: [
                'Số lượng khám mới',
                'Số lượng tái khám',
                'Số lượng cấp cứu',
                'Số lượng theo dõi',
                'Số lượng chuyển viện',
                'Số lượng điều trị ngoại trú',
                'Số lượng xuất viện', // Thêm nhãn "XuatVien"
                'Số lượng nhập viện', // Thêm nhãn "NhapVien"
              ],
              datasets: [
                {
                  data: [
                    stats.KhamMoi || 0,
                    stats.TaiKham || 0,
                    stats.CapCuu || 0,
                    stats.TheoDoi || 0,
                    stats.ChuyenVien || 0,
                    stats.DieuTriNgoaiTru || 0,
                    stats.XuatVien || 0, // Thêm dữ liệu "XuatVien"
                    stats.NhapVien || 0, // Thêm dữ liệu "NhapVien"
                  ],
                  backgroundColor: [
                    '#ff5722',
                    '#16a34a',
                    '#dc2626',
                    '#6366f1',
                    '#fbbf24',
                    '#4f8c91',
                    '#1e88e5', // Màu cho "XuatVien"
                    '#9c27b0', // Màu cho "NhapVien"
                  ],
                  hoverBackgroundColor: [
                    '#ff7043',
                    '#38a169',
                    '#f87171',
                    '#3b82f6',
                    '#fbbf24',
                    '#4f8c91',
                    '#42a5f5', // Màu hover cho "XuatVien"
                    '#ba68c8', // Màu hover cho "NhapVien"
                  ],
                },
              ],
            });

        // Kiểm tra và xử lý dữ liệu
        setStatsData((prevStatsData) => [
          ...prevStatsData,
          {
            title: "Số lượng khám mới",
            value: stats.KhamMoi != null ? stats.KhamMoi.toString() : "0",
            change: previousStats.KhamMoi != null
              ? `${calculateChangePercentage(stats.KhamMoi, previousStats.KhamMoi)}% Up from yesterday`
              : "0% Up from yesterday",
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: stats.KhamMoi >= 0
          },
          {
            title: "Số lượng tái khám",
            value: stats.TaiKham != null ? stats.TaiKham.toString() : "0",
            change: previousStats.TaiKham != null
              ? `${calculateChangePercentage(stats.TaiKham, previousStats.TaiKham)}% Up from yesterday`
              : "0% Up from yesterday",
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: stats.TaiKham >= 0
          },
          {
            title: "Số lượng cấp cứu",
            value: stats.CapCuu != null ? stats.CapCuu.toString() : "0",
            change: previousStats.CapCuu != null
              ? `${calculateChangePercentage(stats.CapCuu, previousStats.CapCuu)}% Up from yesterday`
              : "0% Up from yesterday",
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: stats.CapCuu >= 0
          },
          {
            title: "Số lượng theo dõi",
            value: stats.TheoDoi != null ? stats.TheoDoi.toString() : "0",
            change: previousStats.TheoDoi != null
              ? `${calculateChangePercentage(stats.TheoDoi, previousStats.TheoDoi)}% Up from yesterday`
              : "0% Up from yesterday",
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: stats.TheoDoi >= 0
          },
          {
            title: "Số lượng chuyển viện",
            value: stats.ChuyenVien != null ? stats.ChuyenVien.toString() : "0",
            change: previousStats.ChuyenVien != null
              ? `${calculateChangePercentage(stats.ChuyenVien, previousStats.ChuyenVien)}% Up from yesterday`
              : "0% Up from yesterday",
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: stats.ChuyenVien >= 0
          },
          {
            title: "Số lượng điều trị ngoại trú",
            value: stats.DieuTriNgoaiTru != null ? stats.DieuTriNgoaiTru.toString() : "0",
            change: previousStats.DieuTriNgoaiTru != null
              ? `${calculateChangePercentage(stats.DieuTriNgoaiTru, previousStats.DieuTriNgoaiTru)}% Up from yesterday`
              : "0% Up from yesterday",
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: stats.DieuTriNgoaiTru >= 0
          },
          {
            title: "Số lượng xuất viện",
            value: stats.XuatVien != null ? stats.XuatVien.toString() : "0",
            change: previousStats.XuatVien != null
              ? `${calculateChangePercentage(stats.XuatVien, previousStats.XuatVien)}% Up from yesterday`
              : "0% Up from yesterday",
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: stats.XuatVien >= 0
          },
          {
            title: "Số lượng nhập viện",
            value: stats.NhapVien != null ? stats.NhapVien.toString() : "0",
            change: previousStats.NhapVien != null
              ? `${calculateChangePercentage(stats.NhapVien, previousStats.NhapVien)}% Up from yesterday`
              : "0% Up from yesterday",
            icon: <FileText size={20} />,
            iconColor: "#4f8c91",
            isPositive: stats.NhapVien >= 0
          }
        ]);


        // Cập nhật secondaryStats
        setSecondaryStats([
          {
            title: "Số tiền đơn do bảo hiểm chi trả",
            value: formatCurrency(totalInsurance),
            change: `${calculateChangePercentage(totalInsurance, previousStats.totalInsurance)}% Up from yesterday`,
            isPositive: totalInsurance >= 0
          }
        ]);

        // Cập nhật dữ liệu cho biểu đồ
        const updatedChartData = sortedData.map(item => ({
          date: new Date(item.Ngay).toLocaleDateString(),
          revenue: item.DoanhThu,
          insurance: item.ChiPhiBHYT,
          invoice: item.SoLuongHoaDon,
          invoicesDetails: item.SoLuongHoaDonChiTiet,
          patients: item.SoLuongBenhNhan,
          doctors: item.SoLuongBacSi,
          tests: item.SoLuongXetNghiem,
          treatment: item.SoLuongDieuTri,
          medicalSupplies: item.SoLuongVatTuYTe,
          SoLuongThuoc: item.SoLuongThuoc || 0, // Giả sử nếu không có dữ liệu thì mặc định là 0
          SoLuongDonThuoc: item.SoLuongDonThuoc || 4 // Giả sử mặc định là 4 nếu không có giá trị
        }));

        setChartData(updatedChartData);


        // Cập nhật previousStats
        setPreviousStats({
          totalPatients,
          totalDoctors,
          totalInvoices,
          totalRevenue,
          totalInsurance,
          totalTests,
          totalTreatment,
          totalMedicalSupplies,
          totalInvoicesDetails,
          totalSoLuongThuoc,
          totalSoLuongDonThuoc
        });

      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };

     // Lấy dữ liệu lần đầu khi component được mount
    fetchData();

    // Thiết lập interval để lấy dữ liệu mỗi 40 giây
    const interval = setInterval(() => {
            fetchData();
    }, 40000);

    // Dọn dẹp interval khi component bị unmount
    return () => clearInterval(interval);

  }, []);

   // Trạng thái kéo cho mỗi biểu đồ
   const [dragging, setDragging] = useState(false);
   const [startX, setStartX] = useState(0); // Vị trí bắt đầu của chuột
   const chartContainerRef1 = useRef(null); // Dùng ref để tham chiếu tới container BarChart
   const chartContainerRef2 = useRef(null); // Dùng ref để tham chiếu tới container AreaChart

   const handleMouseDown = (e, setStart) => {
     setDragging(true);
     setStart(e.clientX);
   };

   const handleMouseMove = (e, setStart, ref) => {
     if (dragging) {
       const diffX = e.clientX - startX;
       ref.current.scrollLeft -= diffX; // Di chuyển biểu đồ theo chiều ngang
       setStart(e.clientX);
     }
   };

   const handleMouseUp = () => {
     setDragging(false);
   };

   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Cập nhật chiều rộng khi cửa sổ thay đổi kích thước
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Tính chiều rộng của biểu đồ (gấp 1.5 lần chiều rộng của cửa sổ)
  const chartWidth = windowWidth * 1.5;


   return (
     <div className="container">
       <Menu1 />
       <div className="main-content">
         <Search1 />
         <h1 className="page-title">Dashboard {SoLuongBN}</h1>

         <div className="stats-grid">
           {statsData.map((stat, index) => (
             <StatCard key={index} {...stat} />
           ))}
         </div>

         <div className="secondary-stats">
           {secondaryStats.map((stat, index) => (
             <SecondaryStatCard key={index} {...stat} />
           ))}
         </div>

         {/* Biểu đồ BarChart */}
         <div className="chart-section">
           <div className="chart-header">
             <h2 className="chart-title">Doanh thu và Chi phí BHYT </h2>
             <select className="month-select">
               <option>October</option>
             </select>
           </div>
           <div
             className="chart-container"
             ref={chartContainerRef1}
             onMouseDown={(e) => handleMouseDown(e, setStartX)}
             onMouseMove={(e) => handleMouseMove(e, setStartX, chartContainerRef1)}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp} // Kết thúc kéo khi chuột rời khỏi phần tử
             style={{ overflowX: 'auto', cursor: 'pointer' }}
           >
             <BarChart width={TongSoPhanTu * 150} height={500} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="date" />
               <YAxis />
               <Tooltip />
               <Legend />
               <Bar dataKey="revenue" name="Doanh thu" fill="#6366f1" />
               <Bar dataKey="insurance" name="Chi phí BHYT" fill="#dc2626" />
             </BarChart>
           </div>
         </div>

         {/* Biểu đồ AreaChart */}
         <div className="chart-section">
           <div
             className="chart-container"
             ref={chartContainerRef2}
             onMouseDown={(e) => handleMouseDown(e, setStartX)}
             onMouseMove={(e) => handleMouseMove(e, setStartX, chartContainerRef2)}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp} // Kết thúc kéo khi chuột rời khỏi phần tử
             style={{ overflowX: 'auto', cursor: 'pointer' }}
           >
             <AreaChart width={TongSoPhanTu * 150} height={500} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="date" />
               <YAxis />
               <Tooltip />
               <Legend />
               <Area type="monotone" dataKey="patients" name="Số lượng bệnh nhân" stroke="#6366f1" fill="#6366f1" />
               <Area type="monotone" dataKey="doctors" name="Số lượng bác sĩ" stroke="#16a34a" fill="#16a34a" />
               <Area type="monotone" dataKey="tests" name="Số lượng xét nghiệm" stroke="#ff5722" fill="#ff5722" />
               <Area type="monotone" dataKey="invoices" name="Số lượng hóa đơn" stroke="#dc2626" fill="#dc2626" />
               <Area type="monotone" dataKey="treatment" name="Số lượng điều trị" stroke="#fbbf24" fill="#fbbf24" />
               <Area type="monotone" dataKey="medicalSupplies" name="Số lượng vật tư y tế" stroke="#ff9800" fill="#ff9800" />
               <Area type="monotone" dataKey="invoicesDetails" name="Số lượng hóa đơn chi tiết" stroke="#4f8c91" fill="#4f8c91" />
               <Area type="monotone" dataKey="SoLuongThuoc" name="Số lượng thuốc" stroke="#00bcd4" fill="#00bcd4" />
               <Area type="monotone" dataKey="SoLuongDonThuoc" name="Số lượng đơn thuốc" stroke="#ff5722" fill="#ff5722" />
             </AreaChart>
           </div>
         </div>


        {/* Biểu đồ tròn */}
        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">Thống kê Khám, Tái khám, Cấp cứu, Điều trị</h2>
          </div>
          <div className="chart-content" style={{ display: 'flex' }}>
            {/* Biểu đồ tròn bên trái */}
            <div className="chart-container" style={{ flex: 1 }}>
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </div>

            {/* Thông tin phụ bên phải */}
            <div className="info-container" style={{ flex: 1, marginLeft: '20px' }}>
              <h3>Thông tin chi tiết</h3>
              <ul>
                    <li>Khám mới: {pieChartData.datasets[0].data[0] || 0}</li>
                    <li>Tái khám: {pieChartData.datasets[0].data[1] || 0}</li>
                    <li>Cấp cứu: {pieChartData.datasets[0].data[2] || 0}</li>
                    <li>Theo dõi: {pieChartData.datasets[0].data[3] || 0}</li>
                    <li>Chuyển viện: {pieChartData.datasets[0].data[4] || 0}</li>
                    <li>Điều trị ngoại trú: {pieChartData.datasets[0].data[5] || 0}</li>
                    <li>Xuất viện: {pieChartData.datasets[0].data[6] || 0}</li> {/* Hiển thị số lượng "XuatVien" */}
                    <li>Nhập viện: {pieChartData.datasets[0].data[7] || 0}</li> {/* Hiển thị số lượng "NhapVien" */}
              </ul>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
