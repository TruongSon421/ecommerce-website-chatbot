import React, { useState, useEffect, useRef } from 'react';

interface Product {
  productId: string;
  variant: string;
  orderNumber: number;
  productName: string;
  defaultOriginalPrice: number | null;
  defaultCurrentPrice: number | null;
}

interface GroupDto {
  groupId: number;
  orderNumber: number;
  image: string | null;
  type: string;
  groupName: string | null;
}

interface GroupProduct {
  products: Product[];
  groupDto: GroupDto;
}

interface Message {
  id: number;
  text?: string;
  sender: 'user' | 'bot';
  products?: GroupProduct[];
}

interface WebSocketMessage {
  message?: string;
  groupids?: number[];
  turn_complete?: boolean;
  interrupted?: boolean;
  error?: string;
  auth_required?: boolean;
  auth_request_id?: string;
  connection_status?: string;
  login_success?: boolean;
  session_transferred?: boolean;
}

const ProductList: React.FC<{ grouplist: GroupProduct[] }> = ({ grouplist }) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Product>>({});

  useEffect(() => {
    const initialSelected: Record<string, Product> = {};
    grouplist.forEach(group => {
      if (group.products.length > 0) {
        initialSelected[group.groupDto.groupId.toString()] = group.products[0];
      }
    });
    setSelectedVariants(initialSelected);
  }, [grouplist]);

  const handleVariantClick = (groupId: number, product: Product) => {
    setSelectedVariants(prev => ({
      ...prev,
      [groupId.toString()]: product
    }));
  };

  return (
    <div className="space-y-4">
      {grouplist.map((group) => {
        const selectedVariant = selectedVariants[group.groupDto.groupId.toString()];
        const displayProduct = selectedVariant || group.products[0];
        
        return (
          <div key={group.groupDto.groupId} className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="flex">
              {group.groupDto.image && (
                <div className="w-1/3 flex-shrink-0">
                  <img 
                    src={displayProduct.productId === group.products[0].productId 
                      ? group.groupDto.image 
                      : `https://cdn.tgdd.vn/Products/Images/42/${displayProduct.productId.substring(0, 6)}/thumb-600x600.jpg`}
                    alt={displayProduct.productName} 
                    className="w-full h-full object-contain bg-gray-100 p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = group.groupDto.image || '';
                    }}
                  />
                </div>
              )}
              <div className="w-2/3 p-3">
                <h4 className="font-medium text-sm mb-2">
                  {displayProduct.productName}
                </h4>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      {displayProduct.defaultOriginalPrice && (
                        <span className="text-gray-400 line-through">
                          {displayProduct.defaultOriginalPrice.toLocaleString()}đ
                        </span>
                      )}
                      <span className="font-medium text-red-500">
                        {displayProduct.defaultCurrentPrice?.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Phiên bản:</div>
                  <div className="flex flex-wrap gap-1">
                    {group.products.map((product) => (
                      <button
                        key={`${group.groupDto.groupId}-${product.productId}`}
                        onClick={() => handleVariantClick(group.groupDto.groupId, product)}
                        className={`px-2 py-1 text-xs rounded border ${
                          selectedVariant?.productId === product.productId
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {product.variant}
                      </button>
                    ))}
                  </div>
                </div>

                <a 
                  href={`/products/${group.groupDto.groupId}`}
                  className="block mt-3 text-center text-xs bg-blue-500 text-white py-1 rounded hover:bg-blue-600 transition"
                >
                  Xem chi tiết
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ChatbotWidget: React.FC = () => {
  const generateSessionId = (): string => {
    return 'session-' + Math.random().toString(36).substring(2, 11);
  };

  const initializeChatSession = (): { session_id: string; last_active: number; messages: Message[] } => {
    const savedSession = localStorage.getItem('chatSession');
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (Date.now() - session.last_active < threeDaysInMs) {
        return session;
      }
    }

    return {
      session_id: generateSessionId(),
      last_active: Date.now(),
      messages: [
        {
          id: Date.now(),
          text: 'Xin chào! Tôi là trợ lý ảo của NEXUS. Tôi có thể giúp gì cho bạn?',
          sender: 'bot',
        },
      ],
    };
  };

  const [chatSession, setChatSession] = useState(initializeChatSession);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(() => {
    return JSON.parse(localStorage.getItem('chatIsOpen') || 'false');
  });
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showHelpButton, setShowHelpButton] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [viewAllUrl, setViewAllUrl] = useState('');
  const [pendingAuthRequestId, setPendingAuthRequestId] = useState<string | null>(null);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    localStorage.setItem('chatSession', JSON.stringify(chatSession));
  }, [chatSession]);

  useEffect(() => {
    localStorage.setItem('chatIsOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    setShowHelpButton(true);
    const interval = setInterval(() => setShowHelpButton(true), 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!showHelpButton) return;
    const timeout = setTimeout(() => setShowHelpButton(false), 10000);
    return () => clearTimeout(timeout);
  }, [showHelpButton]);

  // Lấy thông tin xác thực từ localStorage
  const getAuthInfo = (): { token: string | null; userId: string } => {
    let userId: string = 'guest-eb9b679f-f89c-4eda-b65e-be3695d5d9d6';
    const guestId = localStorage.getItem('guest_id');
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.id) {
          userId = userObj.id;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    
    // If we couldn't get the ID from the user object, use the guest ID
    if (!userId && guestId) {
      userId = guestId;
    }
    
    return {
      token: localStorage.getItem('accessToken'),
      userId: userId
    };
  };

  useEffect(() => {
    if (!isOpen) return;

    // Kết nối WebSocket
    const { userId } = getAuthInfo();
    wsRef.current = new WebSocket(`ws://localhost:8000/chat/${userId}/${chatSession.session_id}`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setApiError(null);
      
      // Gửi thông tin xác thực ngay sau khi kết nối để cập nhật session state
      sendAuthInfo();
      
      // Kiểm tra nếu có session_id cũ cần chuyển lịch sử
      const previousSessionId = localStorage.getItem('previous_session_id');
      if (previousSessionId && previousSessionId !== chatSession.session_id) {
        setTimeout(() => {
          wsRef.current?.send(JSON.stringify({
            transfer_from_session: previousSessionId,
            user_id: getAuthInfo().userId
          }));
          console.log('Requested session transfer from', previousSessionId);
          
          // Xóa session_id cũ sau khi đã yêu cầu chuyển
          localStorage.removeItem('previous_session_id');
        }, 1000); // Delay 1s để đảm bảo sendAuthInfo đã hoàn tất
      }
    };

    wsRef.current.onmessage = async (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);

      // Xử lý thông báo đăng nhập thành công
      if (data.login_success) {
        setChatSession((prev) => ({
          ...prev,
          messages: [...prev.messages, {
            id: Date.now(),
            text: data.message || "Đăng nhập thành công!",
            sender: 'bot'
          }],
          last_active: Date.now(),
        }));
        return;
      }
      
      // Xử lý thông báo chuyển lịch sử hội thoại thành công
      if (data.session_transferred) {
        setChatSession((prev) => ({
          ...prev,
          messages: [...prev.messages, {
            id: Date.now(),
            text: data.message || "Lịch sử hội thoại đã được khôi phục.",
            sender: 'bot'
          }],
          last_active: Date.now(),
        }));
        return;
      }

      // Xử lý yêu cầu xác thực
      if (data.auth_required) {
        console.log('Authentication required:', data);
        setPendingAuthRequestId(data.auth_request_id || null);
        setIsAuthRequired(true);
        
        // Thêm thông báo cần đăng nhập
        setChatSession((prev) => ({
          ...prev,
          messages: [...prev.messages, {
            id: Date.now(),
            text: "Bạn cần đăng nhập để tiếp tục. Vui lòng nhấn nút đăng nhập bên dưới.",
            sender: 'bot'
          }],
          last_active: Date.now(),
        }));
        
        setIsBotTyping(false);
        return;
      }

      if (data.error) {
        setApiError(data.error);
        setIsBotTyping(false);
        return;
      }

      if (data.message) {
        const botMessage: Message = {
          id: Date.now(),
          text: data.message,
          sender: 'bot',
        };

        let messagesToAdd: Message[] = [botMessage];

        if (data.groupids && data.groupids.length > 0) {
          const url = generateViewAllUrl(data.groupids);
          setViewAllUrl(url);

          const products = await fetchProducts(data.groupids);
          if (products.length > 0) {
            messagesToAdd.push({
              id: Date.now() + 1,
              sender: 'bot',
              products,
            });
          }
        }

        setChatSession((prev) => ({
          ...prev,
          messages: [...prev.messages, ...messagesToAdd],
          last_active: Date.now(),
        }));
      }

      if (data.turn_complete) {
        setIsBotTyping(false);
      }

      if (data.interrupted) {
        setApiError('Cuộc trò chuyện bị gián đoạn.');
        setIsBotTyping(false);
      }
    };

    wsRef.current.onerror = () => {
      setApiError('Kết nối WebSocket thất bại. Vui lòng thử lại.');
      setIsBotTyping(false);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setApiError('Kết nối WebSocket đã đóng.');
      setIsBotTyping(false);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [isOpen, chatSession.session_id]);

  // Hàm gửi thông tin xác thực hiện tại
  const sendAuthInfo = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    const { token, userId } = getAuthInfo();
    const authData: any = { user_id: userId };
    
    if (token) {
      authData.access_token = token;
    }
    
    // Gửi message chỉ chứa thông tin xác thực
    wsRef.current.send(JSON.stringify(authData));
    console.log('Sent auth info to server:', authData);
  };

  // Kiểm tra và cập nhật thông tin xác thực sau khi đăng nhập
  useEffect(() => {
    // Nếu có pending auth request và vừa mới đăng nhập xong
    const { token } = getAuthInfo();
    if (pendingAuthRequestId && token && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "auth_response",
        token: token,
        auth_request_id: pendingAuthRequestId,
        user_id: getAuthInfo().userId
      }));
      setPendingAuthRequestId(null);
      setIsAuthRequired(false);
    }
  }, [pendingAuthRequestId, getAuthInfo]);

  // Xử lý khi người dùng đã đăng nhập và quay lại
  useEffect(() => {
    // Kiểm tra nếu quay lại từ trang đăng nhập với pending_auth
    const params = new URLSearchParams(window.location.search);
    const pendingAuth = params.get('pending_auth');
    
    if (pendingAuth && getAuthInfo().token) {
      // Mở lại chat widget
      setIsOpen(true);
      
      // Xóa tham số khỏi URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Lưu session_id cũ để khôi phục lịch sử cuộc hội thoại
      localStorage.setItem('previous_session_id', pendingAuth);
    }
  }, []);

  const fetchProducts = async (groupIds: number[]): Promise<GroupProduct[]> => {
    try {
      const response = await fetch(
        `http://localhost:8070/api/group-variants/get?groupIds=${groupIds.join(',')}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Fetch Products Error:', error);
      setApiError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      return [];
    }
  };

  const generateViewAllUrl = (groupIds: number[]): string => {
    return `http://localhost:3000/products?groupIds=${groupIds.join(',')}`;
  };

  const handleSend = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setChatSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      last_active: Date.now(),
    }));

    // Gửi tin nhắn qua WebSocket, luôn kèm theo thông tin xác thực
    const { token, userId } = getAuthInfo();
    wsRef.current.send(JSON.stringify({
      message: input,
      groupids: [], // Có thể thêm groupids nếu client cần gửi
      user_id: userId,
      access_token: token
    }));

    setInput('');
    setIsBotTyping(true);
  };

  const handleReset = () => {
    wsRef.current?.close();
    setChatSession({
      session_id: generateSessionId(),
      last_active: Date.now(),
      messages: [
        {
          id: Date.now(),
          text: 'Xin chào! Tôi là trợ lý ảo của NEXUS. Tôi có thể giúp gì cho bạn?',
          sender: 'bot',
        },
      ],
    });
    setApiError(null);
    setViewAllUrl('');
    setIsBotTyping(false);
    setPendingAuthRequestId(null);
    setIsAuthRequired(false);
  };

  // Xử lý đăng nhập
  const handleLogin = async () => {
    // Chuyển hướng đến trang đăng nhập
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + '?pending_auth=' + chatSession.session_id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col items-end">
      {!isOpen && (
        <div className="flex items-center space-x-2">
          {showHelpButton && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center px-4 py-2 bg-[#232323] text-white rounded-full text-sm font-medium hover:bg-[#787676] transition animate-shake"
            >
              <span>Tôi có thể giúp gì cho bạn?</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <button 
            onClick={() => setIsOpen(true)} 
            className="rounded-full hover:scale-105 transition-transform"
          >
            <img src="/images/chatbot.gif" alt="Chatbot Icon" className="w-16 h-16" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="w-[350px] h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
          <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">NEXUS Assistant</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleReset}
                className="text-white bg-blue-800 hover:bg-blue-300 p-1 rounded-full"
                title="Bắt đầu hội thoại mới"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white bg-blue-800 hover:bg-blue-300 p-1 rounded-full"
                title="Thu nhỏ"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto">
            {chatSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'user' ? (
                  <div className="max-w-[80%] p-2 rounded-lg bg-blue-500 text-white">
                    {msg.text}
                  </div>
                ) : msg.products ? (
                  <div className="w-full relative">
                    {msg.text && (
                      <div className="flex mb-2">
                        <img src="/images/chatbot.gif" alt="Bot Icon" className="w-8 h-8 mr-2 mt-1" />
                        <div className="p-2 rounded-lg bg-gray-200 text-black max-w-[80%]">
                          {msg.text}
                        </div>
                      </div>
                    )}
                    
                    <div className="relative border rounded-lg p-2 bg-gray-50">
                      {viewAllUrl && (
                        <div className="absolute top-2 right-2 z-10">
                          <a 
                            href={viewAllUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition border border-gray-200"
                          >
                            Xem toàn bộ
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-3 w-3 ml-1" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </a>
                        </div>
                      )}
                      <div className="overflow-y-auto max-h-60 pr-2">
                        <ProductList grouplist={msg.products} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex">
                    <img src="/images/chatbot.gif" alt="Bot Icon" className="w-8 h-8 mr-2 mt-1" />
                    <div className="p-2 rounded-lg bg-gray-200 text-black max-w-[80%]">
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isBotTyping && (
              <div className="flex justify-start mb-2">
                <div className="flex items-center">
                  <img src="/images/chatbot.gif" alt="Bot Icon" className="w-8 h-8 mr-2" />
                  <div className="bg-gray-200 p-2 rounded-lg flex space-x-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            
            {apiError && (
              <div className="text-red-500 text-xs text-center mt-2 p-1 bg-red-50 rounded">
                {apiError}
              </div>
            )}
            
            {/* Hiển thị nút đăng nhập khi cần xác thực */}
            {isAuthRequired && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={handleLogin}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition"
                >
                  Đăng nhập để tiếp tục
                </button>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Nhập tin nhắn..."
                disabled={isBotTyping || isAuthRequired}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isBotTyping || isAuthRequired}
                className="absolute right-2 text-gray-400 hover:text-blue-500 disabled:hover:text-gray-400"
              >
                <svg 
                  fill="none" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  width="20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12.8147 12.1974L5.28344 13.4526C5.10705 13.482 4.95979 13.6034 4.89723 13.7709L2.29933 20.7283C2.05066 21.3678 2.72008 21.9778 3.33375 21.671L21.3337 12.671C21.8865 12.3946 21.8865 11.6057 21.3337 11.3293L3.33375 2.32933C2.72008 2.0225 2.05066 2.63254 2.29933 3.27199L4.89723 10.2294C4.95979 10.3969 5.10705 10.5183 5.28344 10.5477L12.8147 11.8029C12.9236 11.821 12.9972 11.9241 12.9791 12.033C12.965 12.1173 12.899 12.1834 12.8147 12.1974Z" 
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-1">
              Thông tin chỉ mang tính tham khảo
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;