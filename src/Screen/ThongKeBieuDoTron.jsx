import React, { useState, useEffect } from 'react';
import { Bell, Search, ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';
import { ChevronUp, ChevronDown, Users, FileText } from 'lucide-react';
import { AreaChart, BarChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Chart as ChartJS, Title, Tooltip as ChartTooltip, Legend as ChartLegend, ArcElement, CategoryScale } from 'chart.js';
import { Pie } from 'react-chartjs-2';

import '../Styles/Dashboard.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

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
  const [chartData, setChartData] = useState([]);
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

  // Hàm lấy và chuẩn bị dữ liệu cho biểu đồ tròn
  const fetchAndPrepareData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ThongKe_TongHopThongTinKhac');
      const data = await response.json();

      const stats = data.data[0]; // Lấy đối tượng đầu tiên trong mảng "data"

      // Chuẩn bị dữ liệu cho Pie Chart
      setPieChartData({
        labels: [
          'Số lượng khám mới',
          'Số lượng tái khám',
          'Số lượng cấp cứu',
          'Số lượng theo dõi',
          'Số lượng chuyển viện',
          'Số lượng điều trị ngoại trú',
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
            ],
            backgroundColor: ['#ff5722', '#16a34a', '#dc2626', '#6366f1', '#fbbf24', '#4f8c91'],
            hoverBackgroundColor: ['#ff7043', '#38a169', '#f87171', '#3b82f6', '#fbbf24', '#4f8c91'],
          },
        ],
      });

    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    }
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
          body: JSON.stringify({ /* Tham số cần thiết cho API */ } ),
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

        setStatsData([
            /* Cập nhật thống kê thông tin theo logic của bạn */



        ]);

        setSecondaryStats([ /* Cập nhật thông tin phụ */ ]);

        setChartData([ /* Cập nhật dữ liệu biểu đồ */ ]);

        setPreviousStats({ /* Cập nhật previous stats */ });

        fetchAndPrepareData(); // Gọi hàm lấy và chuẩn bị dữ liệu cho Pie chart

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
        <h1 className="page-title">Dashboard</h1>

        {/* Các thẻ thống kê */}
        <div className="stat-cards">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Biểu đồ tròn */}
        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">Thống kê Khám, Tái khám, Cấp cứu, Điều trị</h2>
          </div>
          <div className="chart-container">
            <Pie data={pieChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
        </div>

        {/* Các phần khác của Dashboard */}
        <div className="secondary-stats">
          {secondaryStats.map((stat, index) => (
            <SecondaryStatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </div>
  );
}
