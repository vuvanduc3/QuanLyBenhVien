import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu1 from './components/Menu'; // Sidebar Menu
import Dashboard from './Screen/dashboard';
import InsuranceList from './Screen/InsuranceList';
import InsurancePayment from './Screen/InsurancePayment';
import PaymentList from './Screen/PaymentList';
import InvoiceForm from './Screen/InvoiceForm';
import AddInvoice from './Screen/AddInvoice';
import MedicalRecordList from './Screen/HoSoBenhAn';
import DonThuoc from './Screen/DonThuoc';
import QuanLyThuoc from './Screen/QuanLyThuoc';
import ThemSuaXoaThuoc from './Screen/CRUDThuoc';
import QuanLyNguoiDung from './Screen/QuanLyNguoiDung';
import ChiTietThuoc from './Screen/ChiTietThuoc';
import AddMedicalRecord from './Screen/AddHSBA';
import MedicalRecordDetail from './Screen/ChiTietHSBA';
function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboad" element={<Dashboard/>} />
            <Route path="/medicines" element={<InsuranceList />} />
            <Route path="/medical-records" element={<h2>Hồ sơ bệnh án</h2>} />
            <Route path="/donthuoc" element={<DonThuoc/>} />
            <Route path="/insurance-payment" element={<InsurancePayment />} />
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/invoices" element={<InvoiceForm />} />
            <Route path="/settings" element={<h2>Cài đặt</h2>} />
            <Route path="/logout" element={<h2>Đăng Xuất</h2>} />
            <Route path="/addinvoice" element={<AddInvoice/>} />
            <Route path="/hosobenhan" element={<MedicalRecordList/>} />
            <Route path="/quanlythuoc" element={<QuanLyThuoc/>} />
            <Route path="/themsuaxoathuoc" element={<ThemSuaXoaThuoc/>} />
            <Route path="/quanlynguoidung" element={<QuanLyNguoiDung/>} />
            <Route path="/quanlythuoc" element={<QuanLyThuoc/>} />
            <Route path="/themsuaxoathuoc" element={<ThemSuaXoaThuoc/>} />
            <Route path="/chi-tiet-thuoc/:id" element={<ChiTietThuoc/>} />
            <Route path="/hosobenhan/add" element={<AddMedicalRecord />} />
            <Route path="/chitiethsba/:id" element={<MedicalRecordDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
