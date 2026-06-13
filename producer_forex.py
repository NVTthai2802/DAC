# -*- coding: utf-8 -*-
import json
import time
import os
import sys
import requests
from datetime import datetime
from kafka import KafkaProducer
from dotenv import load_dotenv

# Load biến môi trường từ file .env
load_dotenv()

# Cấu hình Kafka
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

KAFKA_TOPIC = "forex_rates_topic"
API_KEY = os.getenv("FOREX_API_KEY")

if not API_KEY or API_KEY == "your_api_key_here":
    print("⚠️ LỖI: Chưa cấu hình FOREX_API_KEY trong file .env")
    print("Vui lòng copy file .env.example thành .env và điền API key của bạn.")
    sys.exit(1)

# ============================================================
# CẤU HÌNH REQUEST COUNTER
# ============================================================
MONTHLY_LIMIT = 1500          # Giới hạn gói Free
WARNING_THRESHOLD = 1200      # Cảnh báo khi đạt 80%
HARD_STOP_THRESHOLD = 1450    # Tự dừng khi đạt ngưỡng này (dự phòng 50)
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "forex_request_log.json")

# ============================================================
# HÀM QUẢN LÝ REQUEST COUNTER
# ============================================================

def load_request_log():
    """Đọc file log request. Tự reset nếu sang tháng mới."""
    current_month = datetime.now().strftime("%Y-%m")
    
    default_log = {
        "month": current_month,
        "total_requests": 0,
        "session_requests": 0,
        "last_request_time": None,
        "started_at": datetime.now().isoformat()
    }
    
    if not os.path.exists(LOG_FILE):
        return default_log
    
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            log = json.load(f)
        
        # Nếu sang tháng mới → reset bộ đếm
        if log.get("month") != current_month:
            print(f"🔄 Sang tháng mới ({current_month})! Reset bộ đếm request.")
            return default_log
        
        # Reset session counter (mỗi lần chạy lại producer là phiên mới)
        log["session_requests"] = 0
        log["started_at"] = datetime.now().isoformat()
        return log
        
    except (json.JSONDecodeError, KeyError):
        return default_log

def save_request_log(log):
    """Lưu trạng thái bộ đếm ra file."""
    try:
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"⚠️ Không thể lưu log request: {e}")

def display_request_counter(log):
    """Hien thi dashboard theo doi request."""
    total = log["total_requests"]
    session = log["session_requests"]
    remaining = MONTHLY_LIMIT - total
    percentage = (total / MONTHLY_LIMIT) * 100
    last_time = log.get("last_request_time", "N/A")
    
    # Tao thanh tien trinh (20 ky tu)
    filled = int(percentage / 5)
    bar = "#" * filled + "-" * (20 - filled)
    
    # Chon mau canh bao
    if total >= HARD_STOP_THRESHOLD:
        status_icon = "[!!!]"
        status_text = "NGUY HIEM - SAP HET HAN MUC!"
    elif total >= WARNING_THRESHOLD:
        status_icon = "[!!]"
        status_text = "CANH BAO - Dang gan gioi han"
    else:
        status_icon = "[OK]"
        status_text = "Binh thuong"
    
    print()
    print("  +======================================================+")
    print("  :          FOREX REQUEST MONITOR                       :")
    print("  +======================================================+")
    print(f"  :  Phien hien tai:   {session:>6,} requests                :")
    print(f"  :  Tong thang nay:   {total:>6,} / {MONTHLY_LIMIT:,} requests         :")
    print(f"  :  Con lai:          {remaining:>6,} requests                :")
    print(f"  :  [{bar}]  {percentage:>5.1f}%              :")
    print(f"  :  Trang thai:       {status_icon} {status_text:<26s}  :")
    print(f"  :  Lan goi cuoi:     {str(last_time):<32s}:")
    print("  +======================================================+")
    print()

