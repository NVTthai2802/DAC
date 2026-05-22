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

KAFKA_TOPIC = "gold_prices_topic"
TICKER_SYMBOL = "GC=F"

print("HỆ THỐNG DATA INGESTION (GIÁ VÀNG) ĐÃ KHỞI ĐỘNG...")

def fetch_gold_price():
    try:
        ticker = yf.Ticker(TICKER_SYMBOL)
        current_price = ticker.fast_info.last_price
        
        payload = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "asset": "GOLD",
            "price": round(current_price, 2)
        }
        
        producer.send(KAFKA_TOPIC, value=payload)
        producer.flush()
        
        print(f"[VÀNG] Cập nhật GOLD: ${payload['price']}")
        
    except Exception as e:
        print(f"Lỗi cập nhật Vàng: {e}")

while True:
    fetch_gold_price()
    time.sleep(5)