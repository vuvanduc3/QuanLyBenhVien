// App.js
import React from 'react';
import {
    Search, Bell, LogOut, Settings, Calendar, FileText,
    Users, CreditCard, PieChart, Activity, Database,
    FilePlus, Bookmark, Clock, ChevronLeft, ChevronRight,
    Filter, Edit, Trash2
} from 'lucide-react';
import '../Styles/CRUDThuoc.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';


   

const ThemSuaXoaThuoc = () => {
    const [formData, setFormData] = React.useState({
        code: '',
        name: '',
        description: '',
        quantity: '',
        price: '',
        phone: ''
      });
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
      };
    return (
        <div className="container">

            <Menu1 />

            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Thêm sửa xóa thuốc</h2>
                    
                    </div>
                    <form onSubmit={handleSubmit} className="medicine-form">
                        <div className="form-group">
                            <label>Mã thuốc</label>
                            <select
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="">Tự động tăng</option>
                                <option value="M001">M001</option>
                                <option value="M002">M002</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tên thuốc</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nhập tên thuốc"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mô tả</label>
                            <input
                                type="text"
                                name="description"
                                placeholder="Mô tả"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Số lượng</label>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Nhập số lượng"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Giá thuốc</label>
                            <input
                                type="number"
                                name="price"
                                placeholder="Nhập giá"
                                value={formData.price}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Nhập số điện thoại"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="add-button">
                                Save
                            </button>
                        </div>
                    </form>

                </div>
            </main>
        </div>
    );
};

export default ThemSuaXoaThuoc;