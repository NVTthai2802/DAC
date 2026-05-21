import os
import glob
import shutil
import time
import pandas as pd
import json
from datetime import datetime
from kafka import KafkaProducer

# Khai báo đường dẫn
RAW_FOLDER = r"C:\Project TTS\Octoparse\Giá Dầu Thế Giới - Investing.com\Giá dầu thế giới WTI ! Giá dầu hôm nay - Investing.com"
ARCHIVE_FOLDER = r"C:\Project TTS\Octoparse\Archive_Oil"
os.makedirs(ARCHIVE_FOLDER, exist_ok=True)

# Khởi tạo Kafka Producer
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
KAFKA_TOPIC = "oil_prices_topic"

def process_new_files():
    csv_files = glob.glob(os.path.join(RAW_FOLDER, "*.csv"))
    if not csv_files:
        return

    for file_path in csv_files:
        file_name = os.path.basename(file_path)
        try:
            print("-" * 50)
            print(f"Đang xử lý: {file_name}")
            
            df = pd.read_csv(file_path)
            
            # LỚP BẢO VỆ 1: Bỏ qua nếu file CSV rỗng hoàn toàn
            if df.empty:
                print(f"File rỗng không có dữ liệu, bỏ qua...")
                timestamp_str = datetime.now().strftime('%Y%m%d%H%M%S')
                archive_name = f"{os.path.splitext(file_name)[0]}_{timestamp_str}.csv"
                shutil.move(file_path, os.path.join(ARCHIVE_FOLDER, archive_name))
                continue

            raw_data = df.iloc[0].to_dict()
            
            # LỚP BẢO VỆ 2: Bỏ qua nếu cột thời gian hoặc giá bị trống (NaN)
            time_str = str(raw_data.get('Field4', '')).strip()
            if pd.isna(raw_data.get('Field4')) or time_str.lower() == 'nan' or time_str == '':
                print(f"Dữ liệu cào bị lỗi (chứa NaN hoặc rỗng), từ chối đẩy vào Kafka...")
                timestamp_str = datetime.now().strftime('%Y%m%d%H%M%S')
                archive_name = f"{os.path.splitext(file_name)[0]}_{timestamp_str}.csv"
                shutil.move(file_path, os.path.join(ARCHIVE_FOLDER, archive_name))
                continue
            
            # TRANSFORM (Làm sạch)
            price = float(str(raw_data['Field1']).replace(',', ''))
            f2_str = str(raw_data['Field2']).strip()
            f3_str = str(raw_data['Field3']).strip()
            
            # Tự động nhận diện cột Phần trăm (%) và Tuyệt đối
            if '%' in f3_str:
                raw_pct = f3_str
                raw_abs = f2_str
            else:
                raw_pct = f2_str
                raw_abs = f3_str
            
            # Dọn dẹp sạch sẽ mọi ký tự lạ
            change_pct = float(raw_pct.replace('(', '').replace(')', '').replace('%', '').replace('+', '').replace(',', ''))
            change_abs = float(raw_abs.replace('+', '').replace(',', ''))
            
            full_time_str = f"{datetime.now().strftime('%Y-%m-%d')} {time_str}"
            dt_obj = datetime.strptime(full_time_str, '%Y-%m-%d %H:%M:%S')
            iso_timestamp = dt_obj.isoformat() + "Z"
            
            clean_data = {
                "timestamp": iso_timestamp,
                "asset": "Oil_Futures",
                "price": price,
                "change_pct": change_pct,
                "change_abs": change_abs
            }
            
            print("✨ Dữ liệu sạch:", clean_data)
            
            # ĐẨY VÀO KAFKA
            producer.send(KAFKA_TOPIC, value=clean_data)
            producer.flush()
            print(f"Đã bắn dữ liệu vào Kafka Topic: {KAFKA_TOPIC}")
            
            # ARCHIVE
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            archive_name = f"{os.path.splitext(file_name)[0]}_{timestamp}.csv"
            shutil.move(file_path, os.path.join(ARCHIVE_FOLDER, archive_name))
            
        except Exception as e:
            print(f"Lỗi xử lý {file_name}: {e}")
            # Vẫn di chuyển file lỗi vào archive để luồng không bị kẹt mãi ở 1 file
            try:
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                archive_name = f"ERROR_{os.path.splitext(file_name)[0]}_{timestamp}.csv"
                shutil.move(file_path, os.path.join(ARCHIVE_FOLDER, archive_name))
            except:
                pass

print("HỆ THỐNG KAFKA PRODUCER BẮT ĐẦU HOẠT ĐỘNG...")
while True:
    process_new_files()
    time.sleep(5)