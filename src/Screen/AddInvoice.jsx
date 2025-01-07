import React, { useState } from 'react';
import { Search, Clock, Package, Heart, FileText, List, Activity, LayoutList, Grid, Settings, LogOut, Edit, Trash } from 'lucide-react';
import '../Styles/AddInvoice.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const AddInvoice = () => {
 
    const [formData, setFormData] = useState({
      MaHoaDon: '',
      MaBenhNhan: '',
      MaBacSi: '',
      TongTien: '',
      TrangThai: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
  
    // Xử lý thay đổi input
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    // Xử lý gửi form
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');
      try {
        const response = await fetch('http://localhost:5000/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.success) {
          setMessage('Thêm hóa đơn thành công!');
          setFormData({
            MaHoaDon: '',
            MaBenhNhan: '',
            MaBacSi: '',
            TongTien: '',
            TrangThai: '',
          });
        } else {
          setMessage(`Lỗi: ${data.message}`);
        }
      } catch (error) {
        setMessage('Đã xảy ra lỗi khi thêm hóa đơn');
        console.error('Error adding invoice:', error);
      } finally {
        setLoading(false);
      }
    };
  return (
    <div className="container">
       <Menu1/>

      <div className="main-content">
      <Search1/>

        <div className="form-container">
        <h2>Thêm hóa đơn mới</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="MaHoaDon">Mã hóa đơn</label>
          <input
            type="text"
            id="MaHoaDon"
            name="MaHoaDon"
            value={formData.MaHoaDon}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="MaBenhNhan">Mã bệnh nhân</label>
          <input
            type="text"
            id="MaBenhNhan"
            name="MaBenhNhan"
            value={formData.MaBenhNhan}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="MaBacSi">Mã bác sĩ</label>
          <input
            type="text"
            id="MaBacSi"
            name="MaBacSi"
            value={formData.MaBacSi}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="TongTien">Tổng tiền</label>
          <input
            type="number"
            id="TongTien"
            name="TongTien"
            value={formData.TongTien}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="TrangThai">Trạng thái</label>
          <select
            id="TrangThai"
            name="TrangThai"
            value={formData.TrangThai}
            onChange={handleChange}
            required
          >
            <option value="">Chọn trạng thái</option>
            <option value="Chưa thanh toán">Chưa thanh toán</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
          </select>
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Đang thêm...' : 'Thêm hóa đơn'}
        </button>
      </form>
            
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;
/* InvoiceForm.css */
