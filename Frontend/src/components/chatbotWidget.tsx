import React, { useState, useEffect } from 'react';
import ProductList from './ProductList'; // Assuming ProductList is in a separate file

interface Product {
  productId: string;
  variant: string;
  orderNumber: number;
  productName: string;
  defaultOriginalPrice: string | number | null;
  defaultCurrentPrice: string | number | null;
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
  text?: string; // Optional for product messages
  sender: 'user' | 'bot';
  products?: GroupProduct[]; // New field for product data
}

interface ChatSession {
  thread_id: string;
  last_active: number;
  messages: Message[];
}

interface ChatbotResponse {
  content: string;
  role: 'assistant' | 'user';
  groupids?: number[];
}

const ChatbotWidget: React.FC = () => {
  const generateThreadId = (): string => {
    return 'thread-' + Math.random().toString(36).substring(2, 11);
  };

  const initializeChatSession = (): ChatSession => {
    const savedSession = localStorage.getItem('chatSession');
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    if (savedSession) {
      const session: ChatSession = JSON.parse(savedSession);
      if (Date.now() - session.last_active < threeDaysInMs) {
        return session;
      }
    }

    return {
      thread_id: generateThreadId(),
      last_active: Date.now(),
      messages: [
        {
          id: Date.now(),
          text: 'Xin chào Bạn! Tôi là trợ lý ảo của NEXUS. Rất vui khi được giúp đỡ bạn',
          sender: 'bot',
        },
      ],
    };
  };

  const [chatSession, setChatSession] = useState<ChatSession>(initializeChatSession());
  const [input, setInput] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const savedIsOpen = localStorage.getItem('chatIsOpen');
    return savedIsOpen ? JSON.parse(savedIsOpen) : false;
  });
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [showHelpButton, setShowHelpButton] = useState<boolean>(false);
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
      const response = await fetch(
        `http://localhost:8070/api/group-variants/get?groupIds=${groupIds.join(',')}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch Products Error:', error);
      setApiError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      return [];
    }
  };

  const callChatbotAPI = async (message: string): Promise<ChatbotResponse> => {
    try {
      const response = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          thread_id: chatSession.thread_id,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatbotResponse = await response.json();
      setApiError(null);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      setApiError('Kết nối với chatbot thất bại. Vui lòng thử lại sau.');
      return {
        content: 'Xin lỗi, hiện tôi không thể trả lời câu hỏi này.',
        role: 'assistant',
      };
    }
  };

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
    setInput('');
    setIsBotTyping(true);

    const botResponse = await callChatbotAPI(input);

    const messagesToAdd: Message[] = [
      {
        id: Date.now() + 1,
        text: botResponse.content,
        sender: 'bot',
      },
    ];

    // If groupids are present, fetch products and add as a separate message
    if (botResponse.groupids && botResponse.groupids.length > 0) {
      const products = await fetchProducts(botResponse.groupids);
      if (products.length > 0) {
        messagesToAdd.push({
          id: Date.now() + 2,
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
    setIsBotTyping(false);
  };

  const handleReset = () => {
    setChatSession({
      thread_id: generateThreadId(),
      last_active: Date.now(),
      messages: [
        {
          id: Date.now(),
          text: 'Xin chào Bạn! Tôi là trợ lý ảo của NEXUS. Rất vui khi được giúp đỡ bạn',
          sender: 'bot',
        },
      ],
    });
    setApiError(null);
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
          {/* Header */}
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

          {/* Chat content */}
          <div className="flex-1 p-3 overflow-y-auto">
            {chatSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'user' ? (
                  <div className="max-w-[80%] p-2 rounded-lg bg-blue-500 text-white">
                    {msg.text}
                  </div>
                ) : msg.products ? (
                  <div className="w-full">
                    {msg.text && (
                      <div className="flex mb-2">
                        <img src="/images/chatbot.gif" alt="Bot Icon" className="w-8 h-8 mr-2 mt-1" />
                        <div className="p-2 rounded-lg bg-gray-200 text-black max-w-[80%]">
                          {msg.text}
                        </div>
                      </div>
                    )}
                    <ProductList grouplist={msg.products} />
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
          </div>

          {/* Input area */}
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