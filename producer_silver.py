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
