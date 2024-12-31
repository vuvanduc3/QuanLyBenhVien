import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDDonThuoc.css';
import Search1 from '../components/seach_user';
import Menu1 from '../components/Menu';

const ThemSuaXoaXetNghiem = () => {

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
                        <h2 className="card-title">Thêm, sửa đơn thuốc  </h2>
                    </div>
                    <form className="medicine-form">
                         <div className="form-group">
                                                    <label>Mã đơn thuốc <span className="required">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="quantity"
                                                        placeholder="Nhập mã đơn thuốc"
                                                        className="form-control"
                                                        required
                                                        min="0"
                                                    />
                                                </div>


                            <div className="form-group">
                                <label>
                                    Mã thuốc <span className="required">*</span>
                                 </label>
                                    <select
                                        name="code"
                                        className="form-control"
                                        required
                                       defaultValue="" /* Giá trị mặc định là rỗng */
                                                   >
                                                       <option value="" disabled>
                                                           -- Chọn mã thuốc --
                                                       </option>
                                                       <option value="HD001">HD001</option>
                                                       <option value="HD002">HD002</option>
                                                       <option value="HD003">HD003</option>
                                                   </select>
                                               </div>

                            <div className="form-group">
                                                       <label>Tên thuốc <span className="required">*</span></label>
                                                       <input
                                                           type="text"
                                                           name="quantity"
                                                           placeholder="Nhập tên thuốc"
                                                           className="form-control"
                                                           required
                                                           min="0"
                                                       />
                                                   </div>

                        <div className="form-group">
                            <label>Mô tả <span className="required">*</span></label>
                            <input
                                type="text"
                                name="quantity"
                                placeholder="Nhập mô tả"
                                className="form-control"
                                required
                                min="0"
                            />
                        </div>



                        <div className="form-group">
                            <label>Điện thoại cung cấp thuốc <span className="required">*</span></label>
                            <input
                                type="text"
                                name="price"
                                placeholder="Nhập điện thoại cung cấp thuốc"
                                className="form-control"
                                required
                                min="0"
                            />
                        </div>
                         <div className="form-group">
                                                    <label>Số lượng đơn thuốc <span className="required">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="price"
                                                        placeholder="Nhập số lượng đơn thuốc"
                                                        className="form-control"
                                                        required
                                                        min="0"
                                                    />
                                                </div>
                          <div className="form-group">
                                                     <label>Hướng dẫn sử dụng<span className="required">*</span></label>
                                                     <input
                                                         type="text"
                                                         name="price"
                                                         placeholder="Nhập hướng dẫn sử dụng"
                                                         className="form-control"
                                                         required
                                                         min="0"
                                                     />
                                                 </div>



                        <div className="form-actions">

                            <button
                                type="submit"
                                className="add-button">
                                 {'Lưu dữ liệu'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ThemSuaXoaXetNghiem;