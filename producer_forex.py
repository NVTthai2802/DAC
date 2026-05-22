import json
import time
import requests
from datetime import datetime
from kafka import KafkaProducer

# Cấu hình Kafka
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

KAFKA_TOPIC = "forex_rates_topic"
API_KEY = "YOUR_API_KEY_HERE"  # <-- ĐIỀN API KEY CỦA BẠN VÀO ĐÂY

print("💱 HỆ THỐNG DATA INGESTION (FOREX - EXCHANGERATE-API) ĐÃ KHỞI ĐỘNG...")

def send_to_kafka(asset_name, price):
    payload = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "asset": asset_name,
        "price": price
    }
    producer.send(KAFKA_TOPIC, value=payload)
    producer.flush()
    print(f"[💱 FOREX] Cập nhật {asset_name}: {price:.5f}")

def fetch_forex_rates():
    # Gọi 1 lần duy nhất lấy tất cả tỷ giá so với USD để tiết kiệm request
    url = f"https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD"
    
    try:
        response = requests.get(url)
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
            print(f"⚠️ Lỗi từ API: {data.get('error-type', 'Lý do không xác định')}")

    except Exception as e:
        print(f"⚠️ Lỗi kết nối đến máy chủ ExchangeRate: {e}")

while True:
    fetch_forex_rates()
    
    # ⚠️ CẢNH BÁO HẠN MỨC (RATE LIMIT):
    # Gói Free của ExchangeRate-API cho phép 1,500 requests/tháng.
    # - Nếu để 60 giây/lần: Tốn 1,440 requests/ngày -> Hết hạn mức trong 1 ngày!
    # - Mức an toàn cho gói Free: 3600 (1 tiếng/lần) hoặc chạy thủ công khi cần test.
    # Tạm thời để 60 giây cho bạn test giao diện:
    time.sleep(60)