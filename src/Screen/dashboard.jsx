import React, { useState, useEffect } from 'react';
import { Bell, Search, ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';
import {
  ChevronUp,
  ChevronDown,
  Users,
  FileText
} from 'lucide-react';
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
  });

  // Hàm tính phần trăm thay đổi
  // Hàm tính phần trăm thay đổi
  const calculateChangePercentage = (newValue, oldValue) => {
    if (oldValue === 0) return newValue === 0 ? 0 : 1; // Tránh chia cho 0, và nếu newValue > 0 thì trả về 1%
    return ((newValue - oldValue) / oldValue * 100).toFixed(2);
  };


  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cập nhật dữ liệu trước
        const updateResponse = await fetch('http://localhost:5000/api/thongketonghop_vathuthapthongtin', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ /* Tham số cần thiết cho API */ }),
        });

        const updateData = await updateResponse.json();
        if (!updateData.success) {
          console.error('Lỗi khi cập nhật thông tin');
          return;
        }

        // Sau khi cập nhật, gọi API để lấy dữ liệu thống kê
        const response = await fetch('http://localhost:5000/api/tonghopthongtin');
        const data = await response.json();

        const totalPatients = data.data.reduce((acc, curr) => acc + curr.SoLuongBenhNhan, 0);
        const totalDoctors = data.data.reduce((acc, curr) => acc + curr.SoLuongBacSi, 0);
        const totalInvoices = data.data.reduce((acc, curr) => acc + curr.SoLuongHoaDon, 0);
        const totalRevenue = data.data.reduce((acc, curr) => acc + curr.DoanhThu, 0);
        const totalInsurance = data.data.reduce((acc, curr) => acc + curr.ChiPhiBHYT, 0);

        // Cập nhật dữ liệu thống kê chính
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
            title: "Doanh thu",
            value: formatCurrency(totalRevenue),
            change: `${calculateChangePercentage(totalRevenue, previousStats.totalRevenue)}% Up from yesterday`,
            icon: <FileText size={20} />,
            iconColor: "#6366f1",
            isPositive: totalRevenue >= 0
          }
        ]);

        // Cập nhật dữ liệu thống kê phụ
        setSecondaryStats([
          {
            title: "Số tiền đơn do bảo hiểm chi trả",
            value: formatCurrency(totalInsurance),
            change: `${calculateChangePercentage(totalInsurance, previousStats.totalInsurance)}% Up from yesterday`,
            isPositive: totalInsurance >= 0
          },
          {
            title: "Doanh thu",
            value: `${formatCurrency(totalRevenue)}`,
            change: `${calculateChangePercentage(totalRevenue, previousStats.totalRevenue)}% Up from yesterday`,
            isPositive: true
          }
        ]);

        // Cập nhật dữ liệu cho biểu đồ
        const updatedChartData = data.data.map(item => ({
          date: new Date(item.Ngay).toLocaleDateString(),
          revenue: item.DoanhThu,
          insurance: item.ChiPhiBHYT,
          invoice: item.SoLuongHoaDon,
          patients: item.SoLuongBenhNhan,
          doctors: item.SoLuongBacSi
        }));
        setChartData(updatedChartData);
        setSoLuongBN(totalPatients);

        // Lưu giá trị mới vào state previousStats để dùng cho lần sau
        setPreviousStats({
          totalPatients,
          totalDoctors,
          totalInvoices,
          totalRevenue,
          totalInsurance
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Chạy khi component mount

  return (
    <div className="container">
      <Menu1 />

      {/* Main Content */}
      <div className="main-content">
        <Search1 />
        <h1 className="page-title">Dashboard {SoLuongBN}</h1>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="secondary-stats">
          {secondaryStats.map((stat, index) => (
            <SecondaryStatCard key={index} {...stat} />
          ))}
        </div>

        {/* Doanh thu và Chi phí bảo hiểm - Bar Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">Doanh thu và Chi phí BHYT</h2>
            <select className="month-select">
              <option>October</option>
            </select>
          </div>
          <div className="chart-container">
            <BarChart
              width={1000}
              height={400}
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" name="Doanh thu" fill="#6366f1" />
              <Bar dataKey="insurance" name="Chi phí BHYT" fill="#22c55e" />
            </BarChart>
          </div>
        </div>

        {/* Các thông tin khác - Biểu đồ miền */}
        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">Thông tin khác</h2>
          </div>
          <div className="chart-container">
            <AreaChart
              width={1000}
              height={400}
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="patients" name="Bệnh nhân" stroke="#ff9800" fill="#ffeb3b" />
              <Area type="monotone" dataKey="doctors" name="Bác sĩ" stroke="#ff5722" fill="#ffccbc" />
              <Area type="monotone" dataKey="invoice" name="Số hóa đơn" stroke="#94a3b8" fill="#e2e8f0" />
            </AreaChart>
          </div>
        </div>
      </div>
    </div>
  );
}
