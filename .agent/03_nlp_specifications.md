# NLP API Specifications

## 1. Engine & Model
- **Platform:** Ollama.
- **Model Name:** `Qwen2.5.projectAI` (Đã được custom qua Modelfile).

## 2. The NER Interaction (First Call)
- Khi code Python gọi đến endpoint `/api/generate` hoặc `/api/chat` của Ollama, **BẮT BUỘC** phải truyền parameter `"format": "json"`.
- Response nhận được luôn phải được parse qua `json.loads()`. Có try-except để bắt lỗi JSON Decode.

## 3. The Generation Interaction (Second Call)
- Khi chạy nhánh B (Đã tìm ra máy bằng KNN), Python sẽ thực hiện một cú gọi API khác đến model mặc định (ví dụ gọi thẳng `qwen2.5:3b` hoặc vẫn dùng model custom nhưng bỏ qua system prompt cũ).
- **Prompt mẫu cho Second Call:** `"Khách hàng vừa yêu cầu tìm laptop. Hệ thống đã lọc được 3 máy sau: {laptop_list}. Viết một câu trả lời thân thiện, so sánh nhẹ nhàng để tư vấn cho khách. Không dùng markdown quá phức tạp."`
- Tham số cấu hình: `temperature = 0.4` (để câu thoại có hồn hơn).