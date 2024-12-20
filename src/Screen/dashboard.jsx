import React from 'react';
import {
  Clock,
  PackageSearch,
  Heart,
  ClipboardList,
  TestTube,
  ListChecks,
  FileText,
  FileBarChart,
  Shield,
  Users,
  Wallet,
  LineChart,
  UserCog,
  Table,
  Settings,
  LogOut,
  Menu,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../Styles/Dashboard.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const statsData = [
  {
    title: "Số lượng người dùng",
    value: "40,689",
    change: "8.5% Up from yesterday",
    icon: <Users size={20} />,
    iconColor: "#6366f1",
    isPositive: true
  },
  {
    title: "Số lượng nhân viên",
    value: "10293",
    change: "1.3% Up from past week",
    icon: <Users size={20} />,
    iconColor: "#ca8a04",
    isPositive: true
  },
  {
    title: "Số lượng bác sĩ",
    value: "89,000",
    change: "4.3% Down from yesterday",
    icon: <Users size={20} />,
    iconColor: "#16a34a",
    isPositive: false
  },
  {
    title: "Số lượng hóa đơn",
    value: "2040",
    change: "1.8% Up from yesterday",
    icon: <FileText size={20} />,
    iconColor: "#dc2626",
    isPositive: true
  }
];

const secondaryStats = [
  {
    title: "Số lượng hóa đơn do bảo hiểm chi trả",
    value: "2040",
    change: "1.8% Up from yesterday",
    isPositive: true
  },
  {
    title: "Doanh thu",
    value: "$2040",
    change: "1.8% Up from yesterday",
    isPositive: true
  }
];

const chartData = [
  { date: '11/12/2024', revenue: 64364.77, insurance: 64364.77, invoice: 64364.77 },
  { date: '12/12/2024', revenue: 54364.77, insurance: 55000, invoice: 52000 },
  { date: '13/12/2024', revenue: 44364.77, insurance: 45000, invoice: 43000 },
  { date: '14/12/2024', revenue: 74364.77, insurance: 75000, invoice: 73000 },
  { date: '15/12/2024', revenue: 84364.77, insurance: 85000, invoice: 83000 },
  { date: '16/12/2024', revenue: 94364.77, insurance: 95000, invoice: 93000 },
  { date: '17/12/2024', revenue: 64364.77, insurance: 65000, invoice: 63000 },
  { date: '18/12/2024', revenue: 54364.77, insurance: 55000, invoice: 53000 }
];

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
  return (
    <div className="container">
      <Menu1 />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <Search1/>

        <h1 className="page-title">Dashboard</h1>

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

        {/* Revenue Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">Doanh thu</h2>
            <select className="month-select">
              <option>October</option>
            </select>
          </div>
          <div className="chart-container">
            <BarChart width={1000} height={400} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" name="Doanh thu" fill="#6366f1" />
              <Bar dataKey="insurance" name="Chi phí BHYT" fill="#22c55e" />
              <Bar dataKey="invoice" name="Số hóa đơn" fill="#94a3b8" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
}