import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './hooks/useAuth';

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
  viewAllUrl?: string; // Add viewAllUrl to message
}

interface QueryResponse {
  filter_params: Record<string, any>;
  group_ids: number[];
  response: string;
}

const ProductList: React.FC<{ grouplist: GroupProduct[] }> = ({ grouplist }) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Product>>({});

  useEffect(() => {
    const initialSelected: Record<string, Product> = {};
    grouplist.forEach((group) => {
      if (group.products.length > 0) {
        initialSelected[group.groupDto.groupId.toString()] = group.products[0];
      }
    });
    setSelectedVariants(initialSelected);
  }, [grouplist]);

  const handleVariantClick = (groupId: number, product: Product) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [groupId.toString()]: product,
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
                    src={
                      displayProduct.productId === group.products[0].productId
                        ? group.groupDto.image
                        : `https://cdn.tgdd.vn/Products/Images/42/${displayProduct.productId.substring(0, 6)}/thumb-600x600.jpg`
                    }
                    alt={displayProduct.productName}
                    className="w-full h-full object-contain bg-gray-100 p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = group.groupDto.image || '';
                    }}
                  />
                </div>
              )}
              <div className="w-2/3 p-3">
                <a
                  href={`/detail/${group.groupDto.type}/${group.products[0].productId}`}
                  className="font-medium text-sm mb-2 text-blue-600 hover:underline block"
                >
                  {displayProduct.productName}
                </a>
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

                {group.products.length > 1 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-2">Phiên bản:</div>
                    <div className="flex flex-wrap gap-1">
                      {group.products.map((product, index) => {
                        const variantLabel = product.variant && product.variant.trim() 
                          ? product.variant 
                          : `Phiên bản ${index + 1}`;
                        
                        return (
                          <button
                            key={`${group.groupDto.groupId}-${product.productId}`}
                            onClick={() => handleVariantClick(group.groupDto.groupId, product)}
                            className={`px-3 py-1 text-xs rounded border min-w-[60px] ${
                              selectedVariant?.productId === product.productId
                                ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                            title={`Product ID: ${product.productId}`}
                          >
                            {variantLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ChatbotWidget: React.FC = () => {
  const { user } = useAuth();
  
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

  const fetchProducts = async (groupIds: number[]): Promise<GroupProduct[]> => {
    try {
      const response = await axios.get(
        `http://localhost:8070/api/group-variants/get?groupIds=${groupIds.join(',')}`
      );
      return response.data;
    } catch (error) {
      console.error('Fetch Products Error:', error);
      setApiError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      return [];
    }
  };

  const generateViewAllUrl = (filterParams: Record<string, any>): string => {
    // Extract type from filter_params or default to 'phone'
    const type = filterParams.type?.toLowerCase() || 'phone';
    
    // Create base URL for the category page
    const baseUrl = `/${type}`;
    const params = new URLSearchParams();
    
    console.log('Processing filterParams:', filterParams);
    
    // Map filter_params to frontend filter format
    const filterMapping: Record<string, any> = {};
    
    // Price range mapping
    const hasMinPrice = filterParams.minPrice !== undefined;
    const hasMaxPrice = filterParams.maxPrice !== undefined;
    
    if (hasMinPrice || hasMaxPrice) {
      const minPrice = filterParams.minPrice || 0;
      const maxPrice = filterParams.maxPrice || 50000000;
      
      // Only add priceRange if it's not the default range
      if (minPrice !== 0 || maxPrice !== 50000000) {
        filterMapping.priceRange = [minPrice, maxPrice];
        console.log('Set price range:', [minPrice, maxPrice]);
      }
    }
    
    // Tags mapping - convert comma-separated string to array
    if (filterParams.tags) {
      if (typeof filterParams.tags === 'string' && filterParams.tags.trim()) {
        // Split by comma and clean up each tag
        filterMapping.tags = filterParams.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        console.log('Set tags:', filterMapping.tags);
      }
    }
    
    // Add filters to URL if any exist
    if (Object.keys(filterMapping).length > 0) {
      params.append('filters', JSON.stringify(filterMapping));
      console.log('Final filterMapping:', filterMapping);
    }
    
    // Reset page to 0 for new search
    params.append('page', '0');
    
    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log('Generated final URL:', finalUrl);
    
    return finalUrl;
  };

  const shouldShowViewAll = (filterParams: Record<string, any>): boolean => {
    // Show "Xem toàn bộ" if we have meaningful filter_params
    if (!filterParams) return false;
    
    // Check for price filters
    const hasPrice = (filterParams.minPrice !== undefined && filterParams.minPrice !== 0) || 
                    (filterParams.maxPrice !== undefined && filterParams.maxPrice !== 50000000);
    
    // Check for tags
    const hasTags = filterParams.tags && 
                    typeof filterParams.tags === 'string' && 
                    filterParams.tags.trim().length > 0;
    
    return hasPrice || hasTags;
  };

  // Updated handleSend function
  const handleSend = async () => {
    if (!input.trim()) return;

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

    setIsBotTyping(true);
    setApiError(null);
    
    try {
      const getChatbotUrl = () => {
        const currentHost = window.location.hostname;
        
        if (currentHost.includes('ngrok-free.app')) {
          return 'https://your-chatbot-ngrok-url.ngrok-free.app/query';
        } else if (currentHost === 'localhost') {
          return 'http://localhost:5500/query';
        } else {
          return 'https://your-production-chatbot-domain.com/query';
        }
      };

      const response = await axios.post<QueryResponse>(getChatbotUrl(), {
        user_id: user?.id || (localStorage.getItem('guestCartId')),
        session_id: chatSession.session_id,
        query: input,
        access_token: localStorage.getItem('accessToken') 
      });
      
      console.log('API Response:', response.data);
      
      const { group_ids, response: botResponse, filter_params } = response.data;

      const botMessage: Message = {
        id: Date.now(),
        text: botResponse,
        sender: 'bot',
      };

      let messagesToAdd: Message[] = [botMessage];

      // Check if we should show "Xem toàn bộ" based on filter_params
      if (shouldShowViewAll(filter_params)) {
        const url = generateViewAllUrl(filter_params);
        console.log('Generated View All URL:', url);

        // If we have products from group_ids, show them with view all button
        if (group_ids && group_ids.length > 0) {
          // Handle nested group_ids
          let flattenedGroupIds: number[] = [];
          if (Array.isArray(group_ids)) {
            if (group_ids.length > 0 && Array.isArray(group_ids[0])) {
              flattenedGroupIds = group_ids.flat();
            } else {
              flattenedGroupIds = group_ids;
            }
          }

          if (flattenedGroupIds.length > 0) {
            try {
              const products = await fetchProducts(flattenedGroupIds);
              if (products.length > 0) {
                messagesToAdd.push({
                  id: Date.now() + 1,
                  sender: 'bot',
                  products,
                  viewAllUrl: url,
                });
              } else {
                // No products found but have filters, show text message with view all
                messagesToAdd.push({
                  id: Date.now() + 1,
                  sender: 'bot',
                  text: 'Bạn có thể xem toàn bộ sản phẩm phù hợp tại trang danh mục.',
                  viewAllUrl: url,
                });
              }
            } catch (error) {
              console.error('Error fetching products:', error);
              // Still show view all option even if product fetch fails
              messagesToAdd.push({
                id: Date.now() + 1,
                sender: 'bot',
                text: 'Bạn có thể xem toàn bộ sản phẩm phù hợp tại trang danh mục.',
                viewAllUrl: url,
              });
            }
          }
        } else {
          // No group_ids but have filter_params, show view all option
          messagesToAdd.push({
            id: Date.now() + 1,
            sender: 'bot',
            text: 'Bạn có thể xem toàn bộ sản phẩm phù hợp với yêu cầu của bạn.',
            viewAllUrl: url,
          });
        }
      }

      setChatSession((prev) => ({
        ...prev,
        messages: [...prev.messages, ...messagesToAdd],
        last_active: Date.now(),
      }));
      
    } catch (error) {
      console.error('Query API Error:', error);
      setApiError('Không thể xử lý yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsBotTyping(false);
    }

    setInput('');
  };

  const handleReset = () => {
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
    setIsBotTyping(false);
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white bg-blue-800 hover:bg-blue-300 p-1 rounded-full"
                title="Thu nhỏ"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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
                  <div className="max-w-[80%] p-2 rounded-lg bg-blue-500 text-white">{msg.text}</div>
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
                      {msg.viewAllUrl && (
                        <div className="absolute top-2 right-2 z-10">
                          <button
                            onClick={() => {
                              // Navigate to the filter page using the stored URL
                              window.location.href = msg.viewAllUrl!;
                            }}
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
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
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
                    <div className="p-2 rounded-lg bg-gray-200 text-black max-w-[80%]">{msg.text}</div>
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
                disabled={isBotTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isBotTyping}
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