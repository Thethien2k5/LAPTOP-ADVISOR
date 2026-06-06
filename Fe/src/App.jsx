import { useState, useEffect, useRef } from 'react'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là Lumen. Tôi đã sẵn sàng phân tích yêu cầu phần cứng của bạn. Để bắt đầu, bạn thường sử dụng những phần mềm đồ họa hay có nhu cầu làm việc thế nào nhất?',
      time: '10:42 AM',
      laptops: []
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Tự động cuộn xuống dưới cùng khi tin nhắn thay đổi hoặc đang load
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const formatTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSend = async (textToSend) => {
    const msgText = textToSend || input
    if (!msgText.trim()) return

    const userTime = formatTime()
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: msgText,
      time: userTime,
      laptops: []
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: msgText })
      })

      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ AI.')
      }

      const data = await response.json()
      const botTime = formatTime()

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply,
        time: botTime,
        laptops: data.laptops || []
      }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Có lỗi xảy ra khi kết nối tới Server AI. Vui lòng đảm bảo rằng FastAPI Backend đang chạy trên cổng 8000.',
        time: formatTime(),
        laptops: []
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const selectSuggestion = (suggestion) => {
    handleSend(suggestion)
  }

  const askDetail = (model) => {
    handleSend(`Cho mình biết thêm về dòng máy ${model}`)
  }

  return (
    <div className="flex flex-col h-screen bg-[#07080a] text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="border-b border-[#1f2937]/50 bg-[#0c0d12]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center">
              Lumen Advisor <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Trực tuyến</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Hệ thống phân tích phần cứng thông minh</p>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
          Lumen Engine v4.2
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 overflow-y-auto flex flex-col space-y-6 pb-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
            
            {/* Tin nhắn văn bản */}
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-[#12131a] border-l-4 border-emerald-500 text-slate-200 rounded-tl-none'
            }`}>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>

            {/* Time label */}
            <span className="text-[10px] text-slate-500 px-2 font-medium">
              {msg.time}
            </span>

            {/* Thẻ sản phẩm nếu có từ KNN */}
            {msg.laptops && msg.laptops.length > 0 && (
              <div className="w-full pt-3">
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-emerald-500">
                  {msg.laptops.map((lap, index) => {
                    const priceVnd = intPrice => intPrice ? intPrice * 300 : 0;
                    return (
                      <div
                        key={index}
                        className="bg-[#12141c] border border-slate-800 rounded-xl p-4 w-72 flex-shrink-0 hover:border-emerald-500 transition duration-300 shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold uppercase">
                              {lap.brand_name}
                            </span>
                            <span className="text-xs text-yellow-500 flex items-center font-bold">
                              ⭐ {lap.rating || '4.5'}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-slate-200 line-clamp-2 min-h-[40px] mb-3">
                            {lap.model}
                          </h3>
                          <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                            <div className="flex justify-between">
                              <span>RAM:</span>
                              <span className="text-slate-200 font-semibold">{lap.ram_num} GB ({lap.memory_type || 'DDR5'})</span>
                            </div>
                            <div className="flex justify-between">
                              <span>CPU:</span>
                              <span className="text-slate-200 font-semibold line-clamp-1">{lap.processor_brand} {lap.iter}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>GPU:</span>
                              <span className="text-slate-200 font-semibold line-clamp-1">{lap.gpu_brand} {lap.gpu_type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bảo hành:</span>
                              <span className="text-slate-200 font-semibold">{lap.warrenty || 1} Năm</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center mb-3">
                            <span className="text-xs text-slate-500 font-medium">Giá quy đổi:</span>
                            <span className="text-base font-extrabold text-emerald-400">
                              {priceVnd(lap.price).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <button
                            onClick={() => askDetail(lap.model)}
                            className="w-full py-1.5 text-center text-xs font-bold bg-[#1e293b] hover:bg-[#10b981] hover:text-black text-slate-200 rounded-lg transition duration-200"
                          >
                            Tư vấn thêm về máy này
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Trạng thái Bot đang gõ */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <div className="bg-[#12131a] border-l-4 border-emerald-500 p-4 rounded-2xl rounded-tl-none shadow-xl flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full dot-1"></div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full dot-2"></div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full dot-3"></div>
            </div>
            <span className="text-[10px] text-slate-500 px-2 font-medium">Bot đang gõ...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Suggestion Box and Input Area */}
      <footer className="border-t border-[#1f2937]/50 bg-[#07080a]/90 backdrop-blur-lg pt-3 pb-6 px-4 flex-shrink-0 z-50">
        <div className="max-w-4xl mx-auto w-full flex flex-col space-y-3">
          
          {/* Câu hỏi gợi ý nhanh */}
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => selectSuggestion('Chào Lumen, mình cần tìm máy dựng video 4K bằng After Effects. Ưu tiên màn hình chuẩn màu DCI-P3 và ít nhất 64GB RAM.')}
              className="text-xs bg-[#12141c] hover:bg-[#1f2937] text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-1.5 rounded-full flex-shrink-0 transition duration-200"
            >
              🎬 Dựng video 4K, 64GB RAM
            </button>
            <button
              onClick={() => selectSuggestion('Tìm máy Asus tầm giá khoảng 20-30 triệu')}
              className="text-xs bg-[#12141c] hover:bg-[#1f2937] text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-1.5 rounded-full flex-shrink-0 transition duration-200"
            >
              💻 Asus khoảng 20-30 triệu
            </button>
            <button
              onClick={() => selectSuggestion('Mình cần mua laptop gaming HP tản nhiệt cực tốt để cày game nặng')}
              className="text-xs bg-[#12141c] hover:bg-[#1f2937] text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-1.5 rounded-full flex-shrink-0 transition duration-200"
            >
              🎮 HP Gaming tản nhiệt tốt
            </button>
            <button
              onClick={() => selectSuggestion('Laptop Apple mỏng nhẹ pin trâu giá rẻ')}
              className="text-xs bg-[#12141c] hover:bg-[#1f2937] text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-1.5 rounded-full flex-shrink-0 transition duration-200"
            >
              🍎 Apple mỏng nhẹ pin lâu
            </button>
          </div>

          {/* Ô nhập chat */}
          <div className="relative flex items-center bg-[#161822] border border-slate-800 rounded-xl px-4 py-2 hover:border-emerald-500/50 transition focus-within:border-emerald-500">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              spellCheck="false"
              placeholder="Cho mình biết thêm về các nhu cầu của bạn..."
              className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 text-sm py-1.5"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition duration-200 ${
                input.trim() && !isLoading
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <svg className="h-4 w-4 fill-current transform rotate-45 -translate-x-0.5 translate-y-0.5" viewBox="0 0 24 24">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
            </button>
          </div>
          <div className="text-[10px] text-slate-600 text-center font-medium">
            POWERED BY LUMEN NEURAL ENGINE V4.2
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
