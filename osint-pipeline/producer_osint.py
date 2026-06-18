import feedparser
import json
import time as time_lib
from datetime import datetime
from kafka import KafkaProducer
import spacy
from geopy.geocoders import Nominatim

print("⏳ Đang tải mô hình NLP (spaCy)...")
nlp = spacy.load("en_core_web_sm")
geolocator = Nominatim(user_agent="osint_data_hub")

# Bộ nhớ đệm giúp giảm tải API cho các địa danh lặp lại thường xuyên
location_cache = {}

def get_coordinates_with_ner(title, summary):
    """
    Sử dụng AI để đọc hiểu và tự động trích xuất tọa độ địa lý.
    """
    # Gộp tiêu đề và nội dung để AI có nhiều ngữ cảnh phân tích hơn
    text_to_analyze = f"{title}. {summary}"
    
    # Đưa văn bản qua màng lọc NLP
    doc = nlp(text_to_analyze)
    
    # Nhặt ra các từ được AI gán nhãn là GPE (Quốc gia/Thành phố) hoặc LOC (Địa lý)
    locations = [ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]]
    
    if not locations:
        return None, None, None
        
    # Lấy địa danh xuất hiện ĐẦU TIÊN (thường là điểm nóng chính của bản tin)
    primary_location = locations[0]
    
    # 1. Nếu địa danh này đã từng tìm rồi -> Lấy luôn tọa độ trong RAM ra xài
    if primary_location in location_cache:
        return location_cache[primary_location]
        
    # 2. Nếu là địa danh mới -> Lên OpenStreetMap để hỏi tọa độ
    try:
        time_lib.sleep(1) # Tôn trọng giới hạn 1 request/giây của hãng
        geo_data = geolocator.geocode(primary_location)
        
        if geo_data:
            result = (geo_data.latitude, geo_data.longitude, primary_location)
            # Lưu lại vào Cache để lần sau không phải hỏi lại
            location_cache[primary_location] = result 
            return result
    except Exception as e:
        print(f"⚠️ Lỗi kết nối bản đồ tại {primary_location}: {e}")
        
    return None, None, None
import os

KAFKA_BROKER = os.environ.get("KAFKA_BROKER", "localhost:9092")
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
# KAFKA_TOPIC = "global_conflict_events"
KAFKA_TOPIC = "osint_events_v2"

RSS_URLS = [
    "https://www.aljazeera.com/xml/rss/all.xml"
]

seen_entries = set() # Bộ nhớ tạm để chống gửi trùng tin

print("📡 HỆ THỐNG THU THẬP OSINT ĐÃ KHỞI ĐỘNG (CHẾ ĐỘ: LẤY TOÀN BỘ TIN TỨC)...")

def fetch_and_produce():
    for url in RSS_URLS:
        feed = feedparser.parse(url)
        
        # Tự động gán tên nguồn dựa vào link RSS
        source_name = "Al Jazeera" if "aljazeera" in url else "Internet News"
        
        for entry in feed.entries:
            # Lấy ID của tin tức (nếu không có thì lấy Link)
            entry_id = getattr(entry, "id", getattr(entry, "link", ""))
            
            # Nếu tin này đã quét rồi hoặc không có ID thì bỏ qua
            if not entry_id or entry_id in seen_entries:
                continue
                
            # Trích xuất dữ liệu an toàn
            title = getattr(entry, "title", "")
            link = getattr(entry, "link", "")
            summary = getattr(entry, "description", "Không có tóm tắt")
            
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                dt = datetime.fromtimestamp(time_lib.mktime(entry.published_parsed))
                article_time = dt.isoformat() + "Z"
            else:
                article_time = datetime.utcnow().isoformat() + "Z"

            lat, lon, detected_location = get_coordinates_with_ner(title, summary)
            
            # ĐÓNG GÓI TOÀN BỘ TIN TỨC VÀO PAYLOAD (Không kiểm tra từ khóa)
            data = {
                "timestamp": article_time, 
                "title": title,
                "source": source_name, 
                "summary": summary,
                "link": link,
                "matched_keywords": [detected_location] if detected_location else ["Global News"],
                "latitude": lat,   
                "longitude": lon,
                "status": "raw_unverified"
            }

            # Gửi vào Kafka
            producer.send(KAFKA_TOPIC, value=data)
            producer.flush() 

            if detected_location:
                print(f"[📍 {detected_location.upper()}] {title}")
            else:
                print(f"[🔥 TIN MỚI] {title}")
            
            # ĐÁNH DẤU LÀ ĐÃ ĐỌC
            seen_entries.add(entry_id)

while True:
    try:
        fetch_and_produce()
    except Exception as e:
        print(f"⚠️ Lỗi kết nối: {e}")
        
    time_lib.sleep(60) # Cứ 1 phút quét RSS một lần