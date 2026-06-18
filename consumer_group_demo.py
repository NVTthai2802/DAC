import os
import sys
import json
import time
from kafka import KafkaConsumer

# Lấy cấu hình broker từ môi trường hoặc mặc định localhost (nếu chạy local)
KAFKA_BROKER = os.environ.get("KAFKA_BROKER", "localhost:9092")

# Tên nhóm consumer - những consumer có chung tên nhóm sẽ chia sẻ tải
GROUP_ID = "octoparse-demo-group"

# Topic nhiều partition để test Auto Rebalance
TOPIC = "vn_stock_topic"

def main():
    print("="*60)
    print("  KAFKA CONSUMER GROUP AUTO-REBALANCE DEMO")
    print(f"  Broker: {KAFKA_BROKER}")
    print(f"  Topic: {TOPIC}")
    print(f"  Group ID: {GROUP_ID}")
    print("="*60)
    print("Đang khởi tạo Consumer và tham gia vào Group...")

    try:
        consumer = KafkaConsumer(
            TOPIC,
            bootstrap_servers=[KAFKA_BROKER],
            group_id=GROUP_ID,
            auto_offset_reset='latest',  # Chỉ lấy data mới
            enable_auto_commit=True,
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
    except Exception as e:
        print(f"Lỗi kết nối Kafka: {e}")
        sys.exit(1)

    print("✅ Đã tham gia Group thành công. Đang chờ được phân công (assign) Partitions...")
    print("Thử mở thêm 1 terminal khác và chạy script này để xem quá trình Rebalance nhé!\n")

    current_partitions = set()

    try:
        for message in consumer:
            # Lấy danh sách các partition mà consumer này đang được giao xử lý
            assigned_partitions = consumer.assignment()
            new_partitions = {p.partition for p in assigned_partitions}
            
            # Nếu danh sách partition thay đổi (Do có consumer mới vào hoặc cũ rời đi)
            if new_partitions != current_partitions:
                print("\n" + "*"*50)
                print("🔄 KAFKA REBALANCE HOẠT ĐỘNG!")
                print(f"Danh sách Partitions đang đảm nhận: {new_partitions}")
                print("*"*50 + "\n")
                current_partitions = new_partitions

            # In ra thông tin message và partition chứa nó
            val = message.value
            ticker = val.get('ticker', 'UNKNOWN')
            price = val.get('price', 0)
            print(f"[Partition {message.partition}] Xử lý mã: {ticker} - Giá: {price}")
            
            time.sleep(0.1) # Làm chậm một xíu để dễ nhìn

    except KeyboardInterrupt:
        print("\n👋 Đang thoát Consumer. Kafka sẽ tự động thu hồi partition và chia lại cho các node còn sống!")
        consumer.close()

if __name__ == "__main__":
    main()
