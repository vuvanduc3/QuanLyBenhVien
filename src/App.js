import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu1 from './components/Menu'; // Sidebar Menu
import Dashboard from './Screen/Dashboard';
import InsuranceList from './Screen/InsuranceList';
import InsurancePayment from './Screen/InsurancePayment';
import PaymentList from './Screen/PaymentList';
import InvoiceForm from './Screen/InvoiceForm';

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
            <Route path="/prescriptions" element={<h2>Đơn thuốc</h2>} />
            <Route path="/insurance-payment" element={<InsurancePayment />} />
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/invoices" element={<InvoiceForm />} />
            <Route path="/settings" element={<h2>Cài đặt</h2>} />
            <Route path="/logout" element={<h2>Đăng Xuất</h2>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
