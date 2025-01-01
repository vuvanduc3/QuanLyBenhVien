// InvoiceForm.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import '../Styles/InvoiceForm.css';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const InvoiceForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    MaHoaDon: '',
    MaBenhNhan: '',
    MaBacSi: '',
    TongTien: '',
    TrangThai: 'Chưa thanh toán'
  });

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Fetch all invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      const data = await response.json();
      if (data.success) {
        setInvoices(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách hóa đơn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit for both add and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingInvoice) {
        // Update existing invoice
        const response = await fetch(`/api/invoices/${editingInvoice.MaHoaDon}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        
        if (data.success) {
          await fetchInvoices(); // Refresh list after update
          handleModalClose();
        } else {
          setError(data.message);
        }
      } else {
        // Add new invoice
        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        
        if (data.success) {
          await fetchInvoices(); // Refresh list after add
          handleModalClose();
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      setError('Lỗi khi lưu hóa đơn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment status update
  const handlePayment = async (invoiceId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ TrangThai: 'Đã thanh toán' })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchInvoices(); // Refresh list after payment
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi khi cập nhật trạng thái thanh toán');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData(invoice);
    } else {
      setEditingInvoice(null);
      setFormData({
        MaHoaDon: '',
        MaBenhNhan: '',
        MaBacSi: '',
        TongTien: '',
        TrangThai: 'Chưa thanh toán'
      });
    }
    setShowModal(true);
    setError(null); // Clear any previous errors
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setFormData({
      MaHoaDon: '',
      MaBenhNhan: '',
      MaBacSi: '',
      TongTien: '',
      TrangThai: 'Chưa thanh toán'
    });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="container">
      <Menu1 />
      <main className="main-content">
        <Search1 />
        <div className="content">
          <div className="content-header">
            <h2>Quản lý hóa đơn</h2>
            <button 
              className="add-btn" 
              onClick={() => handleModalOpen()}
              disabled={loading}
            >
              Thêm hóa đơn
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Mã bệnh nhân</th>
                  <th>Mã bác sĩ</th>
                  <th>Tổng tiền</th>
                  <th>Ngày nhập hóa đơn</th>
                  <th>Trạng thái</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.MaHoaDon}>
                    <td>{invoice.MaHoaDon}</td>
                    <td className="patient-id">{invoice.MaBenhNhan}</td>
                    <td>{invoice.MaBacSi}</td>
                    <td>{formatCurrency(invoice.TongTien)}</td>
                    <td>{formatDate(invoice.NgayNhapHoaDon)}</td>
                    <td className={invoice.TrangThai === 'Đã thanh toán' ? 'status-paid' : 'status-unpaid'}>
                      {invoice.TrangThai}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn" 
                          onClick={() => handleModalOpen(invoice)}
                          disabled={loading}
                        >
                          Sửa dữ liệu
                        </button>
                        {invoice.TrangThai !== 'Đã thanh toán' && (
                          <button 
                            className="action-btn" 
                            onClick={() => handlePayment(invoice.MaHoaDon)}
                            disabled={loading}
                          >
                            Thanh toán
                          </button>
                        )}
                        <button className="action-btn">Xuất hóa đơn</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>Trang 1 của 84</span>
            <div className="pagination-buttons">
              <button className="page-btn">
                <ChevronLeft size={20} />
              </button>
              <button className="page-btn">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3>{editingInvoice ? 'Sửa hóa đơn' : 'Thêm hóa đơn mới'}</h3>
                <button className="close-btn" onClick={handleModalClose}>
                  <X size={20} />
                </button>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={handleSubmit} className="modal-form">
                {!editingInvoice && (
                  <div className="form-group">
                    <label>Mã hóa đơn:</label>
                    <input
                      type="text"
                      name="MaHoaDon"
                      value={formData.MaHoaDon}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Mã bệnh nhân:</label>
                  <input
                    type="text"
                    name="MaBenhNhan"
                    value={formData.MaBenhNhan}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Mã bác sĩ:</label>
                  <input
                    type="text"
                    name="MaBacSi"
                    value={formData.MaBacSi}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Tổng tiền:</label>
                  <input
                    type="number"
                    name="TongTien"
                    value={formData.TongTien}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                {editingInvoice && (
                  <div className="form-group">
                    <label>Trạng thái:</label>
                    <select
                      name="TrangThai"
                      value={formData.TrangThai}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="Chưa thanh toán">Chưa thanh toán</option>
                      <option value="Đã thanh toán">Đã thanh toán</option>
                    </select>
                  </div>
                )}
                <div className="button-group">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {editingInvoice ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={handleModalClose}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceForm;