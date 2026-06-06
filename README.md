# 💻 Lumen AI - Trợ lý Tư vấn Laptop Thông minh

**Lumen AI** là một hệ thống tư vấn mua laptop thông minh và phân tích yêu cầu phần cứng tối ưu. Dự án kết hợp thuật toán đề xuất **K-Nearest Neighbors (KNN)** truyền thống để tìm kiếm thông số chính xác từ cơ sở dữ liệu cùng với mô hình ngôn ngữ lớn **Large Language Model (Ollama/Qwen)** để tương tác và viết thoại tư vấn tự nhiên bằng Tiếng Việt.

---

## 📂 Cấu trúc dự án

```text
Ứng dụng AI/project/
├── Be/                   # Backend (FastAPI, Python)
│   ├── main.py           # File chạy chính của server API
│   ├── data_loader.py    # Xử lý dữ liệu sản phẩm & thuật toán KNN
│   ├── llm_orchestrator.py # Kết nối và điều phối Ollama (NER & Generation)
│   ├── Modelfile         # Cấu hình custom model cho Ollama
│   └── requirements.txt  # Danh sách thư viện Python cần thiết
├── Fe/                   # Frontend (React, Vite, CSS)
│   ├── src/              # Mã nguồn React Component & Giao diện
│   ├── package.json      # Quản lý thư viện Javascript
│   └── vite.config.js    # Cấu hình đóng gói Vite
└── model/                # Cơ sở dữ liệu và Model
    └── laptops_cleaned_v1.csv # Dataset danh sách laptop
```

---

## 🛠️ Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:
1. **Python 3.10+** (Tải tại [python.org](https://www.python.org/))
2. **Node.js 18+** (Tải tại [nodejs.org](https://nodejs.org/))
3. **Ollama** (Trình chạy LLM cục bộ, tải tại [ollama.com](https://ollama.com/))

---

## 🚀 Hướng dẫn khởi chạy dự án

Bạn cần khởi chạy hệ thống theo thứ tự: **Ollama -> Backend -> Frontend**.

### Bước 1: Cấu hình Ollama và Tải Mô hình

1. Đảm bảo ứng dụng **Ollama** đang chạy dưới nền máy tính của bạn.
2. Tải mô hình nền **Qwen 2.5 (phiên bản 3B tham số)**:
   ```bash
   ollama pull qwen2.5:3b
   ```
3. Tạo mô hình custom **Qwen2.5.projectAI** phục vụ tác vụ trích xuất thực thể (NER):
   * Mở Terminal/Command Prompt và di chuyển vào thư mục `Be`:
     ```bash
     cd "f:\Ứng dụng AI\project\Be"
     ```
   * Chạy lệnh build model từ file cấu hình `Modelfile` có sẵn:
     ```bash
     ollama create Qwen2.5.projectAI -f Modelfile
     ```

---

### Bước 2: Thiết lập và Chạy Backend (FastAPI)

1. Mở một cửa sổ Terminal mới tại thư mục `Be`:
   ```bash
   cd "f:\Ứng dụng AI\project\Be"
   ```
2. Tạo và kích hoạt môi trường ảo Python (khuyên dùng):
   ```bash
   # Tạo môi trường ảo
   python -m venv venv

   # Kích hoạt môi trường ảo (Windows CMD)
   venv\Scripts\activate

   # Hoặc kích hoạt môi trường ảo (Windows PowerShell)
   .\venv\Scripts\Activate.ps1
   ```
3. Cài đặt các thư viện cần thiết:
   ```bash
   pip install -r requirements.txt
   ```
4. Khởi chạy FastAPI Server:
   ```bash
   python main.py
   ```
   *Server Backend sẽ khởi chạy tại cổng **8000** (`http://localhost:8000`).*

---

### Bước 3: Thiết lập và Chạy Frontend (React + Vite)

1. Mở một cửa sổ Terminal mới tại thư mục `Fe`:
   ```bash
   cd "f:\Ứng dụng AI\project\Fe"
   ```
2. Cài đặt các thư viện Node.js cần thiết:
   ```bash
   npm install
   ```
3. Khởi động môi trường phát triển (Dev server):
   ```bash
   npm run dev
   ```
   *Giao diện Frontend sẽ sẵn sàng để truy cập tại địa chỉ **`http://localhost:5173`**.*

---

## 🔄 Luồng hoạt động của hệ thống

1. **Nhận tin nhắn (User Message):** Người dùng nhập nhu cầu tư vấn (ví dụ: *"Tôi cần tìm máy Asus dưới 25 triệu và có RAM 16GB"*).
2. **Nhận thức ý định (NER):** Backend gửi tin nhắn đến Ollama thông qua mô hình `Qwen2.5.projectAI` để bóc tách thông tin có cấu trúc dưới dạng JSON (Hãng, Giá tiền, RAM và mục đích trò chuyện xã giao).
3. **Tìm kiếm bằng KNN:** 
   * Nếu người dùng chỉ chào hỏi (`is_chat_only: true`), AI sẽ trả lời xã giao tự nhiên và gợi mở nhu cầu mua máy.
   * Nếu người dùng có nhu cầu tìm máy (`is_chat_only: false`), thuật toán **KNN** trong Backend sẽ tính toán khoảng cách Euclidean (sau khi đã chuẩn hóa dữ liệu bằng `StandardScaler`) để lấy ra **Top 3 Laptop** sát nhất với ngân sách và RAM yêu cầu từ file dữ liệu sản phẩm.
4. **Sinh câu thoại tư vấn:** Backend gửi danh sách 3 laptop tìm được quay lại model `qwen2.5:3b` để viết một lời tư vấn, so sánh chi tiết ưu nhược điểm của các máy bằng tiếng Việt trước khi gửi phản hồi về cho Frontend hiển thị.
