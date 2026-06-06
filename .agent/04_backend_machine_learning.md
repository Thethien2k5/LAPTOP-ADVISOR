# Backend & Orchestration Logic

## 1. FastAPI Setup
- Chạy trên port `8000`. Cấu hình CORS middleware cho Frontend.
- Endpoint: `POST /api/chat`. Payload: `{"message": "string"}`. Response: `{"reply": "string", "laptops": [array_of_objects]}`.

## 2. KNN Implementation (scikit-learn)
- Khi khởi động server (`@app.on_event("startup")`), nạp file CSV bằng Pandas.
- Lọc bỏ dữ liệu rác (NaN). Chuyển đổi cột `Price` và `RAM` sang định dạng số liên tục.
- Sử dụng `StandardScaler` để scale 2 cột Price và RAM.
- Khởi tạo `NearestNeighbors(n_neighbors=3, metric='euclidean')`.

## 3. Python Logic Pseudocode
```python
@app.post("/api/chat")
async def chat(request: ChatRequest):
    # 1. Gọi Ollama NER
    ner_json = call_ollama_json(request.message)
    
    # 2. Xử lý logic
    if ner_json.get("is_chat_only"):
        return {"reply": "Dạ em chào anh/chị, em có thể tư vấn laptop gì cho mình ạ?", "laptops": []}
    
    # 3. Chạy Filter & KNN
    filtered_df = apply_hard_filters(df, ner_json) # Lọc Hãng
    top_3_indices = run_knn(filtered_df, ner_json)
    top_3_laptops = filtered_df.iloc[top_3_indices].to_dict('records')
    
    # 4. Gọi Ollama Generate Text
    ai_reply = call_ollama_text_generation(top_3_laptops)
    
    return {"reply": ai_reply, "laptops": top_3_laptops}