import React from 'react';
import { Search, Clock, Package, Heart, FileText, List, Activity, LayoutList, Grid, Settings, LogOut, Edit, Trash } from 'lucide-react';
import '../Styles/AddInvoice.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
const AddInvoice = () => {

  return (
    <div className="container">
       <Menu1/>

      <div className="main-content">
      <Search1/>

        <div className="form-container">
          <div className="form-header">
            <div>
              <div className="page-id">#ID: LH001</div>
              <h1 className="form-title">Thêm, sửa hóa đơn</h1>
              <div className="patient-id">Mã hồ sơ bệnh án: HSBA001</div>
            </div>
            <div className="action-buttons">
              <button className="action-button">
                <Edit size={16} />
              </button>
              <button className="action-button delete">
                <Trash size={16} />
              </button>
            </div>
          </div>

          <form>
            <div className="form-group">
              <label className="form-label">Mã bệnh nhân</label>
              <select className="form-select">
                <option>Chọn mã bệnh nhân</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mã bác sĩ</label>
              <select className="form-select">
                <option>Chọn mã bác sĩ</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ngày lập hóa đơn</label>
              <input 
                type="text" 
                className="form-input" 
                value="DateTime().Now()" 
                disabled 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tổng số tiền</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Nhập tổng số tiền" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select className="form-select">
                <option>Đã thanh toán</option>
                <option>Chưa thanh toán</option>
                <option>Đã hủy</option>
              </select>
            </div>
          </form>
          <div className="content-header">
            <h2></h2>
            <button className="add-btn" >Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;
/* InvoiceForm.css */
