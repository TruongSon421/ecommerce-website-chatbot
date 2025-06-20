import React from 'react';
import '../../styles/footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-col">
            <h3>Sản phẩm</h3>
            <ul>
              <li><a href="/phone">Điện thoại</a></li>
              <li><a href="/laptop">Laptop</a></li>
              <li><a href="/audio/wireless_earphone">Tai nghe</a></li>
              <li><a href="/phukien/backup_charger">Sạc dự phòng</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3>Địa chỉ cửa hàng</h3>
            <ul>
              <li>
                <strong>Trụ sở chính:</strong><br/>
                123 Đường Công Nghệ<br/>
                Phường 7, Quận 5<br/>
                TP. Hồ Chí Minh
              </li>
              <li style={{ marginTop: '10px' }}>
                <strong>Kho hàng:</strong><br/>
                45 Đường Sáng Tạo<br/>
                Khu Công Nghệ Cao<br/>
                TP. Thủ Đức, TP. HCM
              </li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3>Liên hệ & Hỗ trợ</h3>
            <ul>
              <li><strong>Hotline:</strong> 1900 1234</li>
              <li><strong>Khiếu nại:</strong> 0909 567 890</li>
              <li><strong>Email:</strong> support@techzone.vn</li>
              <li><strong>Website:</strong> www.techzone.vn</li>
              <li style={{ marginTop: '10px' }}>
                <strong>Giờ hoạt động:</strong><br/>
                Hotline: 8:00 - 22:00<br/>
                Showroom: 9:00 - 18:00 (T2-T7)
              </li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3>Chính sách & Bảo hành</h3>
            <ul>
              <li><strong>Bảo hành:</strong></li>
              <li>• Điện thoại, Laptop: 12 tháng</li>
              <li>• Tai nghe, Loa: 6 tháng</li>
              <li>• Phụ kiện: 3 tháng</li>
              <li style={{ marginTop: '8px' }}><strong>Đổi trả:</strong></li>
              <li>• Đổi trả trong 7 ngày</li>
              <li>• Bảo hành 1 đổi 1 trong 30 ngày</li>
              <li style={{ marginTop: '8px' }}>
                <a href="/policies" style={{ color: '#007bff', textDecoration: 'none' }}>
                  → Xem tất cả chính sách & quy định
                </a>
              </li>
            </ul>
          </div>
        </div>

        
        
        <div className="footer-bottom">
          <p>© 2025 TechZone - Cửa hàng Điện thoại, Laptop, Phụ kiện chính hãng. Tất cả quyền được bảo lưu.</p>
          <div className="footer-info">
            <span>Giá sản phẩm được cập nhật liên tục trên website</span>
            <div className="payment-methods">
              <img src="/images/payment/visa.png" alt="Visa" />
              <img src="/images/payment/mastercard.png" alt="Mastercard" />
              <img src="/images/payment/jcb.png" alt="JCB" />
              <img src="/images/payment/momo.png" alt="MoMo" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;