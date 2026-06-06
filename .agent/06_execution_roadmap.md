# Agent Execution Roadmap

Agent BẮT BUỘC thực thi tuần tự. Không làm gộp các phase.

## Phase 1: Data Initialization
1. Viết script `data_loader.py` dùng Pandas load file CSV, chuẩn hóa data và test thuật toán KNN độc lập. Đảm bảo input là vector (Price, RAM) trả ra đúng Top 3 máy.

## Phase 2: Python Backend Core
1. Setup FastAPI.
2. Viết file `llm_orchestrator.py` dùng thư viện `requests` hoặc `ollama-python` để kết nối local Ollama.
3. Test kịch bản 1: Gửi "Hi" -> Nhận JSON `is_chat_only: true`.
4. Test kịch bản 2: Gửi "Mua lap Asus 20tr" -> Nhận JSON có fields -> Chạy KNN -> Gọi AI lần 2 sinh text -> In ra console kết quả cuối cùng.

## Phase 3: REST API Integration
1. Gắn luồng logic của Phase 2 vào endpoint `POST /api/chat`.
2. Bật Uvicorn, test bằng Postman hoặc cURL.

## Phase 4: Frontend Development
1. Build React UI.
2. Fetch API và xử lý hiển thị Text chung với mảng Laptop Cards.

## Phase 5: End-to-End Tuning
1. Test các trường hợp người dùng gõ teencode hoặc viết không dấu.
2. Kiểm tra VRAM bằng `nvidia-smi` để đảm bảo hệ thống không bị crash trong quá trình Orchestrator gọi AI 2 lần liên tiếp.