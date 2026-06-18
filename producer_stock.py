import json
import time
import os
from datetime import datetime
from kafka import KafkaProducer
from vnstock import Trading

# Cấu hình Kafka (hỗ trợ cả localhost và Docker)
KAFKA_BROKER = os.environ.get("KAFKA_BROKER", "localhost:9092")
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

KAFKA_TOPIC = "vn_stock_topic"

# VN30, HNX30 và một số mã phổ biến (khoảng 60 mã)
ALL_SYMBOLS = [
    'ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GAS', 'GVR', 'HDB', 'HPG', 
    'MBB', 'MSN', 'MWG', 'PLX', 'POW', 'SAB', 'SHB', 'SSB', 'SSI', 'STB', 
    'TCB', 'TPB', 'VCB', 'VHM', 'VIB', 'VIC', 'VJC', 'VNM', 'VPB', 'VRE',
    'BVS', 'CEO', 'DL1', 'DXMAC', 'HUT', 'IDC', 'L14', 'MBS', 'NDN', 'NTP',
    'NVB', 'PVS', 'SHS', 'TNG', 'VCS', 'VGS', 'VIF', 'VNR', 'KDH', 'NLG',
    'DGC', 'VCI', 'HCM', 'VND', 'HSG', 'NKG', 'DIG', 'DXG', 'PVD', 'KBC'
]

PRODUCER_INDEX = int(os.environ.get("PRODUCER_INDEX", "0"))
PRODUCER_TOTAL = int(os.environ.get("PRODUCER_TOTAL", "1"))

# Chia đều danh sách mã chứng khoán (Sharding)
chunk_size = max(1, len(ALL_SYMBOLS) // PRODUCER_TOTAL)
start_idx = PRODUCER_INDEX * chunk_size
end_idx = start_idx + chunk_size if PRODUCER_INDEX < PRODUCER_TOTAL - 1 else len(ALL_SYMBOLS)

SYMBOLS = ALL_SYMBOLS[start_idx:end_idx]

print(f"HỆ THỐNG DATA INGESTION (STOCK VN) KHỞI ĐỘNG...")
print(f"-> Producer {PRODUCER_INDEX + 1}/{PRODUCER_TOTAL} | Quản lý {len(SYMBOLS)} mã: {SYMBOLS[:3]}...")

def fetch_stock_prices():
    try:
        # Lấy dữ liệu từ vnstock (VCI)
        board = Trading(source='VCI').price_board(SYMBOLS)

        if board is None or board.empty:
            print("API vnstock returned no data! Maybe outside trading hours.")
            return

        for _, row in board.iterrows():
            ticker = row.get(('listing', 'symbol'), '')
            if not ticker:
                continue

            # Các mức giá trần, sàn, tham chiếu
            ref_price = row.get(('listing', 'ref_price'), 0)
            ceil_price = row.get(('listing', 'ceiling'), 0)
            floor_price = row.get(('listing', 'floor'), 0)

            # Giá và Khối lượng khớp lệnh
            match_price = row.get(('match', 'match_price'), 0)
            match_vol = row.get(('match', 'match_vol'), 0)
            
            # Tổng khối lượng và Cao/Thấp
            total_vol = row.get(('match', 'accumulated_volume'), 0)
            high = row.get(('match', 'highest'), 0)
            low = row.get(('match', 'lowest'), 0)

            # Dữ liệu dư mua (Bid)
            bid_1_price = row.get(('bid_ask', 'bid_1_price'), 0)
            bid_1_vol = row.get(('bid_ask', 'bid_1_volume'), 0)
            bid_2_price = row.get(('bid_ask', 'bid_2_price'), 0)
            bid_2_vol = row.get(('bid_ask', 'bid_2_volume'), 0)
            bid_3_price = row.get(('bid_ask', 'bid_3_price'), 0)
            bid_3_vol = row.get(('bid_ask', 'bid_3_volume'), 0)

            # Dữ liệu dư bán (Ask)
            ask_1_price = row.get(('bid_ask', 'ask_1_price'), 0)
            ask_1_vol = row.get(('bid_ask', 'ask_1_volume'), 0)
            ask_2_price = row.get(('bid_ask', 'ask_2_price'), 0)
            ask_2_vol = row.get(('bid_ask', 'ask_2_volume'), 0)
            ask_3_price = row.get(('bid_ask', 'ask_3_price'), 0)
            ask_3_vol = row.get(('bid_ask', 'ask_3_volume'), 0)

            payload = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "ticker": str(ticker).upper(),
                
                # Giá hiện tại để tương thích với Dashboard cũ
                "price": float(match_price) if match_price else float(ref_price),
                "volume": float(match_vol),

                # Dữ liệu mới cho Full Dashboard
                "ref_price": float(ref_price),
                "ceil_price": float(ceil_price),
                "floor_price": float(floor_price),
                "total_vol": float(total_vol),
                "high": float(high),
                "low": float(low),

                "bid_1_price": float(bid_1_price), "bid_1_vol": float(bid_1_vol),
                "bid_2_price": float(bid_2_price), "bid_2_vol": float(bid_2_vol),
                "bid_3_price": float(bid_3_price), "bid_3_vol": float(bid_3_vol),

                "ask_1_price": float(ask_1_price), "ask_1_vol": float(ask_1_vol),
                "ask_2_price": float(ask_2_price), "ask_2_vol": float(ask_2_vol),
                "ask_3_price": float(ask_3_price), "ask_3_vol": float(ask_3_vol),
            }

            producer.send(KAFKA_TOPIC, value=payload)

        producer.flush()
        print(f"[STOCK] Successfully sent data for {len(board)} tickers at {datetime.now().strftime('%H:%M:%S')}")

    except Exception as e:
        print(f"Error fetching Stock data: {e}")

while True:
    fetch_stock_prices()
    time.sleep(5) # Cập nhật nhanh hơn một chút cho Real-time Dashboard
