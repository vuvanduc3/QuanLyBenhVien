import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDThuoc.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';

const CRUDTraCuuVaNhapHoaDonChiTiet = () => {




    return (
        <div className="container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <Menu1 />
            <main className="main-content">
                <Search1 />
                <div className="content">
                    <div className="card-header">
                        <h2 className="card-title">Thêm hóa đơn chi tiết</h2>
                    </div>



                    <form onSubmit="" className="medicine-form">
                        <label>Mã hóa đơn chi tiết: <span className="required">001</span></label>
                        <label>Mã hóa đơn : <span className="required">002</span></label>
                        <label>Tên thuốc/dịch vụ: <span className="required">001</span></label>
                        <label>Số lượng: <span className="required">10</span></label>
                        <div className="form-group">
                            <label>Giá: <span className="required">*</span></label>
                            <input
                                type="text"
                                name="gia"
                                placeholder="Nhập giá thuốc"
                                className="form-control"
                                required
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Thành tiền: <span className="required">100.000 VND</span></label>
                        </div>



                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-button" >
                             Nhập dữ liệu
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CRUDTraCuuVaNhapHoaDonChiTiet;