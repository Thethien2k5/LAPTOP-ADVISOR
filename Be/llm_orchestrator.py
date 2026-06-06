import json
import requests

OLLAMA_URL = "http://localhost:11434"

def call_ollama_ner(message: str) -> dict:
    """
    First Call (NER): Gửi tin nhắn khách hàng tới model Qwen2.5.projectAI
    với tham số format="json" để bóc tách thực thể.
    """
    payload = {
        "model": "Qwen2.5.projectAI",
        "prompt": message,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.0
        }
    }
    
    try:
        response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=30)
        response.raise_for_status()
        res_json = response.json()
        raw_text = res_json.get("response", "").strip()
        
        # Parse kết quả JSON nhận được
        data = json.loads(raw_text)
        # Đảm bảo các trường thông tin cơ bản luôn tồn tại
        data.setdefault("is_chat_only", True)
        data.setdefault("brand", None)
        data.setdefault("price", None)
        data.setdefault("ram", None)
        return data
    except Exception as e:
        print(f"Error in Ollama NER: {e}")
        # Fallback về chat thông thường khi lỗi
        return {
            "is_chat_only": True,
            "brand": None,
            "price": None,
            "ram": None,
            "error": str(e)
        }

def call_ollama_generation(user_message: str, laptops: list) -> str:
    """
    Second Call (Text Generation): Gửi danh sách 3 laptop tìm được sang model qwen2.5:3b
    để AI viết một đoạn thoại tư vấn tự nhiên, so sánh các máy.
    """
    # Xây dựng danh sách laptop chi tiết cho prompt
    laptops_text = ""
    for idx, lap in enumerate(laptops):
        price_vnd = int(lap['price'] * 300)
        laptops_text += (
            f"\n- Máy {idx+1}: {lap['brand_name']} {lap['model']}\n"
            f"  Cấu hình: RAM {lap['ram_num']}GB | CPU: {lap['processor']} | GPU: {lap['gpu_brand']} {lap['gpu_type']} | OS: {lap['os']}\n"
            f"  Giá: {price_vnd:,} VND | Đánh giá: {lap['rating']}/5\n"
        )

    prompt = f"""Khách hàng vừa hỏi tìm laptop với yêu cầu: "{user_message}".
Hệ thống đã lọc được 3 máy phù hợp nhất sau đây:
{laptops_text}
Hãy đóng vai nhân viên bán hàng laptop thân thiện và chuyên nghiệp, viết một đoạn ngắn (khoảng 3-5 câu) bằng tiếng Việt để tư vấn, so sánh nhẹ nhàng các ưu điểm nổi bật của các máy này để giúp khách hàng đưa ra lựa chọn hợp lý nhất.

Yêu cầu:
- Trả lời bằng tiếng Việt lịch sự, tự nhiên.
- Chỉ tập trung tư vấn dựa vào danh sách 3 máy trên.
- Không dùng markdown quá phức tạp, giữ cấu trúc đơn giản dễ đọc.
"""

    payload = {
        "model": "qwen2.5:3b",
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.4
        }
    }
    
    try:
        response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=45)
        response.raise_for_status()
        res_json = response.json()
        return res_json.get("response", "").strip()
    except Exception as e:
        print(f"Error in Ollama Generation: {e}")
        return "Dạ, hệ thống đã lọc ra 3 mẫu máy phù hợp ở trên. Anh/chị có thể tham khảo bảng so sánh chi tiết để tìm được máy ưng ý nhất ạ!"
