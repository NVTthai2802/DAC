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

KAFKA_TOPIC = "silver_prices_topic"
TICKER_SYMBOL = "SI=F"

print("SYSTEM DATA INGESTION (SILVER PRICE) HAS STARTED...")

def fetch_silver_price():
    try:
        ticker = yf.Ticker(TICKER_SYMBOL)
        current_price = ticker.fast_info.last_price
        
        payload = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "asset": "SILVER",
            "price": round(current_price, 2)
        }
        
        producer.send(KAFKA_TOPIC, value=payload)
        producer.flush()
        
        print(f"[SILVER] Update SILVER: ${payload['price']}")
        
    except Exception as e:
        print(f"Error updating Silver: {e}")

while True:
    fetch_silver_price()
    time.sleep(5)
