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

KAFKA_TOPIC = "gold_prices_topic"
TICKER_SYMBOL = "GC=F"

print("HỆ THỐNG DATA INGESTION (GIÁ VÀNG) ĐÃ KHỞI ĐỘNG...")

PRODUCER_INDEX = int(os.environ.get("PRODUCER_INDEX", "0"))
PRODUCER_TOTAL = int(os.environ.get("PRODUCER_TOTAL", "1"))

if PRODUCER_TOTAL > 1:
    sleep_time = PRODUCER_INDEX * (5 / PRODUCER_TOTAL)
    print(f"-> Producer {PRODUCER_INDEX + 1}/{PRODUCER_TOTAL} | Đợi {sleep_time}s để giãn cách API...")
    time.sleep(sleep_time)

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