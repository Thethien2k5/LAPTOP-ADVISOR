# Frontend Specifications

## 1. Setup
- React + TailwindCSS.

## 2. Components Requirement
- **ChatBox:** Giao diện giống Zalo/Messenger.
- **MessageBubble:** Chứa text phản hồi từ AI.
- **ProductSlider / CardList:** Nằm ngay dưới MessageBubble của AI, dùng để hiển thị danh sách các laptop nhận được từ trường `laptops` của API.
  - Mỗi thẻ hiển thị: Tên máy, RAM, CPU, Giá tiền, Image (nếu có URL trong dataset).
- **Loading State:** Hiển thị hiệu ứng "Bot đang gõ..." vì quá trình Backend chạy (NER -> KNN -> Generate) có thể mất từ 2-4 giây.