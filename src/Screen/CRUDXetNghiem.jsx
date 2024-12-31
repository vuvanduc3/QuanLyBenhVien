import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CRUDXetNghiem.css';
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
                        <h2 className="card-title">Thêm, sửa xét nghiệm</h2>
                    </div>
                    <form className="medicine-form">
                        <div className="form-group">
                            <label>
                                Mã bệnh nhân <span className="required">*</span>
                            </label>
                            <select
                                name="code"
                                className="form-control"
                                required
                                defaultValue="" /* Giá trị mặc định là rỗng */
                            >
                                <option value="" disabled>
                                    -- Chọn mã bệnh nhân --
                                </option>
                                <option value="HD001">HD001</option>
                                <option value="HD002">HD002</option>
                                <option value="HD003">HD003</option>
                            </select>
                        </div>


                            <div className="form-group">
                                <label>
                                    Mã bệnh nhân <span className="required">*</span>
                                 </label>
                                    <select
                                        name="code"
                                        className="form-control"
                                        required
                                       defaultValue="" /* Giá trị mặc định là rỗng */
                                                   >
                                                       <option value="" disabled>
                                                           -- Chọn mã bác sĩ --
                                                       </option>
                                                       <option value="HD001">HD001</option>
                                                       <option value="HD002">HD002</option>
                                                       <option value="HD003">HD003</option>
                                                   </select>
                                               </div>

                            <div className="form-group">
                                                       <label>Tên thử nghiệm <span className="required">*</span></label>
                                                       <input
                                                           type="text"
                                                           name="quantity"
                                                           placeholder="Nhập tên thử nghiệm"
                                                           className="form-control"
                                                           required
                                                           min="0"
                                                       />
                                                   </div>

                        <div className="form-group">
                            <label>Kết quả <span className="required">*</span></label>
                            <input
                                type="text"
                                name="quantity"
                                placeholder="Nhập kết quả"
                                className="form-control"
                                required
                                min="0"
                            />
                        </div>



                        <div className="form-group">
                            <label>Ngày <span className="required">*</span></label>
                            <input
                                type="text"
                                name="price"
                                placeholder="Nhập ngày"
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