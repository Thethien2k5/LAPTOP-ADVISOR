from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

from data_loader import query_laptops
from llm_orchestrator import call_ollama_ner, call_ollama_generation

app = FastAPI(title="AI Laptop Advisor Backend")

# Cấu hình CORS cho phép Frontend truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    user_msg = request.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Nội dung tin nhắn không được để trống")
        
    # 1. Gọi Ollama NER (lượt gọi thứ 1) để nhận định ý định người dùng
    ner_result = call_ollama_ner(user_msg)
    print("NER Result:", ner_result)
    
    # 2. Xử lý Logic rẽ nhánh
    if ner_result.get("is_chat_only", True):
        # Nhánh A: Tin nhắn xã giao / chào hỏi
        # Sử dụng model nền sinh ra câu thoại chào hỏi tự nhiên
        try:
            payload = {
                "model": "qwen2.5:3b",
                "prompt": (
                    f"Bạn là Lumen, trợ lý tư vấn laptop thông minh. Khách hàng nhắn: \"{user_msg}\". "
                    "Hãy trả lời khách hàng một cách lịch sự, thân thiện bằng tiếng Việt (tối đa 2 câu). "
                    "Mục tiêu là chào hỏi và khơi gợi khách hàng đưa ra nhu cầu mua laptop (ví dụ: khoảng giá, hãng sản xuất, RAM, mục đích sử dụng) để bạn có thể tư vấn."
                ),
                "stream": False,
                "options": {
                    "temperature": 0.7
                }
            }
            res = requests.post("http://localhost:11434/api/generate", json=payload, timeout=20)
            res.raise_for_status()
            reply = res.json().get("response", "").strip()
        except Exception as e:
            print(f"Error generating chat reply: {e}")
            reply = (
                "Dạ em chào anh/chị ạ! Em là Lumen, trợ lý tư vấn laptop thông minh. "
                "Em có thể giúp gì cho anh/chị hôm nay ạ? Anh/chị có thể chia sẻ tầm giá hoặc hãng máy mình đang quan tâm không ạ?"
            )
            
        return {"reply": reply, "laptops": []}
    
    # Nhánh B: Tư vấn Laptop
    brand = ner_result.get("brand")
    price_vnd = ner_result.get("price")
    ram = ner_result.get("ram")
    
    # 3. Chạy thuật toán KNN lọc Top 3
    top_3_laptops = query_laptops(brand=brand, price_vnd=price_vnd, ram=ram)
    print(f"KNN returned {len(top_3_laptops)} laptops.")
    
    # 4. Gọi Ollama sinh câu thoại tư vấn dựa trên 3 máy đã tìm (lượt gọi thứ 2)
    ai_reply = call_ollama_generation(user_msg, top_3_laptops)
    
    return {
        "reply": ai_reply,
        "laptops": top_3_laptops
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
