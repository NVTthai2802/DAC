import json
import time
import os
from datetime import datetime
from kafka import KafkaProducer
import yfinance as yf

# Cấu hình Kafka (hỗ trợ cả localhost và Docker)
KAFKA_BROKER = os.environ.get("KAFKA_BROKER", "localhost:9092")
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

KAFKA_TOPIC = "oil_prices_topic"

ALL_TICKERS = {
    "OIL_WTI": "CL=F",
    "OIL_BRENT": "BZ=F"
}

PRODUCER_INDEX = int(os.environ.get("PRODUCER_INDEX", "0"))
PRODUCER_TOTAL = int(os.environ.get("PRODUCER_TOTAL", "1"))

# Chuyển dict thành list các item để chia
items = list(ALL_TICKERS.items())
chunk_size = max(1, len(items) // PRODUCER_TOTAL)
start_idx = PRODUCER_INDEX * chunk_size
end_idx = start_idx + chunk_size if PRODUCER_INDEX < PRODUCER_TOTAL - 1 else len(items)

TICKERS = dict(items[start_idx:end_idx])

print(f"HỆ THỐNG DATA INGESTION (GIÁ DẦU) ĐÃ KHỞI ĐỘNG...")
print(f"-> Producer {PRODUCER_INDEX + 1}/{PRODUCER_TOTAL} | Quản lý {len(TICKERS)} mã: {list(TICKERS.keys())}")

def fetch_oil_prices():
    for asset_name, symbol in TICKERS.items():
        try:
            ticker = yf.Ticker(symbol)
            current_price = ticker.fast_info.last_price
            
            payload = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "asset": asset_name,
                "price": round(current_price, 2)
            }
            
            producer.send(KAFKA_TOPIC, value=payload)
            producer.flush()
            
            print(f"[DẦU] Cập nhật {asset_name}: ${payload['price']}")
            
        except Exception as e:
            print(f"Lỗi cập nhật {asset_name}: {e}")

while True:
    fetch_oil_prices()
    time.sleep(5)