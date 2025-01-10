import React, { useState, useEffect } from 'react';
import { Bell, Search, ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';
import { ChevronUp, ChevronDown, Users, FileText } from 'lucide-react';
import { AreaChart, BarChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../Styles/Dashboard.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

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

  // Hàm tính phần trăm thay đổi
  const calculateChangePercentage = (newValue, oldValue) => {
    if (oldValue === 0) return newValue === 0 ? 0 : 1;
    return ((newValue - oldValue) / oldValue * 100).toFixed(2);
  };

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

    fetchData();
  }, []);


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

        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">Doanh thu và Chi phí BHYT</h2>
            <select className="month-select">
              <option>October</option>
            </select>
          </div>
          <div className="chart-container">
            <BarChart width={1000} height={400} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

        <div className="chart-section">
          <AreaChart width={1000} height={400} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
    </div>
  );
}
