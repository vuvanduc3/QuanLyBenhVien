import Menu1 from "../components/Menu";
import Search1 from "../components/seach_user";
import React, { useState, useEffect } from "react";
import "../Styles/EditPayment.css";
import { useParams } from "react-router-dom";

const EditPayment = () => {
  const { paymentId } = useParams();
  const [paymentData, setPaymentData] = useState({});
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

  const bankCode = "vietcombank";
  const accountNumber = "1024753410";
  const template = "compact2";
  const [totalPrice, setTotalPrice] = useState(0);
  const accountName = "HO%20QUANG%20TRUONG";
  const [qrGenerated, setQrGenerated] = useState(false); // State quản lý việc tạo mã QR
  const [qrUrl, setQrUrl] = useState(""); // Lưu URL mã QR

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
            phuongThucThanhToan: payment.paymentMethod || "",
            maGiaoDich: payment.transactionId || "",
            trangThaiThanhToan: payment.status || "",
            cccdCmnd: payment.cccd || "",
            soTienThanhToan: payment.amount || "",
            ngayThanhToan: payment.paymentDate
              ? formatDate(payment.paymentDate)
              : "",
            maBaoHiem: "",
            maBaoHiemChiTra: "",
            soTienBaoHiemChiTra: "",
          });
        } else {
          console.error("Invalid data format:", data);
        }
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
    setTotalPrice(formData.soTienThanhToan);
  }, [paymentId, formData.soTienThanhToan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Cập nhật giá trị của input tương ứng
    }));
  };

  const handleGenerateQRCode = () => {
    const generatedQrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.jpg?amount=${totalPrice}&addInfo=${paymentId}&accountName=${accountName}`;
    setQrUrl(generatedQrUrl);
    setQrGenerated(true); // Đánh dấu rằng mã QR đã được tạo
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

  return (
    <div className="container">
      <Menu1 />
      <div className="main-content">
        <Search1 />
        <div>
          <h2>Thanh toán</h2>
          <div>
            <div style={{ flexDirection: "row" }}>
              <label>Mã bệnh nhân:</label>
              <span style={{ marginLeft: "10px" }}>
                {paymentData.patientId}
              </span>
            </div>
            <div>
              <label>Mã hóa đơn:</label>
              <span style={{ marginLeft: "10px" }}>
                {paymentData.invoiceId}
              </span>
            </div>
            <div>
              <label>Ngày tạo:</label>
              <span style={{ marginLeft: "10px" }}>
                {paymentData.paymentCreateDate}
              </span>
            </div>
            <div className="EditPayment_paymentInfo">
              <div className="EditPayment_paymentRowInput">
                <div className="EditPayment_paymentColInput">
                  <label>Phương thức thanh toán:</label>
                  <select
                    name="phuongThucThanhToan"
                    value={formData.phuongThucThanhToan}
                    onChange={handleChange}
                    disabled={paymentData?.status === 1}
                  >
                    <option value="">Chọn phương thức</option>
                    <option value="1">Tiền mặt</option>
                    <option value="0">QR</option>
                  </select>
                </div>
                <div className="EditPayment_paymentColInput">
                  <label>
                    {paymentData.status === 1
                      ? "Số tiền đã thanh toán:"
                      : "Số tiền cần thanh toán:"}
                  </label>
                  <input
                    placeholder="Nhập số tiền thanh toán"
                    type="number"
                    name="soTienThanhToan"
                    value={formData.soTienThanhToan}
                    onChange={handleChange}
                    disabled={true}
                  />
                </div>
              </div>

              {formData.phuongThucThanhToan === "0" && (
                <>
                  <div style={{flexDirection: 'row'}}>
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
                  <label>Mã giao dịch:</label>
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
                  <label>Ngày thanh toán:</label>
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
                  <label>Trạng thái thanh toán:</label>
                  <select
                    name="trangThaiThanhToan"
                    value={formData.trangThaiThanhToan}
                    onChange={handleChange}
                    disabled={paymentData?.status === 1}
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="1">Hoàn thành</option>
                    <option value="2">Đang chờ xử lý</option>
                    <option value="0">Không thành công</option>
                  </select>
                </div>

                <div className="EditPayment_paymentColInput">
                  <label>CCCD/CMND:</label>
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
                <label>Mã bảo hiểm:</label>
                <input
                  type="text"
                  name="maBaoHiem"
                  value={formData.maBaoHiem}
                  onChange={handleChange}
                />
              </div>
              <div className="EditPayment_paymentColInput">
                <label>Mã chi phí bảo hiểm chi trả:</label>
                <input
                  type="text"
                  name="maBaoHiemChiTra"
                  value={formData.maBaoHiemChiTra}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="EditPayment_paymentRowInput">
              <div className="EditPayment_paymentColInput">
                <label>Số tiền bảo hiểm chi trả:</label>
                <input
                  type="number"
                  name="soTienBaoHiemChiTra"
                  value={formData.soTienBaoHiemChiTra}
                  onChange={handleChange}
                />
              </div>
              <div className="EditPayment_paymentColInput">
                <label>Ngày thanh toán:</label>
                <input
                  placeholder="Ngày thanh toán"
                  type="text"
                  name="ngayThanhToan"
                  onChange={handleChange}
                />
              </div>
            </div>
            <button className="EditPayment_paymentSubmit" type="button">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPayment;
