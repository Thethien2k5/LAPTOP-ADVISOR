import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import os

# Đường dẫn tới file dataset
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "model", "laptops_cleaned_v1.csv"))

# Load dataset
if not os.path.exists(DATASET_PATH):
    raise FileNotFoundError(f"Không tìm thấy file dataset tại {DATASET_PATH}")

df = pd.read_csv(DATASET_PATH)

# Chuẩn hóa dữ liệu cột Price và RAM
df['price'] = pd.to_numeric(df['price'], errors='coerce')
df['ram_num'] = pd.to_numeric(df['ram_num'], errors='coerce')
df = df.dropna(subset=['price', 'ram_num'])

# Khởi tạo và fit StandardScaler cho toàn bộ tập dữ liệu
scaler = StandardScaler()
df[['scaled_price', 'scaled_ram']] = scaler.fit_transform(df[['price', 'ram_num']])

def query_laptops(brand: str = None, price_vnd: float = None, ram: float = None):
    """
    Tìm kiếm Top 3 Laptop phù hợp nhất sử dụng KNN.
    Tỷ lệ quy đổi: 1 INR = 300 VND
    """
    # 1. Xử lý quy đổi giá tiền VND -> INR
    if price_vnd is not None and price_vnd > 0:
        price_inr = price_vnd / 300.0
    else:
        # Nếu không có giá, mặc định lấy median price của dataset
        price_inr = float(df['price'].median())

    # 2. Xử lý RAM
    if ram is None or ram <= 0:
        # Mặc định lấy RAM trung bình
        ram = 8.0

    # 3. Lọc Hãng (Hard filter)
    filtered_df = df.copy()
    if brand:
        # Chuẩn hóa hãng và lọc không phân biệt hoa thường
        brand_clean = brand.strip().lower()
        # Dataset brand_name có thể có khoảng trắng thừa
        filtered_df = df[df['brand_name'].str.strip().str.lower() == brand_clean]
        
        # Nếu lọc xong không có máy nào của hãng đó, fallback về tìm tất cả
        if filtered_df.empty:
            print(f"Warning: Không tìm thấy laptop hãng '{brand}', fallback tìm kiếm trên toàn bộ dữ liệu.")
            filtered_df = df.copy()

    # 4. Chuẩn bị dữ liệu cho KNN
    X_train = filtered_df[['scaled_price', 'scaled_ram']].values
    
    # Scale query vector [Price, RAM]
    query_vector = np.array([[price_inr, ram]])
    query_scaled = scaler.transform(query_vector)

    # 5. Huấn luyện KNN trên dữ liệu đã lọc và query
    k = min(3, len(filtered_df))
    if k == 0:
        return []

    nn = NearestNeighbors(n_neighbors=k, metric='euclidean')
    nn.fit(X_train)

    distances, indices = nn.kneighbors(query_scaled)
    
    # 6. Trả về kết quả dưới dạng danh sách dicts
    top_laptops = filtered_df.iloc[indices[0]].copy()
    top_laptops['distance'] = distances[0]
    
    # Thay thế NaN bằng None để tránh lỗi serialize JSON khi các cột phụ bị khuyết dữ liệu
    top_laptops = top_laptops.astype(object).where(pd.notnull(top_laptops), None)
    
    return top_laptops.to_dict(orient='records')

if __name__ == "__main__":
    # Test độc lập thuật toán KNN
    print("--- TESTING KNN INDEPENDENTLY ---")
    
    # Test case 1: Tìm máy Asus tầm giá 20 triệu VND (~66k INR), RAM 8GB
    print("\nTest case 1: Asus, 20 triệu VND, RAM 8GB")
    results = query_laptops(brand="Asus", price_vnd=20000000, ram=8)
    for idx, r in enumerate(results):
        print(f"{idx+1}. {r['brand_name']} - {r['model']} | Price: {r['price']} INR (~{int(r['price']*300):,} VND) | RAM: {r['ram_num']}GB | Dist: {r['distance']:.4f}")

    # Test case 2: Tìm máy bất kỳ tầm 45 triệu VND (~150k INR), RAM 16GB
    print("\nTest case 2: Any brand, 45 triệu VND, RAM 16GB")
    results = query_laptops(brand=None, price_vnd=45000000, ram=16)
    for idx, r in enumerate(results):
        print(f"{idx+1}. {r['brand_name']} - {r['model']} | Price: {r['price']} INR (~{int(r['price']*300):,} VND) | RAM: {r['ram_num']}GB | Dist: {r['distance']:.4f}")
