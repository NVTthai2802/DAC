import json
import time
from datetime import datetime
from kafka import KafkaProducer
import yfinance as yf

# Cấu hình Kafka
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

KAFKA_TOPIC = "oil_prices_topic"

TICKERS = {
    "OIL_WTI": "CL=F",
    "OIL_BRENT": "BZ=F"
}

print("HỆ THỐNG DATA INGESTION (GIÁ DẦU) ĐÃ KHỞI ĐỘNG...")

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