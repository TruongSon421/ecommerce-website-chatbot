import React, { useState } from 'react';

// Define the type for policy keys
type PolicyKey = 'giao-hang' | 'bao-hanh' | 'doi-tra' | 'thanh-toan' | 'lien-he';

const PoliciesPage = () => {
  const [activeSection, setActiveSection] = useState<PolicyKey>('giao-hang');

  const policies: Record<PolicyKey, { title: string; content: string }> = {
    'giao-hang': {
      title: 'Chính sách giao hàng',
      content: `
        <h1>Chính sách giao hàng TechZone</h1>
        <p><em>*Áp dụng từ: 26/3/2021</em></p>
        
        <h2>1. PHẠM VI ÁP DỤNG</h2>
        <p>Những khu vực tỉnh thành có hệ thống siêu thị TechZone.</p>
        
        <h2>2. THỜI GIAN NHẬN HÀNG</h2>
        <p>TechZone nhận giao nhanh trong ngày với khoảng cách từ các siêu thị có hàng đến điểm giao là 20 km.</p>
        
        <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: center;">Gói dịch vụ</th>
            <th style="padding: 10px; text-align: center;">Khoảng cách</th>
            <th style="padding: 10px; text-align: center;">Thời gian hẹn giao</th>
          </tr>
          <tr>
            <td style="padding: 10px; text-align: center;">Giao siêu nhanh</td>
            <td style="padding: 10px; text-align: center;">0 - 20km</td>
            <td style="padding: 10px; text-align: center;">Từ 1 - 2 tiếng</td>
          </tr>
          <tr>
            <td style="padding: 10px; text-align: center;">Giao tiêu chuẩn</td>
            <td style="padding: 10px; text-align: center;">0 - 20km</td>
            <td style="padding: 10px; text-align: center;">Từ 6 tiếng</td>
          </tr>
          <tr>
            <td style="padding: 10px; text-align: center;"></td>
            <td style="padding: 10px; text-align: center;">Nội tỉnh - liên tỉnh</td>
            <td style="padding: 10px; text-align: center;">Từ 2 - 6 ngày</td>
          </tr>
        </table>
        
        <h2>3. PHÍ GIAO HÀNG</h2>
        <p><strong>Sản phẩm không lắp đặt:</strong></p>
        <ul>
          <li>Giỏ hàng từ 500.000đ: Miễn phí 10km đầu, 5.000đ/km tiếp theo</li>
          <li>Giỏ hàng dưới 500.000đ: 20.000đ cho 10km đầu, 5.000đ/km tiếp theo</li>
          <li>Giỏ hàng từ 2.000.000đ: Miễn phí hoàn toàn</li>
        </ul>
        
        <p><strong>Sản phẩm lắp đặt:</strong></p>
        <ul>
          <li>Giỏ hàng từ 5 triệu: Miễn phí 10km đầu, 5.000đ/km tiếp theo</li>
          <li>Giỏ hàng dưới 5 triệu: 50.000đ cho 10km đầu, 5.000đ/km tiếp theo</li>
        </ul>
      `
    },
    'bao-hanh': {
      title: 'Chính sách bảo hành',
      content: `
        <h1>Chính sách bảo hành TechZone</h1>
        <p><em>*Áp dụng từ: 01/01/2025</em></p>
        
        <h2>1. THỜI GIAN BẢO HÀNH</h2>
        <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px;">Loại sản phẩm</th>
            <th style="padding: 10px;">Thời gian bảo hành</th>
          </tr>
          <tr>
            <td style="padding: 10px;">Điện thoại di động</td>
            <td style="padding: 10px;">12 tháng</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Laptop, Máy tính bảng</td>
            <td style="padding: 10px;">12 tháng</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Tai nghe, Loa</td>
            <td style="padding: 10px;">6 tháng</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Phụ kiện</td>
            <td style="padding: 10px;">3 tháng</td>
          </tr>
        </table>
        
        <h2>2. ĐIỀU KIỆN BẢO HÀNH</h2>
        <ul>
          <li>Sản phẩm còn trong thời hạn bảo hành</li>
          <li>Có phiếu mua hàng hoặc hóa đơn VAT</li>
          <li>Tem bảo hành còn nguyên vẹn</li>
          <li>Lỗi do nhà sản xuất</li>
        </ul>
        
        <h2>3. QUY TRÌNH BẢO HÀNH</h2>
        <ol>
          <li>Mang sản phẩm và phiếu bảo hành đến cửa hàng</li>
          <li>Nhân viên kiểm tra và xác nhận lỗi</li>
          <li>Ước tính thời gian sửa chữa (3-7 ngày)</li>
          <li>Thông báo khi hoàn thành</li>
          <li>Khách hàng nhận máy và kiểm tra</li>
        </ol>
        
        <h2>4. KHÔNG BẢO HÀNH</h2>
        <ul>
          <li>Sản phẩm bị rơi, vỡ, biến dạng</li>
          <li>Sản phẩm bị cháy nổ do sử dụng sai cách</li>
          <li>Sản phẩm bị vào nước</li>
          <li>Sản phẩm bị tự ý sửa chữa</li>
        </ul>
      `
    },
    'doi-tra': {
      title: 'Chính sách đổi trả',
      content: `
        <h1>Chính sách đổi trả TechZone</h1>
        <p><em>*Cập nhật: 15/06/2025</em></p>
        
        <h2>1. THỜI GIAN ĐỔI TRẢ</h2>
        <ul>
          <li><strong>Đổi trả thông thường:</strong> 7 ngày kể từ ngày nhận hàng</li>
          <li><strong>Bảo hành đổi trả:</strong> 1 đổi 1 trong 30 ngày đầu tiên (nếu sản phẩm lỗi kỹ thuật)</li>
        </ul>
        
        <h2>2. ĐIỀU KIỆN ĐỔI TRẢ</h2>
        <ul>
          <li>Sản phẩm lỗi do nhà sản xuất</li>
          <li>Sản phẩm phải còn nguyên tem, hộp</li>
          <li>Không trầy xước hoặc hư hỏng do người dùng</li>
          <li>Có phiếu mua hàng hoặc hóa đơn VAT</li>
        </ul>
        
        <h2>3. CHÍNH SÁCH HOÀN TIỀN</h2>
        <ul>
          <li><strong>Hoàn tiền 100%</strong> nếu không giao đúng sản phẩm đã đặt</li>
          <li>Hoàn tiền trong vòng 3-7 ngày làm việc</li>
          <li>Hoàn về tài khoản thanh toán gốc</li>
        </ul>
        
        <h2>4. CHI PHÍ VẬN CHUYỂN</h2>
        <ul>
          <li><strong>Miễn phí</strong> nếu lỗi từ TechZone</li>
          <li><strong>Khách hàng chịu phí</strong> nếu đổi trả vì lý do cá nhân</li>
          <li>Phí vận chuyển: 30.000đ - 50.000đ tùy khu vực</li>
        </ul>
      `
    },
    'thanh-toan': {
      title: 'Phương thức thanh toán',
      content: `
        <h1>Phương thức thanh toán TechZone</h1>
        
        <h2>1. THANH TOÁN TRỰC TIẾP</h2>
        <ul>
          <li><strong>Tại cửa hàng:</strong> Tiền mặt, thẻ ATM, thẻ tín dụng</li>
          <li><strong>Khi nhận hàng (COD):</strong> Tiền mặt, POS di động</li>
        </ul>
        
        <h2>2. THANH TOÁN ONLINE</h2>
        <ul>
          <li>Chuyển khoản ngân hàng</li>
          <li>Ví điện tử: MoMo, ZaloPay, ViettelPay</li>
          <li>Thẻ tín dụng: Visa, MasterCard, JCB</li>
          <li>Internet Banking</li>
        </ul>
        
        <h2>3. THÔNG TIN CHUYỂN KHOẢN</h2>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p><strong>Ngân hàng Vietcombank:</strong></p>
          <p>STK: 1234567890<br>
          Chủ TK: CÔNG TY TNHH TECHZONE<br>
          Chi nhánh: TP. Hồ Chí Minh</p>
        </div>
        
        <h2>4. CHÍNH SÁCH HOÀN TIỀN</h2>
        <ul>
          <li>Hoàn tiền trong vòng 3-7 ngày làm việc</li>
          <li>Hoàn về tài khoản thanh toán gốc</li>
          <li>Không hoàn tiền mặt cho đơn hàng thanh toán online</li>
        </ul>
      `
    },
    'lien-he': {
      title: 'Thông tin liên hệ',
      content: `
        <h1>Thông tin liên hệ TechZone</h1>
        
        <h2>1. ĐỊA CHỈ CỬA HÀNG</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
            <h3 style="color: #007bff; margin-top: 0;">🏢 Trụ sở chính</h3>
            <p><strong>Địa chỉ:</strong> 123 Đường Công Nghệ<br>
            Phường 7, Quận 5<br>
            TP. Hồ Chí Minh, Việt Nam</p>
            <p><strong>Chức năng:</strong> Showroom, Bán hàng, Hỗ trợ khách hàng</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">📦 Kho hàng</h3>
            <p><strong>Địa chỉ:</strong> 45 Đường Sáng Tạo<br>
            Khu Công Nghệ Cao<br>
            TP. Thủ Đức, TP. Hồ Chí Minh</p>
            <p><strong>Chức năng:</strong> Kho bãi, Xuất hàng, Giao hàng</p>
          </div>
        </div>
        
        <h2>2. HOTLINE LIÊN HỆ</h2>
        <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 15px; text-align: left;">Dịch vụ</th>
            <th style="padding: 15px; text-align: left;">Số điện thoại</th>
            <th style="padding: 15px; text-align: left;">Giờ hoạt động</th>
          </tr>
          <tr>
            <td style="padding: 15px;"><strong>Hỗ trợ khách hàng</strong></td>
            <td style="padding: 15px; color: #007bff; font-weight: bold;">1900 1234</td>
            <td style="padding: 15px;">8:00 - 22:00 (T2-CN)</td>
          </tr>
          <tr>
            <td style="padding: 15px;"><strong>Khiếu nại</strong></td>
            <td style="padding: 15px; color: #dc3545; font-weight: bold;">0909 567 890</td>
            <td style="padding: 15px;">8:00 - 22:00 (T2-CN)</td>
          </tr>
        </table>
        
        <h2>3. LIÊN HỆ TRỰC TUYẾN</h2>
        <ul>
          <li><strong>📧 Email:</strong> support@techzone.vn</li>
          <li><strong>🌐 Website:</strong> www.techzone.vn (hoạt động 24/7)</li>
          <li><strong>💬 Live Chat:</strong> Có sẵn trên website (8:00 - 22:00)</li>
          <li><strong>📱 Facebook:</strong> facebook.com/techzone.vn</li>
        </ul>
        
        <h2>4. GIỜ HOẠT ĐỘNG</h2>
        <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 15px; text-align: left;">Dịch vụ</th>
            <th style="padding: 15px; text-align: left;">Thời gian</th>
          </tr>
          <tr>
            <td style="padding: 15px;"><strong>Website bán hàng</strong></td>
            <td style="padding: 15px;">24/7 (hoạt động liên tục)</td>
          </tr>
          <tr>
            <td style="padding: 15px;"><strong>Hotline hỗ trợ</strong></td>
            <td style="padding: 15px;">8:00 - 22:00 (Thứ Hai đến Chủ Nhật)</td>
          </tr>
          <tr>
            <td style="padding: 15px;"><strong>Showroom</strong></td>
            <td style="padding: 15px;">9:00 - 18:00 (Thứ Hai đến Thứ Bảy)</td>
          </tr>
        </table>
      `
    }
  };

  const sidebarItems: Array<{ id: PolicyKey; title: string; icon: string }> = [
    { id: 'giao-hang', title: 'Chính sách giao hàng', icon: '🚚' },
    { id: 'bao-hanh', title: 'Chính sách bảo hành', icon: '🛡️' },
    { id: 'doi-tra', title: 'Chính sách đổi trả', icon: '🔄' },
    { id: 'thanh-toan', title: 'Phương thức thanh toán', icon: '💳' },
    { id: 'lien-he', title: 'Thông tin liên hệ', icon: '📞' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="text-blue-600 text-2xl">📋</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chính sách & Quy định</h1>
              <p className="text-gray-600">Thông tin chi tiết về các chính sách và quy định của TechZone</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border sticky top-8">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Danh mục chính sách</h3>
              </div>
              <nav className="p-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center space-x-3 ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="flex-1">{item.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div 
                  className="prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: policies[activeSection]?.content || '' 
                  }}
                />
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-blue-600 text-2xl">📞</div>
                <h3 className="text-xl font-semibold text-gray-900">Cần hỗ trợ thêm?</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>Hotline:</strong> 1900 1234</p>
                  <p className="text-gray-700"><strong>Email:</strong> support@techzone.vn</p>
                  <p className="text-gray-700"><strong>Giờ hỗ trợ:</strong> 8:00 - 22:00 hàng ngày</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>Địa chỉ:</strong> 123 Đường Công Nghệ, P.7, Q.5, TP.HCM</p>
                  <p className="text-gray-700"><strong>Website:</strong> www.techzone.vn</p>
                </div>
              </div>
            </div>

            {/* Back to Top */}
            <div className="mt-8 text-center">
              <button 
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>↑</span>
                <span>Về đầu trang</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">TechZone</h4>
            <p className="text-gray-400">© 2025 TechZone - Cửa hàng Điện thoại, Laptop, Phụ kiện chính hãng</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;