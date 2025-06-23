import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import { useCartStore } from '../store/cartStore';
import { checkout, getPaymentUrl, checkPaymentStatus } from '../services/cartService';
import { getProvinces, getDistricts, getWards } from '../services/addressService';
import { CartItem, CartItemIdentity, CheckoutPayload, Province, District, Ward } from '../types/cart';
import ENV from '../config/env';
import { shouldShowColor } from '../utils/colorUtils';

// Thêm types cho address
interface UserAddress {
  id: number;
  province: string;
  district: string;
  ward: string;
  street: string;
  addressType: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean | null;
  addresses: UserAddress[];
}

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, selectedItems } = useCartStore();
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>(() => {
    // Ưu tiên selectedItems từ CartPage (flow hiện tại)
    if (location.state?.selectedItems) {
      return location.state.selectedItems;
    }
    
    // Kiểm tra selectedItemKeys từ "Mua ngay" hoặc chatbot
    if (location.state?.selectedItemKeys && (location.state?.fromBuyNow || location.state?.fromChatbot)) {
      const selectedKeys = location.state.selectedItemKeys as string[];
      const itemsToCheckout = items.filter((item) => 
        selectedKeys.includes(`${item.productId}-${item.color}`)
      );
      if (itemsToCheckout.length > 0) {
        return itemsToCheckout;
      }
    }
    

    
    return [];
  });
  console.log(checkoutItems);
  // Thêm state cho address management
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [addressMode, setAddressMode] = useState<'select' | 'new'>('select');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    province: '' as string | number,
    district: '' as string | number,
    ward: '' as string | number,
    paymentMethod: 'TRANSFER_BANKING' as 'TRANSFER_BANKING' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'COD' ,
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasRedirectedToPayment, setHasRedirectedToPayment] = useState(false);

  // Fetch user profile với addresses
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`${ENV.API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`, // Adjust based on your auth implementation
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          
          // Set default address if available
          const defaultAddress = profile.addresses.find((addr: UserAddress) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setForm(prev => ({
              ...prev,
              fullName: defaultAddress.receiverName,
              phone: defaultAddress.receiverPhone,
            }));
          } else if (profile.addresses.length > 0) {
            // If no default, select first address
            const firstAddress = profile.addresses[0];
            setSelectedAddressId(firstAddress.id);
            setForm(prev => ({
              ...prev,
              fullName: firstAddress.receiverName,
              phone: firstAddress.receiverPhone,
            }));
          } else {
            // No saved addresses, switch to new address mode
            setAddressMode('new');
            setForm(prev => ({
              ...prev,
              fullName: `${profile.firstName} ${profile.lastName}`,
              phone: profile.phoneNumber,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to new address mode
        setAddressMode('new');
      }
    };
    
    fetchUserProfile();
  }, [user]);

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



  // Reset payment redirect state when returning to checkout
  useEffect(() => {
    setHasRedirectedToPayment(false);
  }, []);

  // Dự phòng selectedItems từ cartStore hoặc selectedItemKeys từ "mua ngay"/chatbot
  useEffect(() => {
    if (checkoutItems.length === 0) {
      // Kiểm tra selectedItemKeys từ "mua ngay" hoặc chatbot trước
      if (location.state?.selectedItemKeys && (location.state?.fromBuyNow || location.state?.fromChatbot)) {
        const selectedKeys = location.state.selectedItemKeys as string[];
        const source = location.state?.fromBuyNow ? 'buy now' : 'chatbot';
        console.log(`Loading items from ${source} selectedItemKeys:`, selectedKeys);
        const itemsFromSource = items.filter((item) => 
          selectedKeys.includes(`${item.productId}-${item.color}`)
        );
        if (itemsFromSource.length > 0) {
          setCheckoutItems(itemsFromSource);
          return;
        }
      }
      
      // Fallback về selectedItems từ cartStore
      if (selectedItems.length > 0) {
        console.log('Falling back to cartStore selectedItems');
        setCheckoutItems(items.filter((item) => selectedItems.includes(`${item.productId}-${item.color}`)));
      }
    }
    
    if (!user && checkoutItems.length === 0) {
      navigate('/login');
    }
  }, [checkoutItems, selectedItems, items, user, navigate, location.state]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressModeChange = (mode: 'select' | 'new') => {
    setAddressMode(mode);
    if (mode === 'select' && userProfile?.addresses.length) {
      // Reset to default or first address
      const defaultAddress = userProfile.addresses.find(addr => addr.isDefault) || userProfile.addresses[0];
      setSelectedAddressId(defaultAddress.id);
      setForm(prev => ({
        ...prev,
        fullName: defaultAddress.receiverName,
        phone: defaultAddress.receiverPhone,
        street: '',
        province: '',
        district: '',
        ward: '',
      }));
    } else if (mode === 'new') {
      setSelectedAddressId(null);
      setForm(prev => ({
        ...prev,
        fullName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : '',
        phone: userProfile?.phoneNumber || '',
        street: '',
        province: '',
        district: '',
        ward: '',
      }));
    }
  };

  const handleAddressSelection = (addressId: number) => {
    setSelectedAddressId(addressId);
    const selectedAddress = userProfile?.addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setForm(prev => ({
        ...prev,
        fullName: selectedAddress.receiverName,
        phone: selectedAddress.receiverPhone,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để thanh toán');
      navigate('/login');
      return;
    }

    let shippingAddress = '';
    let fullName = form.fullName;
    let phone = form.phone;

    if (addressMode === 'select' && selectedAddressId) {
      // Use selected saved address
      const selectedAddress = userProfile?.addresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        setError('Vui lòng chọn địa chỉ giao hàng');
        return;
      }
      shippingAddress = `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`;
      fullName = selectedAddress.receiverName;
      phone = selectedAddress.receiverPhone;
    } else {
      // Use new address
      if (!form.fullName || !form.phone || !form.street || !form.province || !form.district || !form.ward) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }
      
      // Tạo chuỗi địa chỉ
      const provinceName = provinces.find((p) => p.code === Number(form.province))?.name || '';
      const districtName = districts.find((d) => d.code === Number(form.district))?.name || '';
      const wardName = wards.find((w) => w.code === Number(form.ward))?.name || '';
      shippingAddress = `${form.street}, ${wardName}, ${districtName}, ${provinceName}`;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CheckoutPayload = {
        checkoutRequest: {
          userId: user.id,
          shippingAddress,
          paymentMethod: form.paymentMethod,
        },
        selectedItems: checkoutItems.map((item): CartItemIdentity => ({
          productId: item.productId,
          color: item.color,
        })),
      };
      
      const checkoutResponse = await checkout(payload);
      setTransactionId(checkoutResponse.transactionId);
      
      if (form.paymentMethod === 'COD') {
        setSuccess(true);
        setPaymentStatus('SUCCESS');
      } else {
        // For non-COD payments, start payment processing
        setIsProcessingPayment(true);
        await processPayment(checkoutResponse.transactionId);
      }
    } catch (err: any) {
      setError(err.message || 'Đặt hàng thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const processPayment = async (txnId: string) => {
    try {
      // Poll for payment status first
      const statusResponse = await checkPaymentStatus(txnId);
      
      if (!statusResponse.exists) {
        // Payment not yet created, continue polling
        setPaymentStatus('PENDING');
        startStatusPolling(txnId);
        return;
      }
      
      setPaymentStatus(statusResponse.status || 'PENDING');
      
      // Try to get payment URL if payment exists and is pending
      if (statusResponse.status === 'PENDING') {
        try {
          const urlResponse = await getPaymentUrl(txnId);
          setPaymentUrl(urlResponse.paymentUrl);
        } catch (urlError) {
          console.log('Could not get payment URL, will continue polling status');
        }
      }
      
      if (statusResponse.status === 'SUCCESS') {
        setSuccess(true);
        setIsProcessingPayment(false);
      } else if (statusResponse.status === 'FAILED' || statusResponse.status === 'EXPIRED') {
        setError('Thanh toán thất bại hoặc đã hết hạn');
        setIsProcessingPayment(false);
      } else {
        // Continue polling for status updates
        startStatusPolling(txnId);
      }
    } catch (err: any) {
      setError(err.message || 'Xử lý thanh toán thất bại');
      setIsProcessingPayment(false);
    }
  };

  const startStatusPolling = (txnId: string) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await checkPaymentStatus(txnId);
        
        if (!statusResponse.exists) {
          // Payment still not created, continue waiting
          return;
        }
        
        setPaymentStatus(statusResponse.status || 'PENDING');
        
        if (statusResponse.status === 'SUCCESS') {
          setSuccess(true);
          setIsProcessingPayment(false);
          clearInterval(interval);
        } else if (statusResponse.status === 'FAILED' || statusResponse.status === 'EXPIRED') {
          setError('Thanh toán thất bại hoặc đã hết hạn');
          setIsProcessingPayment(false);
          clearInterval(interval);
        }
        
        // Try to get payment URL if payment is pending and we don't have URL yet
        if (statusResponse.status === 'PENDING' && !paymentUrl) {
          try {
            const urlResponse = await getPaymentUrl(txnId);
            setPaymentUrl(urlResponse.paymentUrl);
          } catch (urlError) {
            console.log('Could not get payment URL');
          }
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'PENDING') {
        setError('Thanh toán đã hết thời gian chờ');
        setIsProcessingPayment(false);
      }
    }, 600000);
  };

  const handlePaymentRedirect = () => {
    if (paymentUrl && !hasRedirectedToPayment) {
      // Đánh dấu đã redirect để tránh bấm nhiều lần
      setHasRedirectedToPayment(true);
      
                    // Hiển thị xác nhận trước khi mở trang thanh toán
      const confirmed = window.confirm(
        '🔄 Tiếp tục thanh toán\n\n' +
        'Bạn sẽ được chuyển đến trang thanh toán VNPay.\n' +
        '⚠️ Lưu ý: Đây có thể là URL thanh toán đã được tạo trước đó.\n' +
        '✅ Vui lòng không đóng tab này và chỉ thanh toán một lần.'
      );
      
      if (confirmed) {
        window.open(paymentUrl, '_blank');
        
        // Reset lại trạng thái sau 30 giây để cho phép thử lại nếu cần
        setTimeout(() => {
          setHasRedirectedToPayment(false);
        }, 30000);
      } else {
        // Nếu người dùng cancel, reset lại trạng thái
        setHasRedirectedToPayment(false);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-6">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ sớm nhất.</p>
          {transactionId && (
            <p className="text-sm text-gray-500 mb-4">Mã giao dịch: {transactionId}</p>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (isProcessingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý thanh toán</h1>
          <p className="text-gray-600 mb-4">Vui lòng đợi trong khi chúng tôi xử lý thanh toán của bạn...</p>
          
          {paymentStatus && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Trạng thái: <span className="font-medium">{paymentStatus}</span>
              </p>
            </div>
          )}
          
          {paymentUrl && (
            <div className="mb-4">
              <button
                onClick={handlePaymentRedirect}
                disabled={hasRedirectedToPayment}
                className={`w-full px-6 py-3 rounded-lg transition-colors font-medium ${
                  hasRedirectedToPayment
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {hasRedirectedToPayment ? 'Đã mở trang thanh toán' : 'Tiến hành thanh toán'}
              </button>
              {hasRedirectedToPayment && (
                <p className="text-sm text-orange-600 mt-2 text-center">
                  ⚠️ Vui lòng hoàn tất thanh toán trong tab đã mở. Không tạo thêm giao dịch mới.
                </p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/cart')}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              🚫 Hủy thanh toán
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              🏠 Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán</h1>
          <p className="text-gray-600">Hoàn tất đặt hàng của bạn</p>
        </div>
        
        {checkoutItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-4">Không có sản phẩm nào để thanh toán</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sản phẩm đã chọn</h2>
              <div className="space-y-4 mb-6">
                {checkoutItems.map((item) => (
                  <div key={`${item.productId}-${item.color}`} className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      {shouldShowColor(item.color) && (
                        <p className="text-sm text-gray-600">Màu: {item.color}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">Số lượng: {item.quantity}</span>
                        <span className="font-semibold text-blue-600">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {checkoutItems
                      .reduce((sum, item) => sum + item.price * item.quantity, 0)
                      .toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>

            {/* Form thông tin */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin thanh toán</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Address Mode Selection */}
              {userProfile?.addresses && userProfile.addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Địa chỉ giao hàng</h3>
                  <div className="flex space-x-4 mb-4">
                    <button
                      type="button"
                      onClick={() => handleAddressModeChange('select')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        addressMode === 'select'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Chọn địa chỉ có sẵn
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddressModeChange('new')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        addressMode === 'new'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Tạo địa chỉ mới
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Address Selection */}
                {addressMode === 'select' && userProfile?.addresses && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Chọn địa chỉ giao hàng</label>
                    <div className="space-y-3">
                      {userProfile.addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleAddressSelection(address.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">{address.receiverName}</span>
                                <span className="text-sm text-gray-600">({address.receiverPhone})</span>
                                {address.isDefault && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {address.street}, {address.ward}, {address.district}, {address.province}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{address.addressType}</p>
                            </div>
                            <div className="ml-4">
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={selectedAddressId === address.id}
                                onChange={() => handleAddressSelection(address.id)}
                                className="w-4 h-4 text-blue-600"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personal Information (always shown) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={addressMode === 'select'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={addressMode === 'select'}
                  />
                </div>

                {/* New Address Form (only shown when creating new address) */}
                {addressMode === 'new' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
                      <select
                        name="province"
                        value={form.province}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                      <select
                        name="district"
                        value={form.district}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
                      <select
                        name="ward"
                        value={form.ward}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Đường/Địa chỉ chi tiết</label>
                      <input
                        type="text"
                        name="street"
                        value={form.street}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                    <option value="CREDIT_CARD">Thẻ tín dụng</option>
                    <option value="DEBIT_CARD">Thẻ ghi nợ</option>
                    <option value="TRANSFER_BANKING">Chuyển khoản ngân hàng</option>
                  </select>
                </div>
                
                {form.paymentMethod !== 'COD' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Thanh toán trực tuyến</p>
                        <p className="text-sm text-blue-600 mt-1">
                          Bạn sẽ được chuyển hướng đến trang thanh toán sau khi xác nhận đơn hàng.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || (addressMode === 'select' && !selectedAddressId)}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    'Đặt hàng'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;