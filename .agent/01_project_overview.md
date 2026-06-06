# AI Laptop Advisor - Project Overview

## 1. Objective
Xây dựng một Chatbot tư vấn laptop bằng Tiếng Việt. Hệ thống sử dụng mô hình LLM cục bộ (Ollama) kết hợp Python FastAPI đóng vai trò Backend Orchestrator (Điều phối). LLM không chat trực tiếp với người dùng mà đóng vai trò trạm bóc tách dữ liệu (NER) và tổng hợp văn bản. Thuật toán K-Nearest Neighbors (KNN) được dùng để gợi ý sản phẩm.

## 2. Hardware Constraints (Critical)
- **GPU:** Nvidia RTX 3060 (6GB VRAM, available ~4.7GB).
- **Rule:** Bắt buộc dùng `qwen2.5-3b-instruct-q4_k_m.gguf` chạy qua Ollama.

## 3. Tech Stack
- **Frontend:** ReactJS, TailwindCSS.
- **Backend:** Python (FastAPI, Uvicorn).
- **NLP Engine:** Ollama (Local API) với cờ bắt buộc `--format json` khi gọi NER.
- **Machine Learning:** scikit-learn (KNN), pandas (xử lý In-memory dataset, không dùng Database).