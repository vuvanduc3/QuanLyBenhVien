import Menu1 from "../components/Menu";
import Search1 from "../components/seach_user";
import React, { useState, useEffect } from "react";
import "../Styles/EditPayment.css";
import { useParams } from "react-router-dom";
import Cookies from 'js-cookie';

const EditPayment = () => {
  const { paymentId } = useParams();
  const [paymentData, setPaymentData] = useState({});
  const [NgayBHYTChiTra, setNgayBHYTChiTra] = useState('');

  const [formData, setFormData] = useState({
    phuongThucThanhToan: "",
    maGiaoDich: "",
    trangThaiThanhToan: "",
    cccdCmnd: "",
    soTienThanhToan: "",
    ngayThanhToan: "",
    maBaoHiem: "",
    maBaoHiemChiTra: "",
    soTienBaoHiemChiTra: "",
  });
  
  console.log("formData",formData);

  const bankCode = "vietcombank";
  const accountNumber = "1024753410";
  const template = "compact2";
  const accountName = "HO%20QUANG%20TRUONG";
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [count, setCount] = useState(0);
  const myCookieValue = Cookies.get('myCookie'); // Lấy giá trị cookie
  console.log(count,"count")

  useEffect(() => {
    let api = `http://localhost:5000/api/ChiTietThanhToan/${paymentId}`;
    fetch(api)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.data) {
          const payment = data.data;
          setPaymentData({
            paymentMethod: payment.paymentMethod || "",
            transactionId: payment.transactionId || "",
            status: payment.status || "",
            cccd: payment.cccd || "",
            amount: payment.amount || "",
            paymentDate: payment.paymentDate
              ? formatDate(payment.paymentDate)
              : "",
            patientId: payment.patientId || "",
            invoiceId: payment.invoiceId || "",
            paymentCreateDate: payment.paymentCreateDate
              ? formatDate(payment.paymentCreateDate)
              : "",
          });
          setFormData({
            phuongThucThanhToan: payment.paymentMethod !== undefined ? payment.paymentMethod : "",
            maGiaoDich: payment.transactionId || "",
            trangThaiThanhToan: payment.status !== undefined ? payment.status : "",
            cccdCmnd: payment.cccd || "",
            soTienThanhToan: payment.amount || "",
            ngayThanhToan: payment.paymentDate
              ? formatDate(payment.paymentDate)
              : "",
            maBaoHiem: "",
            maBaoHiemChiTra: "",
            soTienBaoHiemChiTra: "",
          });
          fetchChiPhiBHYT(paymentId);
        } else {
          console.error("Invalid data format:", data);
        }
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  }, [paymentId,count]);

  const fetchChiPhiBHYT = (maChiPhiBHYT) => {
    const api = `http://localhost:5000/api/ChiPhiBHYT/${maChiPhiBHYT}`;

    fetch(api)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.data) {
          setFormData((prevData) => ({
            ...prevData, // Giữ nguyên các giá trị cũ của formData
            maBaoHiem: data.data.MaSoTheBHYT || "", // Cập nhật maBaoHiem
            maBaoHiemChiTra: data.data.MaChiPhiBHYT || "", // Cập nhật maBaoHiemChiTra
            soTienBaoHiemChiTra: data.data.SoTienBHYTChiTra || "", // Cập nhật soTienBaoHiemChiTra
            // Cập nhật soTienBaoHiemChiTra
          }));
         setNgayBHYTChiTra(formatDate(data.data.NgayBHYTThanhToan));
        } else {
          console.error("Không tìm thấy dữ liệu chi phí BHYT");
        }
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API:", err);
      });
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleGenerateQRCode = () => {
    const generatedQrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.jpg?amount=${paymentData.amount}&addInfo=${paymentId}&accountName=${accountName}`;
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

  const handleSavePayment = () => {
    const updatedPaymentData = {
      paymentMethod: formData.phuongThucThanhToan,
      transactionId: formData.maGiaoDich,
      status: parseInt(formData.trangThaiThanhToan, 10),
      cccd: formData.cccdCmnd,
      paymentDate: formData.ngayThanhToan || null,
    };
  
    fetch(`http://localhost:5000/api/ChiTietThanhToan/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPaymentData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setCount(count + 1);
          alert('Cập nhật thông tin thanh toán thành công!');
          console.log('Payment information updated:', data);
        } else {
          alert('Cập nhật thất bại: ' + data.message);
          console.error('Error:', data.message);
        }
      })
      .catch((error) => {
        alert('Có lỗi xảy ra khi cập nhật thanh toán!');
        console.error('Error updating payment:', error);
      });
  };
  

  return (
    <div className="container">
      <Menu1 />
      <div className="main-content">
        <Search1 />
         <div className="form-container">
          <h2 style={{ color: '#000' }}>Thanh toán</h2>
          <div>
            <div style={{ flexDirection: "row" }}>
              <label style={{ color: '#000' }}>Mã bệnh nhân:</label>
              <span style={{ marginLeft: "10px",color: '#000' }}>
                {paymentData.patientId}
              </span>
            </div>
            <div>
              <label style={{ color: '#000' }}>Mã hóa đơn:</label>
              <span style={{ marginLeft: "10px",color: '#000' }}>
                {paymentData.invoiceId}
              </span>
            </div>
            <div>
              <label style={{ color: '#000' }}>Ngày tạo:</label>
              <span style={{ marginLeft: "10px",color: '#000' }}>
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
                      className="EditPayment_QRSubmit"
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
                    type="text"
                    name="cccdCmnd"
                    value={formData.cccdCmnd}
                    onChange={handleChange}
                    disabled={paymentData?.status === 1}
                  />
                </div>
              </div>
            </div>
            <h4>Thông tin thêm (chi phí bảo hiểm chi trả)</h4>
            <div className="EditPayment_paymentRowInput">
              <div className="EditPayment_paymentColInput">
                <label style={{ color: '#000' }}>Mã bảo hiểm:</label>
                <input
                  type="text"
                  disabled
                  name="maBaoHiem"
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

                  name="soTienBaoHiemChiTra"
                  value={formData.soTienBaoHiemChiTra}
                  onChange={handleChange}
                />
              </div>
              <div className="EditPayment_paymentColInput">
                <label style={{ color: '#000' }}>Ngày thanh toán:</label>
                <input
                  placeholder="Ngày thanh toán"
                  type="text"
                  disabled
                  value={NgayBHYTChiTra}
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
  );
};

export default EditPayment;
