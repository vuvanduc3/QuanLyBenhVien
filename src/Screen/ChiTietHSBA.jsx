import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Menu1 from '../components/Menu';
import Search1 from '../components/seach_user';
import '../Styles/ChiTietHSBA.css';

const MedicalRecordDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editedData, setEditedData] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const thonPhoList = [
        "Khu phố",
        "Thôn",
        "Ấp",
        "Xóm",
        "Bản",
        "Buôn",
        "Phum",
        "Sóc"
    ];

    const loaiDuongList = [
        "Đường",
        "Phố",
        "Quốc lộ",
        "Tỉnh lộ",
        "Hương lộ",
        "Đại lộ",
        "Tuyến"
    ];

    // Dữ liệu cho các dropdown
    const danTocList = [
        "Kinh", "Tày", "Thái", "Mường", "Khmer", "Hoa", "Nùng", "H'Mông", "Dao", "Gia Rai",
        "Ê Đê", "Ba Na", "Sán Chay", "Chăm", "Cơ Ho", "Xơ Đăng", "Sán Dìu", "Hrê", "Ra Glai",
        "Mnông", "Thổ", "Stiêng", "Khơ mú", "Bru - Vân Kiều", "Cơ Tu", "Giáy", "Tà Ôi", "Mạ",
        "Giẻ-Triêng", "Co", "Chơ Ro", "Xinh Mun", "Hà Nhì", "Chu Ru", "Lào", "La Chí", "Kháng",
        "Phù Lá", "La Hủ", "La Ha", "Pà Thẻn", "Lự", "Ngái", "Chứt", "Lô Lô", "Mảng", "Cơ Lao",
        "Bố Y", "Cống", "Si La", "Pu Péo", "Rơ Măm", "Brâu", "Ơ Đu"
    ];

    const hanhDongList = [
        "KhamMoi",
        "TaiKham",
        "CapCuu",
        "TheoDoi",
        "ChuyenVien",
        "NhapVien",
        "XuatVien",
        "DieuTriNgoaiTru"
    ];

    const trangThaiList = [
        "DangDieuTri",
        "DaKhoi",
        "DaXuatVien",
        "ChuyenVien",
        "TuVong"
    ];

    useEffect(() => {
        fetchRecordData();
        fetchProvinces();
    }, [id]);

    // Fetch tất cả tỉnh thành
    const fetchProvinces = async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await response.json();
            setProvinces(data);
        } catch (err) {
            console.error('Lỗi khi tải danh sách tỉnh thành:', err);
        }
    };

    // Fetch huyện dựa trên tỉnh đã chọn
    const fetchDistricts = async (provinceCode) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts);
            setWards([]); // Reset danh sách phường/xã
            setEditedData(prev => ({
                ...prev,
                huyen: '',
                xaPhuong: ''
            }));
        } catch (err) {
            console.error('Lỗi khi tải danh sách quận huyện:', err);
        }
    };

    // Fetch phường/xã dựa trên huyện đã chọn
    const fetchWards = async (districtCode) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await response.json();
            setWards(data.wards);
            setEditedData(prev => ({
                ...prev,
                xaPhuong: ''
            }));
        } catch (err) {
            console.error('Lỗi khi tải danh sách phường xã:', err);
        }
    };

    const fetchRecordData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/medical-records/${id}`);
            const data = await response.json();

            if (data.success) {
                setRecord(data.data);
                setEditedData({
                    hoVaTen: data.data.HoVaTen,
                    ngaySinh: new Date(data.data.NgaySinh).toISOString().split('T')[0],
                    tuoi: data.data.Tuoi,
                    gioiTinh: data.data.GioiTinh,
                    danToc: data.data.DanToc || '',
                    diaChiCuTru: data.data.DiaChiCuTru || '',
                    soNha: data.data.SoNha || '',
                    loaiDuong: data.data.LoaiDuong || '',
                    tenDuong: data.data.TenDuong || '',
                    loaiKhuDanCu: data.data.LoaiKhuDanCu || '',
                    tenKhuDanCu: data.data.TenKhuDanCu || '',
                    thonPho: data.data.ThonPho || '',
                    xaPhuong: data.data.XaPhuong || '',
                    huyen: data.data.Huyen || '',
                    tinhThanhPho: data.data.TinhThanhPho || '',
                    soTheBHYT: data.data.SoTheBHYT || '',
                    soCCCD_HoChieu: data.data.SoCCCD_HoChieu || '',
                    vaoVien: new Date(data.data.VaoVien).toISOString().split('T')[0],
                    raVien: data.data.RaVien ? new Date(data.data.RaVien).toISOString().split('T')[0] : '',
                    chanDoanVaoVien: data.data.ChanDoanVaoVien || '',
                    chanDoanRaVien: data.data.ChanDoanRaVien || '',
                    lyDoVaoVien: data.data.LyDoVaoVien || '',
                    tomTatBenhLy: data.data.TomTatBenhLy || '',
                    maLichHen: data.data.MaLichHen || '',
                    hanhDong: data.data.HanhDong || ''
                });
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Lỗi khi tải dữ liệu hồ sơ bệnh án');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        fetchRecordData();
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setEditedData(prev => {
            // Tạo object mới với tất cả giá trị cũ và giá trị mới cần update
            const updatedData = {
                ...prev,
                [name]: value
            };
            
            // Nếu trường thay đổi là ngày sinh thì tính tuổi
            if (name === "ngaySinh") {
                updatedData.tuoi = calculateAge(value);
            }
            
            return updatedData;
        });
    };
    
    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age > 0 ? age : 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/medical-records/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData)
            });

            const data = await response.json();

            if (data.success) {
                setRecord(data.data);
                setIsEditing(false);
                alert('Cập nhật thành công!');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Lỗi khi cập nhật hồ sơ');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    if (loading) return <div className="loading">Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!record) return <div className="not-found">Không tìm thấy hồ sơ</div>;

    return (
        <div className="container">
            <Menu1 />
            <main className="main-content">
                <Search1 />

                <div className="detail-content">
                    <div className="detail-header">
                        <div className="header-left">
                            <h2>Chi tiết hồ sơ bệnh án</h2>
                            <span className="record-id">#{record.MaBenhNhan}</span>
                        </div>
                        <div className="header-actions">
                            {!isEditing ? (
                                <>
                                    <button className="edit-button" onClick={handleEdit}>
                                        Chỉnh sửa
                                    </button>
                                    <button className="back-button" onClick={() => navigate('/hosobenhan')}>
                                        Quay lại
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="save-button" onClick={handleSubmit}>
                                        Lưu thay đổi
                                    </button>
                                    <button className="cancel-button" onClick={handleCancel}>
                                        Hủy
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="detail-card">
                        {isEditing ? (
                            <form className="edit-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Họ và tên</label>
                                        <input
                                            name="hoVaTen"
                                            value={editedData.hoVaTen}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày sinh</label>
                                        <input
                                            type="date"
                                            name="ngaySinh"
                                            value={editedData.ngaySinh}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Tuổi</label>
                                        <input
                                            type="number"
                                            name="tuoi"
                                            value={editedData.tuoi}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Giới tính</label>
                                        <select
                                            name="gioiTinh"
                                            value={editedData.gioiTinh}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Dân tộc</label>
                                        <select
                                            name="danToc"
                                            value={editedData.danToc}
                                            onChange={handleChange}
                                            className="form-select"
                                        >
                                            <option value="">Chọn dân tộc</option>
                                            {danTocList.map(danToc => (
                                                <option key={danToc} value={danToc}>
                                                    {danToc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Địa chỉ cư trú</label>
                                        <input
                                            name="diaChiCuTru"
                                            value={editedData.diaChiCuTru}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Thôn/Phố</label>
                                        <input
                                            name="thonPho"
                                            value={editedData.thonPho}
                                            onChange={handleChange}
                                        />
                                    </div>

                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Tỉnh/Thành phố</label>
                                        <select
                                            name="tinhThanhPho"
                                            value={editedData.tinhThanhPho}
                                            onChange={(e) => {
                                                handleChange(e);
                                                if (e.target.value) {
                                                    const province = provinces.find(p => p.name === e.target.value);
                                                    if (province) {
                                                        fetchDistricts(province.code);
                                                    }
                                                }
                                            }}
                                            className="form-select"
                                        >
                                            <option value="">Chọn Tỉnh/Thành phố</option>
                                            {provinces.map(province => (
                                                <option key={province.code} value={province.name}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Quận/Huyện</label>
                                        <select
                                            name="huyen"
                                            value={editedData.huyen}
                                            onChange={(e) => {
                                                handleChange(e);
                                                if (e.target.value) {
                                                    const district = districts.find(d => d.name === e.target.value);
                                                    if (district) {
                                                        fetchWards(district.code);
                                                    }
                                                }
                                            }}
                                            className="form-select"
                                            disabled={!editedData.tinhThanhPho}
                                        >
                                            <option value="">Chọn Quận/Huyện</option>
                                            {districts.map(district => (
                                                <option key={district.code} value={district.name}>
                                                    {district.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                    <div className="form-group">
                                        <label htmlFor="xaPhuong">Phường/Xã</label>
                                        <select
                                            id="xaPhuong"
                                            name="xaPhuong"
                                            value={editedData.xaPhuong}
                                            onChange={handleChange}
                                            disabled={!editedData.huyen }
                                        >
                                            <option value="">Chọn phường/xã</option>
                                            {wards.map(district => (
                                                <option key={district.code} value={district.name}>
                                                    {district.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                   
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Số thẻ BHYT</label>
                                            <input
                                                name="soTheBHYT"
                                                value={editedData.soTheBHYT}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số CCCD/Hộ chiếu</label>
                                            <input
                                                name="soCCCD_HoChieu"
                                                value={editedData.soCCCD_HoChieu}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Ngày vào viện</label>
                                            <input
                                                type="date"
                                                name="vaoVien"
                                                value={editedData.vaoVien}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Ngày ra viện</label>
                                            <input
                                                type="date"
                                                name="raVien"
                                                value={editedData.raVien}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Chẩn đoán vào viện</label>
                                        <textarea
                                            name="chanDoanVaoVien"
                                            value={editedData.chanDoanVaoVien}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Chẩn đoán ra viện</label>
                                        <textarea
                                            name="chanDoanRaVien"
                                            value={editedData.chanDoanRaVien}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Trạng thái</label>
                                            <select
                                                name="trangThai"
                                                value={editedData.trangThai}
                                                onChange={handleChange}
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Chọn trạng thái</option>
                                                {trangThaiList.map(trangThai => {
                                                    let displayText = '';
                                                    switch (trangThai) {
                                                        case 'DangDieuTri': displayText = 'Đang điều trị'; break;
                                                        case 'DaKhoi': displayText = 'Đã khỏi'; break;
                                                        case 'DaXuatVien': displayText = 'Đã xuất viện'; break;
                                                        case 'ChuyenVien': displayText = 'Chuyển viện'; break;
                                                        case 'TuVong': displayText = 'Tử vong'; break;
                                                        default: displayText = trangThai;
                                                    }
                                                    return (
                                                        <option key={trangThai} value={trangThai}>
                                                            {displayText}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Lý do vào viện</label>
                                        <textarea
                                            name="lyDoVaoVien"
                                            value={editedData.lyDoVaoVien}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Tóm tắt bệnh lý</label>
                                        <textarea
                                            name="tomTatBenhLy"
                                            value={editedData.tomTatBenhLy}
                                            onChange={handleChange}
                                            rows="4"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Mã lịch hẹn</label>
                                            <input
                                                name="maLichHen"
                                                value={editedData.maLichHen}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Hành động</label>
                                            <select
                                                name="hanhDong"
                                                value={editedData.hanhDong}
                                                onChange={handleChange}
                                                className="form-select"
                                            >
                                                <option value="">Chọn hành động</option>
                                                {hanhDongList.map(hanhDong => {
                                                    let displayText = '';
                                                    switch (hanhDong) {
                                                        case 'KhamMoi': displayText = 'Khám mới'; break;
                                                        case 'TaiKham': displayText = 'Tái khám'; break;
                                                        case 'CapCuu': displayText = 'Cấp cứu'; break;
                                                        case 'TheoDoi': displayText = 'Theo dõi'; break;
                                                        case 'ChuyenVien': displayText = 'Chuyển viện'; break;
                                                        case 'NhapVien': displayText = 'Nhập viện'; break;
                                                        case 'XuatVien': displayText = 'Xuất viện'; break;
                                                        case 'DieuTriNgoaiTru': displayText = 'Điều trị ngoại trú'; break;
                                                        default: displayText = hanhDong;
                                                    }
                                                    return (
                                                        <option key={hanhDong} value={hanhDong}>
                                                            {displayText}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                            </form>
                        ) : (
                            <div className="detail-info">
                                <div className="info-section">
                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Họ và tên</label>
                                            <p>{record.HoVaTen}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Ngày sinh</label>
                                            <p>{formatDate(record.NgaySinh)}</p>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Tuổi</label>
                                            <p>{record.Tuoi}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Giới tính</label>
                                            <p>{record.GioiTinh}</p>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Dân tộc</label>
                                            <p>{record.DanToc || '---'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Địa chỉ cư trú</label>
                                            <p>{record.DiaChiCuTru || '---'}</p>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Thôn/Phố</label>
                                            <p>{record.ThonPho || '---'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Xã/Phường</label>
                                            <p>{record.XaPhuong || '---'}</p>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Huyện</label>
                                            <p>{record.Huyen || '---'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Tỉnh/Thành phố</label>
                                            <p>{record.TinhThanhPho || '---'}</p>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Số thẻ BHYT</label>
                                            <p>{record.SoTheBHYT || '---'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Số CCCD/Hộ chiếu</label>
                                            <p>{record.SoCCCD_HoChieu || '---'}</p>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Ngày vào viện</label>
                                            <p>{formatDate(record.VaoVien)}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Ngày ra viện</label>
                                            <p>{record.RaVien ? formatDate(record.RaVien) : '---'}</p>
                                        </div>
                                    </div>

                                    <div className="info-group full-width">
                                        <label>Chẩn đoán vào viện</label>
                                        <p className="diagnosis">{record.ChanDoanVaoVien || '---'}</p>
                                    </div>

                                    <div className="info-group full-width">
                                        <label>Chẩn đoán ra viện</label>
                                        <p className="diagnosis">{record.ChanDoanRaVien || '---'}</p>
                                    </div>

                                    <div className="info-group full-width">
                                        <label>Lý do vào viện</label>
                                        <p className="reason">{record.LyDoVaoVien || '---'}</p>
                                    </div>

                                    <div className="info-group full-width">
                                        <label>Tóm tắt bệnh lý</label>
                                        <p className="summary">{record.TomTatBenhLy || '---'}</p>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-group">
                                            <label>Mã lịch hẹn</label>
                                            <p>{record.MaLichHen || '---'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Hành động</label>
                                            <p className="action-tag">{record.HanhDong || '---'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MedicalRecordDetail;