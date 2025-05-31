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
              <li><a href="/iphone">iPhone</a></li>
              <li><a href="/mac">Mac</a></li>
              <li><a href="/ipad">iPad</a></li>
              <li><a href="/watch">Watch</a></li>
              <li><a href="/airpods">AirPods</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3>Thông tin</h3>
            <ul>
              <li><a href="/about">Giới thiệu</a></li>
              <li><a href="/stores">Hệ thống cửa hàng</a></li>
              <li><a href="/warranty">Chính sách bảo hành</a></li>
              <li><a href="/terms">Điều khoản sử dụng</a></li>
              <li><a href="/privacy">Chính sách bảo mật</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3>Liên hệ</h3>
            <ul>
              <li>Tổng đài: 1900 6999</li>
              <li>Email: support@topzone.vn</li>
              <li>
                <div className="social-links">
                  <a href="https://facebook.com/topzone" className="social-icon">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://instagram.com/topzone" className="social-icon">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://youtube.com/topzone" className="social-icon">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3>Đăng ký nhận tin</h3>
            <p>Nhận thông tin sản phẩm mới nhất, tin khuyến mãi và nhiều hơn nữa.</p>
            <form className="subscribe-form">
              <input type="email" placeholder="Email của bạn" required />
              <button type="submit">Đăng ký</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2025 Nexus - Cửa hàng Điện thoại, Laptop, Phụ kiện chính hãng. Tất cả quyền được bảo lưu.</p>
          <div className="payment-methods">
            <img src="/images/payment/visa.png" alt="Visa" />
            <img src="/images/payment/mastercard.png" alt="Mastercard" />
            <img src="/images/payment/jcb.png" alt="JCB" />
            <img src="/images/payment/momo.png" alt="MoMo" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;