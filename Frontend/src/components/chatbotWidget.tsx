
import React, { useState, useEffect } from 'react';
interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
  }
  

const ChatbotWidget: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>(() => {
        // Lấy dữ liệu từ localStorage khi khởi tạo để giữ nội dung khi chuyển trang
        const savedMessages = localStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [
            {
                id: Date.now(),
                text: 'Xin chào Bạn! Tôi là trợ lý ảo của NEXUS. Rất vui khi được giúp đỡ bạn',
                sender: 'bot',
            },
        ];
    });
    const [input, setInput] = useState<string>('');
   // Khởi tạo isOpen từ localStorage
    const [isOpen, setIsOpen] = useState<boolean>(() => {
        const savedIsOpen = localStorage.getItem('chatIsOpen');
        return savedIsOpen ? JSON.parse(savedIsOpen) : false;
    });

    // Khoi tao trang thai bot sang chuan bi text 
    const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
    // hieu ung show hepl button
    const [showHelpButton, setShowHelpButton] = useState<boolean>(false);
    useEffect(() => {
        if (isOpen) return; // Không chạy hiệu ứng nếu khung chat đang mở
    
        // Hiển thị nút ngay lần đầu tiên
        setShowHelpButton(true);
    
        // Lặp lại mỗi 30 giây
        const interval = setInterval(() => {
          setShowHelpButton(true);
        }, 30000);
    
        return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
      }, [isOpen]);
      useEffect(() => {
        if (!showHelpButton) return; // Không chạy nếu nút không hiển thị
    
        // Ẩn nút sau 10 giây
        const timeout = setTimeout(() => {
          setShowHelpButton(false);
        }, 10000);
    
        return () => clearTimeout(timeout); // Dọn dẹp timeout
      }, [showHelpButton]);
    // Lưu isOpen vào localStorage khi thay đổi
    useEffect(() => {
        localStorage.setItem('chatIsOpen', JSON.stringify(isOpen));
    }, [isOpen]);

    // Lưu tin nhắn vào localStorage mỗi khi messages thay đổi
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    // Xử lý gửi tin nhắn
    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
        id: Date.now(),
        text: input,
        sender: 'user',
        };

        // Thêm tin nhắn của user
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsBotTyping(true);
        // Giả lập phản hồi của chatbot
        setTimeout(() => {
        const botMessage: Message = {
            id: Date.now() + 1,
            text: `....`,
            sender: 'bot',
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsBotTyping(false);
        }, 1000);
    };

    // Reset cuộc hội thoại
    const handleReset = () => {
        setMessages([
            {
                id: Date.now(),
                text: 'Xin chào Bạn! Tôi là trợ lý ảo của NEXUS. Rất vui khi được giúp đỡ bạn',
                sender: 'bot',
            },
        ]);
        localStorage.setItem(
            'chatMessages',
            JSON.stringify([
              {
                id: Date.now(),
                text: 'Xin chào Bạn! Tôi là trợ lý ảo của NEXUS. Rất vui khi được giúp đỡ bạn',
                sender: 'bot',
              },
            ])
        );
    };

    return (
        <div className="fixed bottom-20 right-5 z-[10000]">
            {/* Icon chatbot */}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-full"
          >
            <img
              src="/images/chatbot.gif"
              alt="Chatbot Icon"
              className="w-20 h-20"
            />
          </button>
        </div>
      )}

        {/* Giao diện chatbot khi mở */}
    {isOpen && (
        <div className="w-[500px] h-[600px] z-[10000] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">NEXUS</h3>
            <button onClick={handleReset} className='ml-auto text-white bg-blue-800 hover:bg-blue-300 px-2 py-1 rounded'>
                <i className='fa-solid fa-sync'></i>
            </button>
            <button onClick={() => setIsOpen(false)} className="ml-1 text-white bg-blue-800 hover:bg-blue-300 px-2 py-1 rounded">
             <i className='fa-solid fa-minus'></i>
            </button>
        </div>

        {/* Nội dung chat */}
        <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
            <div
                key={msg.id}
                className={`mb-2 flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
                {msg.sender === 'user' ? (
                    <div className='max-w-[70%] p-2 rounded-lg bg-blue-500 text-white text-right'>
                        {msg.text}
                    </div>
                ) : (
                    <div className="flex items-start">
                        <img
                            src="/images/chatbot.gif"
                            alt="Bot Icon"
                            className="w-11 h-11 mr-2"
                        />
                        <div className='p-2 rounded-lg bg-gray-200 text-black max-w-full'>
                            {msg.text}
                        </div>
                    </div>
                )}
            </div>
            ))}
            {/* Hiệu ứng 3 chấm khi bot đang "gõ" */}
            {isBotTyping && (
              <div className="flex justify-start mb-2">
                <div className="flex items-center">
                  <img
                    src="/images/chatbot.gif"
                    alt="Bot Icon"
                    className="w-11 h-11 mr-2"
                  />
                  <div className="bg-gray-200 p-2 rounded-lg flex space-x-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Input và nút */}
        <div className="p-4 border-t flex flex-col gap-2">
            <div className="relative flex items-center">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tin nhắn..."
            />
            <button
                onClick={handleSend}
                className="absolute right-3 text-gray-500 hover:text-blue-500"
              >
                {input.trim() ? (
                    <svg 
                    data-v-c1b0a2a0="" 
                    fill="none" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    width="24" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="md:scale-[1.15] scale-[1.05] pt-[1px]"
                    >
                    <path 
                        data-v-c1b0a2a0="" 
                        d="M12.8147 12.1974L5.28344 13.4526C5.10705 13.482 4.95979 13.6034 4.89723 13.7709L2.29933 20.7283C2.05066 21.3678 2.72008 21.9778 3.33375 21.671L21.3337 12.671C21.8865 12.3946 21.8865 11.6057 21.3337 11.3293L3.33375 2.32933C2.72008 2.0225 2.05066 2.63254 2.29933 3.27199L4.89723 10.2294C4.95979 10.3969 5.10705 10.5183 5.28344 10.5477L12.8147 11.8029C12.9236 11.821 12.9972 11.9241 12.9791 12.033C12.965 12.1173 12.899 12.1834 12.8147 12.1974Z" 
                        fill="#203bdc">
                    </path>
                    </svg>
                ) : (
                    <svg 
                    data-v-c1b0a2a0="" 
                    fill="none" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    width="24" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="md:scale-[1.15] scale-[1.05] pt-[1px]"
                    >
                    <path 
                        data-v-c1b0a2a0="" 
                        d="M12.8147 12.1974L5.28344 13.4526C5.10705 13.482 4.95979 13.6034 4.89723 13.7709L2.29933 20.7283C2.05066 21.3678 2.72008 21.9778 3.33375 21.671L21.3337 12.671C21.8865 12.3946 21.8865 11.6057 21.3337 11.3293L3.33375 2.32933C2.72008 2.0225 2.05066 2.63254 2.29933 3.27199L4.89723 10.2294C4.95979 10.3969 5.10705 10.5183 5.28344 10.5477L12.8147 11.8029C12.9236 11.821 12.9972 11.9241 12.9791 12.033C12.965 12.1173 12.899 12.1834 12.8147 12.1974Z" 
                        fill="#6b7280">
                    </path>
                </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Thông tin chỉ mang tính tham khảo, được tư vấn bởi Trí Tuệ Nhân Tạo
            </p>
        </div>
        </div>
    )}
    </div>
);
};

export default ChatbotWidget;