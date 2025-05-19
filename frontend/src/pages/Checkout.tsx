import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '/home/kltn2025/ecommerce-website-chatbot/frontend/src/components/hooks/useAuth.tsx';
import { useCartStore } from '../store/cartStore';
import { checkout } from '../services/cartService';
import { getProvinces, getDistricts, getWards } from '/home/kltn2025/ecommerce-website-chatbot/frontend/src/services/addressService.ts';
import { CartItem, CheckoutPayload, Province, District, Ward } from '../types/cart';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, selectedItems } = useCartStore();
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>(
    location.state?.selectedItems || []
  );
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    province: '' as string | number,
    district: '' as string | number,
    ward: '' as string | number,
    paymentMethod: 'COD' as 'COD' | 'CREDIT_CARD' | 'BANK_TRANSFER',
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [countdown, setCountdown] = useState(600); // 10 phút
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Tải tỉnh/thành phố khi mount
  useEffect(() => {
    const fetchProvinces = async () => {
      const data = await getProvinces();
      setProvinces(data);
    };
    fetchProvinces();
  }, []);

  // Tải quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (form.province) {
      const fetchDistricts = async () => {
        const data = await getDistricts(Number(form.province));
        setDistricts(data);
        setForm((prev) => ({ ...prev, district: '', ward: '' }));
        setWards([]);
      };
      fetchDistricts();
    }
  }, [form.province]);

  // Tải phường/xã khi chọn quận
  useEffect(() => {
    if (form.district) {
      const fetchWards = async () => {
        const data = await getWards(Number(form.district));
        setWards(data);
        setForm((prev) => ({ ...prev, ward: '' }));
      };
      fetchWards();
    }
  }, [form.district]);

  // Dự phòng selectedItems từ cartStore
  useEffect(() => {
    if (checkoutItems.length === 0 && selectedItems.length > 0) {
      console.log('Falling back to cartStore selectedItems');
      setCheckoutItems(items.filter((item) => selectedItems.includes(item.productId)));
    }
    if (!user && checkoutItems.length === 0) {
      navigate('/login');
    }
  }, [checkoutItems, selectedItems, items, user, navigate]);

  // Bộ đếm ngược cho thanh toán không COD
  useEffect(() => {
    if (form.paymentMethod !== 'COD' && countdown > 0 && !success) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [form.paymentMethod, countdown, success]);

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để thanh toán');
      navigate('/login');
      return;
    }
    if (!form.fullName || !form.phone || !form.street || !form.province || !form.district || !form.ward) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    // Tạo chuỗi địa chỉ
    const provinceName = provinces.find((p) => p.code === Number(form.province))?.name || '';
    const districtName = districts.find((d) => d.code === Number(form.district))?.name || '';
    const wardName = wards.find((w) => w.code === Number(form.ward))?.name || '';
    const shippingAddress = `${form.street}, ${wardName}, ${districtName}, ${provinceName}`;

    try {
      const payload: CheckoutPayload = {
        checkoutRequest: {
          userId: user.id,
          shippingAddress,
          paymentMethod: form.paymentMethod,
          paymentState: form.paymentMethod === 'COD' ? 'SUCCESS' : 'PENDING',
        },
        selectedItems: checkoutItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
        })),
      };
      await checkout(payload);
      if (form.paymentMethod === 'COD') {
        setSuccess(true);
      } else {
        setTimeout(() => {
          setSuccess(true);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Đặt hàng thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Đặt hàng thành công</h1>
        <p>Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ sớm.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
      {checkoutItems.length === 0 ? (
        <p>Không có sản phẩm để thanh toán</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Danh sách sản phẩm */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Sản phẩm đã chọn</h2>
            {checkoutItems.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="p-4 border-b">
                <h3 className="font-semibold">{item.productName}</h3>
                <p>Màu: {item.color}</p>
                <p>Số lượng: {item.quantity}</p>
                <p>Giá: {(item.price * item.quantity).toLocaleString('vi-VN')} ₫</p>
              </div>
            ))}
            <p className="text-xl font-bold mt-4">
              Tổng giá: {checkoutItems
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toLocaleString('vi-VN')} ₫
            </p>
          </div>

          {/* Form thông tin */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Thông tin thanh toán</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Họ tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Tỉnh/Thành phố</label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium">Quận/Huyện</label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                  disabled={!form.province}
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium">Phường/Xã</label>
                <select
                  name="ward"
                  value={form.ward}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                  disabled={!form.district}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium">Đường/Địa chỉ chi tiết</label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Phương thức thanh toán</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="COD">Thanh toán khi nhận hàng</option>
                  <option value="CREDIT_CARD">Thẻ tín dụng</option>
                  <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                </select>
              </div>
              {form.paymentMethod !== 'COD' && (
                <div className="text-red-500">
                  Vui lòng hoàn tất thanh toán trong: {formatCountdown(countdown)}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || (form.paymentMethod !== 'COD' && countdown === 0)}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;