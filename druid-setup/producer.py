from kafka import KafkaProducer
import json
from datetime import datetime

producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

data = {
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "price": 3380.5,
    "change_pct": 0.21,
    "change_abs": 7.2
}

producer.send(
    'oil_prices_topic',
    data
)

producer.flush()

print("Sent:", data)