def increment_request(log):
    """Tăng bộ đếm request và cập nhật thời gian."""
    log["total_requests"] += 1
    log["session_requests"] += 1
    log["last_request_time"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    save_request_log(log)
    return log

def check_limit(log):
    """Kiểm tra xem có vượt giới hạn chưa. Trả về True nếu OK, False nếu phải dừng."""
    total = log["total_requests"]
    
    if total >= HARD_STOP_THRESHOLD:
        print()
        print("  +======================================================+")
        print("  :  [STOP] DA DAT GIOI HAN AN TOAN (1,450/1,500)!      :")
        print("  :  Producer tu dong DUNG de bao ve han muc API.        :")
        print("  :  Bo dem se tu reset vao dau thang sau.               :")
        print("  +======================================================+")
        print()
        return False
    
    if total >= WARNING_THRESHOLD:
        print(f"  [!!] CANH BAO: Da dung {total}/{MONTHLY_LIMIT} requests ({total/MONTHLY_LIMIT*100:.1f}%)!")
    
    return True

# ============================================================
# KHỞI ĐỘNG
# ============================================================

# Thiet lap stdout encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print()
print("  +======================================================+")
print("  :  HE THONG DATA INGESTION (FOREX) DA KHOI DONG        :")
print("  :  API: ExchangeRate-API (Goi Free: 1,500 req/thang)   :")
print("  :  Co tich hop REQUEST COUNTER de theo doi han muc      :")
print("  +======================================================+")

# Tải bộ đếm từ file (nếu có)
request_log = load_request_log()

print(f"\n  File log: {LOG_FILE}")
print(f"  Thang: {request_log['month']}")
print(f"  Da dung truoc do: {request_log['total_requests']} requests")

# Hiển thị trạng thái ban đầu
display_request_counter(request_log)

# ============================================================
# HÀM GỬI DỮ LIỆU
# ============================================================

def send_to_kafka(asset_name, price):
    payload = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "asset": asset_name,
        "price": price
    }
    producer.send(KAFKA_TOPIC, value=payload)
    producer.flush()
    print(f"  [FOREX] Cap nhat {asset_name}: {price:.5f}")

def fetch_forex_rates():
    global request_log
    
    # Kiểm tra giới hạn trước khi gọi API
    if not check_limit(request_log):
        return False  # Báo hiệu phải dừng
    
    # Gọi 1 lần duy nhất lấy tất cả tỷ giá so với USD để tiết kiệm request
    url = f"https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD"
    
    try:
        response = requests.get(url)
        
        # ĐẾM REQUEST (dù thành công hay thất bại, API vẫn tính 1 request)
        request_log = increment_request(request_log)
        
        data = response.json()

        if data.get("result") == "success":
            rates = data["conversion_rates"]
            
            # 1. Lấy tỷ giá USD/JPY
            if "JPY" in rates:
                send_to_kafka("USD/JPY", rates["JPY"])
                
            # 2. Lấy tỷ giá USD/VND
            if "VND" in rates:
                send_to_kafka("USD/VND", rates["VND"])
                
            # 3. Tính tỷ giá EUR/USD
            # Vì API trả về USD/EUR, ta lấy 1 chia cho số đó sẽ ra EUR/USD
            if "EUR" in rates:
                eur_usd = 1.0 / rates["EUR"]
                send_to_kafka("EUR/USD", eur_usd)
        else:
            print(f"  [!] Loi tu API: {data.get('error-type', 'Ly do khong xac dinh')}")

    except Exception as e:
        print(f"  [!] Loi ket noi den may chu ExchangeRate: {e}")
    
    # Hiển thị bảng theo dõi sau mỗi lần gọi
    display_request_counter(request_log)
    
    return True  # OK, tiếp tục

# ============================================================
# VÒNG LẶP CHÍNH
# ============================================================

while True:
    should_continue = fetch_forex_rates()
    
    if not should_continue:
        print("  [*] Producer đã tự động dừng do đạt giới hạn request.")
        break
    
    # ⚠️ CẢNH BÁO HẠN MỨC (RATE LIMIT):
    # Gói Free của ExchangeRate-API cho phép 1,500 requests/tháng.
    # - Nếu để 60 giây/lần: Tốn 1,440 requests/ngày -> Hết hạn mức trong 1 ngày!
    # - Mức an toàn cho gói Free: 3600 (1 tiếng/lần) hoặc chạy thủ công khi cần test.
    # Tạm thời để 60 giây cho bạn test giao diện:
    time.sleep(60)