import Menu1 from "../components/Menu";
import Search1 from "../components/seach_user";
import React, { useState, useEffect } from "react";
import "../Styles/EditPayment.css";
import { useParams,useLocation, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { ChevronLeft, Edit, Save, X } from 'lucide-react';



const AddPayment = () => {
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const [paymentData, setPaymentData] = useState({});

  const [MaBenhNhan, setMaBenhNhan] = useState('');
  const [MaHoaDon, setMaHoaDon] = useState('');

  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('vi-VN').format(today);

  const myCookieValue = Cookies.get('myCookie'); // Lấy giá trị cookie

  const location = useLocation();
  const { action, item } = location.state || {}; // Lấy action và item từ params


  const [formData, setFormData] = useState({
    phuongThucThanhToan: "1",
    maGiaoDich: "",
    trangThaiThanhToan: "",
    cccdCmnd: "",
    soTienThanhToan: "",
    ngayThanhToan: "",
    maBaoHiem: "",
    maBaoHiemChiTra: "",
    soTienBaoHiemChiTra: "",
  });

  useEffect(() => {
        if (action === 'add' && item) {

          setFormData({
              phuongThucThanhToan: "1",
              maGiaoDich: "N/A",
              trangThaiThanhToan: "1",
              cccdCmnd: item.SoCCCD_HoChieu || '',
              soTienThanhToan:item.TongTien || '0',
              ngayThanhToan:formattedDate || '',
              maBaoHiem: item.SoTheBHYT || '',
              maBaoHiemChiTra: item.MaHoaDon || "",
              soTienBaoHiemChiTra:  Math.floor(item.TongTien * 0.2) || '',
          })
        }
    }, [action, item]);
  console.log("formData",formData);

  const bankCode = "vietcombank";
  const accountNumber = "1024753410";
  const template = "compact2";
  const accountName = "HO%20QUANG%20TRUONG";
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [count, setCount] = useState(0);

  console.log(count,"count")

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleGenerateQRCode = () => {
    const generatedQrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.jpg?amount=${item.TongTien}&addInfo=${paymentId}&accountName=${accountName}`;
    setQrUrl(generatedQrUrl);
    setQrGenerated(true);
  };

  const formatDate = (isoString) => {
    if (isoString != null) {
      const [datePart, timePart] = isoString.split("T");
      const timeWithoutMilliseconds = timePart.split(".")[0];
      return `${datePart
        .split("-")
        .reverse()
        .join("/")} ${timeWithoutMilliseconds}`;
    } else {
      return "";
    }
  };

  const formatCurrency = (value) => {
    return value.toLocaleString("vi-VN");
  };

  const handleSavePayment = async () => {
    try {
      const paymentData = {
        id: item.MaHoaDon,
        invoiceId: formData.maBaoHiemChiTra,
        paymentMethod: formData.phuongThucThanhToan,
        patientId: item.MaBenhNhan,
        amount: formData.soTienThanhToan,
        transactionId: formData.maGiaoDich,
        status: parseInt(formData.trangThaiThanhToan, 10),
        cccd: formData.cccdCmnd,
      };

      const response = await fetch('http://localhost:5000/api/them-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message); // Hiển thị thông báo thành công
        // Tiếp tục gửi chi phí bảo hiểm nếu có
        if (formData.maBaoHiem && formData.soTienBaoHiemChiTra) {
          const insuranceData = {
            MaChiPhiBHYT: formData.maBaoHiemChiTra,
            MaSoTheBHYT: formData.maBaoHiem,
            SoTienBHYTChiTra: formData.soTienBaoHiemChiTra,
          };

          const insuranceResponse = await fetch('http://localhost:5000/api/addchiphibhyt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(insuranceData),
          });

          const insuranceResult = await insuranceResponse.json();
          if (insuranceResponse.ok) {
            alert(insuranceResult.message);
            const updateResponse2 = await fetch('http://localhost:5000/api/capnhaptinhtrangthanhtoan', {
                       method: 'PUT', // Sử dụng phương thức POST nếu cần
                       headers: {
                         'Content-Type': 'application/json',
                       },
                       body: JSON.stringify({ /* Tham số cần thiết cho API */ }),
                     });

                     const updateData2 = await updateResponse2.json();

                     if (!updateData2.success) {
                       console.error('Lỗi khi cập nhật tình trạng thanh toán');
                       return;
             }
          } else {
            throw new Error(insuranceResult.message);
          }
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Lỗi khi lưu thanh toán:', error); // Log chi tiết lỗi
      alert('Đã có lỗi xảy ra khi lưu thanh toán: ' + error.message); // Hiển thị lỗi chi tiết
    }
  };


  

  return (
    <div className="container">
      <Menu1 />
      <div className="main-content">

                <div
                className="form-container"
                style={{
                    borderRadius: "10px",
                    marginBottom: "10px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width:"100%" }}>
                    <button  style={{
                                marginTop: "-20px",
                                marginLeft: "30px",
                                padding: "10px 20px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                height: "50px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                    onClick={() => navigate(-1)}
                    >
                    <ChevronLeft />
                    </button>
                    <div>
                        <Search1 />
                    </div>
       \</div>
      <div className="form-container">

        <div>
          <h2 style={{ color: '#000' }}>Thanh toán</h2>
          <div>
            <div style={{ flexDirection: "row" }}>
              <label style={{ color: '#000' }} >Mã bệnh nhân: {item.MaBenhNhan}</label>
              <span style={{ marginLeft: "10px" }}>
                {paymentData.patientId}
              </span>
            </div>
            <div>
              <label style={{ color: '#000' }}>Mã hóa đơn: {item.MaHoaDon}</label>
              <span style={{ marginLeft: "10px" }}>
                {paymentData.invoiceId}
              </span>
            </div>
            <div>
              <label style={{ color: '#000' }}>Ngày tạo: {formattedDate}</label>
              <span style={{ marginLeft: "10px" }}>
                {paymentData.paymentCreateDate}
              </span>
            </div>
            <div className="EditPayment_paymentInfo">
              <div className="EditPayment_paymentRowInput">
                <div className="EditPayment_paymentColInput">
                  <label style={{ color: '#000' }}>Phương thức thanh toán:</label>
                  <select
                    name="phuongThucThanhToan"
                    value={formData.phuongThucThanhToan}
                    onChange={handleChange}
                    disabled={paymentData?.status === 1}
                  >
                    <option value="">Chọn phương thức</option>
                    <option value="1">Tiền mặt 1</option>
                    <option value="0">QR 0</option>
                  </select>
                </div>
                <div className="EditPayment_paymentColInput">
                  <label style={{ color: '#000' }}>
                    {paymentData.status === 1
                      ? "Số tiền đã thanh toán:"
                      : "Số tiền cần thanh toán:"}
                  </label>
                  <input
                    placeholder="Nhập số tiền thanh toán"
                    type="text"
                    name="soTienThanhToan"
                    value={formatCurrency(formData.soTienThanhToan)}
                    onChange={handleChange}
                    disabled={true}
                  />
                </div>
              </div>

              {formData.phuongThucThanhToan === "0" && (
                <>
                  <div style={{ flexDirection: "row" }}>
                    <button
                      className="action"
                      type="button"
                      onClick={handleGenerateQRCode}
                    >
                      Tạo mã QR
                    </button>
                    {qrGenerated && (
                      <div className="qrImage">
                        <img src={qrUrl} alt="QR Code" />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="EditPayment_paymentRowInput">
                <div className="EditPayment_paymentColInput">
                  <label style={{ color: '#000' }}>Mã giao dịch:</label>
                  <input
                    placeholder="Nhập mã giao dịch"
                    type="text"
                    name="maGiaoDich"
                    value={formData.maGiaoDich}
                    onChange={handleChange}
                    disabled={paymentData?.status === 1}
                  />
                </div>
                <div className="EditPayment_paymentColInput">
                  <label style={{ color: '#000' }}>Ngày thanh toán:</label>
                  <input
                    placeholder="Ngày thanh toán"
                    type="text"
                    name="ngayThanhToan"
                    value={formData.ngayThanhToan}
                    onChange={handleChange}
                    disabled={true}
                  />
                </div>
              </div>
              <div className="EditPayment_paymentRowInput">
                <div className="EditPayment_paymentColInput">
                  <label style={{ color: '#000' }}>Trạng thái thanh toán:</label>
                  <select
                    name="trangThaiThanhToan"
                    value={formData.trangThaiThanhToan}
                    onChange={handleChange}
                    disabled={paymentData?.status === 1}
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="1">Hoàn thành 1</option>
                    <option value="2">Đang chờ xử lý 2</option>
                    <option value="0">Không thành công 0</option>
                  </select>
                </div>

                <div className="EditPayment_paymentColInput">
                  <label style={{ color: '#000' }}>CCCD/CMND:</label>
                  <input
                    placeholder="Nhập CCCD/CMND"
                    disabled
                    type="text"
                    name="cccdCmnd"
                    value={formData.cccdCmnd}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <h4>Thông tin thêm (chi phí bảo hiểm chi trả) {item.SoTheBHYT?'':'( Không có thông tin thẻ bảo hiểm )'}</h4>
            <div className="EditPayment_paymentRowInput">
              <div className="EditPayment_paymentColInput">
                <label style={{ color: '#000' }}>Mã bảo hiểm:</label>
                <input
                  type="text"
                  name="maBaoHiem"
                  disabled
                  value={formData.maBaoHiem}
                  onChange={handleChange}
                />
              </div>
              <div className="EditPayment_paymentColInput">
                <label style={{ color: '#000' }}>Mã chi phí bảo hiểm chi trả:</label>
                <input
                  type="text"
                  disabled
                  name="maBaoHiemChiTra"
                  value={formData.maBaoHiemChiTra}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="EditPayment_paymentRowInput">
              <div className="EditPayment_paymentColInput">
                <label style={{ color: '#000' }}>Số tiền bảo hiểm chi trả:</label>
                <input
                  type="number"
                  disabled
                  name="soTienBaoHiemChiTra"
                  value={formData.soTienBaoHiemChiTra}
                  onChange={handleChange}
                />
              </div>
              <div className="EditPayment_paymentColInput">
                <label style={{ color: '#000' }}>Ngày thanh toán: {myCookieValue}</label>
                <input
                  placeholder="Ngày thanh toán"
                  type="text"
                  disabled
                  value={formattedDate}
                  name="ngayThanhToan"
                  onChange={handleChange}
                />
              </div>
            </div>
            <button
              className="EditPayment_paymentSubmit"
              type="button"
              onClick={handleSavePayment}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AddPayment;
