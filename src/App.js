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

import QuanLyVatTu from './Screen/QuanLyVatTu';
import ChiTietVatTu from './Screen/ChiTietVatTu';
import CRUDVatTu from './Screen/CRUDVatTu';

import HoaDonChiTiet from './Screen/QuanLyHoaDonChiTiet';
import CRUDHoaDonChiTiet from './Screen/CRUDHoaDonChiTiet';
import TraCuuVaNhapHoaDonCT from './Screen/TraCuuVaNhapHoaDonCT';
import CRUDTraCuuVaNhapHoaDonChiTiet from './Screen/CRUDTraCuuVaNhapHoaDonChiTiet';

import XetNghiem from './Screen/XetNghiem';
import CRUDXetNghiem from './Screen/CRUDXetNghiem';
import CRUDDonThuoc from './Screen/CRUDDonThuoc';

import EditPayment from './Screen/EditPayment';
import DanhMucList from './Screen/DanhMucThuoc';
import DanhMucThuoc from './Screen/DanhMucThuoc';

import XuatHoaDon from './Screen/XuatHoaDon';

import LichKham from './Screen/LichKham';
import CRUDLichKham from './Screen/CRUDLichKham';

import DieuTri from './Screen/DieuTri';
import CRUDDieuTri from './Screen/CRUDDieuTri';

import ADDBHYT from './Screen/ADDBHYT';
import QuanLyBaoHiemNguoiDung from './Screen/QuanLyBaoHiemNguoiDung';

import AddPayment from './Screen/AddPayment';

import CaiDatThongTin from './Screen/CaiDatThongTin';
import Login from './Screen/Login';
import Register from './Screen/Register';

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
            <Route path="/quanlyvattu" element={<QuanLyVatTu/>} />
            <Route path="/chi-tiet-vat-tu/:id" element={<ChiTietVatTu/>} />
            <Route path="/them-vat-tu" element={<CRUDVatTu/>} />
            <Route path="/hoa-don-chi-tiet" element={<HoaDonChiTiet/>} />
            <Route path="themSuaXoaHoaDonChiTiet" element={<CRUDHoaDonChiTiet/>} />
            <Route path="tra-cuu-va-nhap-hoa-don" element={<TraCuuVaNhapHoaDonCT/>} />
            <Route path="crud-tra-cuu-va-nhap-hoa-don-chi-tiet" element={<CRUDTraCuuVaNhapHoaDonChiTiet/>} />

            <Route path="xet-nghiem" element={<XetNghiem/>} />
            <Route path="crud-xet-nghiem" element={<CRUDXetNghiem/>} />
            <Route path="/cruddonthuoc" element={<CRUDDonThuoc/>} />
            <Route path="/danhmuc" element={<DanhMucThuoc/>} />
            <Route path="/EditPayment/:paymentId" element={<EditPayment/>} />

            <Route path="/XuatHoaDon" element={<XuatHoaDon/>} />

            <Route path="/lich-hen" element={<LichKham/>} />
            <Route path="/CRUDLichKham" element={<CRUDLichKham/>} />

            <Route path="/lich-su-dieu-tri" element={<DieuTri/>} />
            <Route path="/CRUDDieuTri" element={<CRUDDieuTri/>} />

            <Route path="/ADDBHYT" element={<ADDBHYT/>} />
            <Route path="/QuanLyBaoHiemNguoiDung" element={<QuanLyBaoHiemNguoiDung/>} />

            <Route path="/AddPayment" element={<AddPayment/>} />

            <Route path="/quan-ly-tai-khoan" element={<CaiDatThongTin/>} />
            <Route path="/Login" element={<Login/>} />
            <Route path="/Register" element={<Register/>} />


          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
