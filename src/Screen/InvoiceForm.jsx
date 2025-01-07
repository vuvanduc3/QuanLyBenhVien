import React, { useState, useEffect } from 'react';
import { Bell, Search, ChevronLeft, ChevronRight, Settings, LogOut, Eye, Edit, CreditCard, Trash } from 'lucide-react';

import { useNavigate } from "react-router-dom";
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/invoices');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched data:', data); // For debugging
      if (data.success) {
        setInvoices(data.data);
        setTotalPages(Math.ceil(data.data.length / 10));
      } else {
        console.error('API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      alert('Không thể tải danh sách hóa đơn: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    console.log('Component mounted, fetching invoices...');
    fetchInvoices();
  }, []);

  // Log whenever invoices state changes
  useEffect(() => {
    console.log('Current invoices:', invoices);
  }, [invoices]);

  // Handle invoice deletion
  const handleDelete = async (invoiceId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này không?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchInvoices(); // Refresh the list
        } else {
          alert('Không thể xóa hóa đơn: ' + data.message);
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Đã xảy ra lỗi khi xóa hóa đơn');
      }
    }
  };

  // Handle invoice update
  const handleUpdate = async (invoiceId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();
      if (data.success) {
        setEditingInvoice(null);
        fetchInvoices(); // Refresh the list
      } else {
        alert('Không thể cập nhật hóa đơn: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Đã xảy ra lỗi khi cập nhật hóa đơn');
    }
  };

  // Handle payment status update
  const handlePayment = async (invoiceId) => {
    try {
      await handleUpdate(invoiceId, { TrangThai: 'Đã thanh toán' });
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Đã xảy ra lỗi khi cập nhật trạng thái thanh toán');
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(curr => curr + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(curr => curr - 1);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="container">
      <Menu1 />
      <main className="main-content">
        <Search1 />
        <div className="content">
          <div className="content-header">
            <h2>Quản lý hóa đơn</h2>
            <button className="add-btn" onClick={() => navigate("/addinvoice")}>
              Thêm hóa đơn
            </button>
          </div>

          <div className="table-container">
            {loading ? (
              <div className="text-center p-4">Đang tải...</div>
            ) : (
              <table className="w-full">
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
                            className="action-btn view"
                            onClick={() => navigate(`/invoices/${invoice.MaHoaDon}`)}
                          >
                            <Eye size={16} />
                            Xem chi tiết
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => setEditingInvoice(invoice)}
                          >
                            <Edit size={16} />
                            Sửa dữ liệu
                          </button>
                          <button
                            className="action-btn pay"
                            onClick={() => handlePayment(invoice.MaHoaDon)}
                            disabled={invoice.TrangThai === 'Đã thanh toán'}
                          >
                            <CreditCard size={16} />
                            Thanh toán
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(invoice.MaHoaDon)}
                          >
                            <Trash size={16} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pagination">
            <span>Trang {currentPage} của {totalPages}</span>
            <div className="pagination-buttons">
              <button
                className="page-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="page-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Invoice Modal */}
      {editingInvoice && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa hóa đơn</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdate(editingInvoice.MaHoaDon, {
                MaBenhNhan: formData.get('MaBenhNhan'),
                MaBacSi: formData.get('MaBacSi'),
                TongTien: parseFloat(formData.get('TongTien')),
                TrangThai: formData.get('TrangThai')
              });
            }}>
              <div className="form-group">
                <label>Mã bệnh nhân:</label>
                <input
                  name="MaBenhNhan"
                  defaultValue={editingInvoice.MaBenhNhan}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mã bác sĩ:</label>
                <input
                  name="MaBacSi"
                  defaultValue={editingInvoice.MaBacSi}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tổng tiền:</label>
                <input
                  name="TongTien"
                  type="number"
                  defaultValue={editingInvoice.TongTien}
                  required
                />
              </div>
              <div className="form-group">
                <label>Trạng thái:</label>
                <select name="TrangThai" defaultValue={editingInvoice.TrangThai}>
                  <option value="Chưa thanh toán">Chưa thanh toán</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-save">
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingInvoice(null)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;