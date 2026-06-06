# Orchestrator Architecture and Data Flow

## 1. Concept: Backend as the "Director"
Frontend React không bao giờ giao tiếp thẳng với AI. Mọi request đều qua Python FastAPI. FastAPI sẽ gọi AI 1 lần hoặc 2 lần tùy theo kịch bản.

## 2. Execution Flow
1. **User Input:** User gửi câu nói (VD: "Tìm máy Asus 20tr").
2. **First AI Call (NER Task):** FastAPI gửi tới model `Qwen2.5.projectAI` với cờ `format="json"`. AI trả về JSON có cờ `is_chat_only`.
3. **Branching Logic (FastAPI):**
   - **Branch A (Xã giao):** Nếu `is_chat_only == true` -> FastAPI tự động trả về một câu chào hỏi được lập trình sẵn hoặc dùng một lời gọi AI đơn giản để sinh câu thoại. Bỏ qua KNN.
   - **Branch B (Tìm máy):** Nếu `is_chat_only == false` -> Chuyển sang Bước 4.
4. **KNN Search:** FastAPI lấy các trường (brand, max_price...) vector hóa và chạy qua mô hình KNN để tìm Top 3 Laptop trong dataset Pandas.
5. **Second AI Call (Generation Task):** FastAPI đóng gói thông tin Top 3 Laptop vừa tìm được, cộng với ngữ cảnh, gửi một prompt ẩn sang Ollama (lúc này KHÔNG dùng cờ json): *"Đây là 3 máy tìm được: [Data]. Hãy đóng vai nhân viên bán hàng, viết một đoạn ngắn tư vấn 3 máy này cho khách."*
6. **Response:** FastAPI nhận câu thoại mượt mà từ AI, đính kèm mảng dữ liệu JSON của 3 laptop, gửi tất cả về cho React hiển thị.