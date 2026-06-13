import json
import os

# -------------------------------------------------------------------
# generate_info.py
# Script tu dong tao va "rai" file info.json vao tung thu muc pipeline
# Chay: python generate_info.py
# -------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def export_info_json(folder_name, info_data):
    """Tao thu muc (neu chua co) va ghi file info.json vao do."""
    folder_path = os.path.join(BASE_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, "info.json")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(info_data, f, ensure_ascii=False, indent=4)

    print(f"[OK] Da tao: {file_path}")


# ===================================================================
# DINH NGHIA METADATA CHO TUNG LUONG DU LIEU
# ===================================================================

datasets = {

    # ------ 1. CHUNG KHOAN VIET NAM ------
    "vn-stock-pipeline": {
        "is_timeseries": True,
        "thong_tin": "Du lieu khop lenh Chung khoan Viet Nam (VN30, HNX30 va cac ma pho bien)",
        "don_vi": "VND (Gia), Co phieu (Khoi luong)",
        "nguon": {
            "ten": "TCBS / VCI",
            "url": "https://github.com/thinh-vu/vnstock"
        },
        "phuong_thuc": "Python SDK (vnstock Trading API)",
        "tan_suat": "5 giay / lan",
        "kafka_topic": "vn_stock_topic",
        "druid_datasource": "vn_stock_topic",
        "producer_file": "producer_stock.py",
        "supervisor_file": "kafka_stock_supervisor.json",
        "so_luong_ma": 60,
        "cac_truong_du_lieu": [
            "ticker", "price", "volume",
            "ref_price", "ceil_price", "floor_price",
            "total_vol", "high", "low",
            "bid_1_price", "bid_1_vol", "bid_2_price", "bid_2_vol", "bid_3_price", "bid_3_vol",
            "ask_1_price", "ask_1_vol", "ask_2_price", "ask_2_vol", "ask_3_price", "ask_3_vol"
        ],
        "ghi_chu": "Chi hoat dong trong gio hanh chinh (9h-15h). Bo qua cac ma co gia = 0. Du lieu gom 3 buoc gia mua/ban tot nhat.",
        "type_data": "Real-time Streaming"
    },

    # ------ 2. GIA VANG THE GIOI ------
    "gold-pipeline": {
        "is_timeseries": True,
        "thong_tin": "Gia Vang the gioi (Gold Futures - GC=F)",
        "don_vi": "USD / Troy Ounce",
        "nguon": {
            "ten": "Yahoo Finance",
            "url": "https://finance.yahoo.com/quote/GC=F/"
        },
        "phuong_thuc": "Python SDK (yfinance - ticker.fast_info.last_price)",
        "tan_suat": "5 giay / lan",
        "kafka_topic": "gold_prices_topic",
        "druid_datasource": "gold_prices_topic",
        "producer_file": "producer_gold.py",
        "supervisor_file": "kafka_gold_supervisor.json",
        "cac_truong_du_lieu": ["asset", "price"],
        "ghi_chu": "Su dung ticker GC=F (COMEX Gold Futures). Gia cap nhat 24/5 theo gio thi truong My.",
        "type_data": "Real-time Streaming"
    },

    # ------ 3. GIA BAC THE GIOI ------
    "silver-pipeline": {
        "is_timeseries": True,
        "thong_tin": "Gia Bac the gioi (Silver Futures - SI=F)",
        "don_vi": "USD / Troy Ounce",
        "nguon": {
            "ten": "Yahoo Finance",
            "url": "https://finance.yahoo.com/quote/SI=F/"
        },
        "phuong_thuc": "Python SDK (yfinance - ticker.fast_info.last_price)",
        "tan_suat": "5 giay / lan",
        "kafka_topic": "silver_prices_topic",
        "druid_datasource": "silver_prices_topic",
        "producer_file": "producer_silver.py",
        "supervisor_file": "kafka_silver_supervisor.json",
        "cac_truong_du_lieu": ["asset", "price"],
        "ghi_chu": "Su dung ticker SI=F (COMEX Silver Futures). Gia cap nhat 24/5 theo gio thi truong My.",
        "type_data": "Real-time Streaming"
    },

    # ------ 4. GIA DAU THO THE GIOI ------
    "oil-pipeline": {
        "is_timeseries": True,
        "thong_tin": "Gia Dau Tho the gioi (WTI Crude Oil CL=F va Brent Crude BZ=F)",
        "don_vi": "USD / Thung (Barrel)",
        "nguon": {
            "ten": "Yahoo Finance",
            "url": "https://finance.yahoo.com/quote/CL=F/"
        },
        "phuong_thuc": "Python SDK (yfinance - ticker.fast_info.last_price)",
        "tan_suat": "5 giay / lan",
        "kafka_topic": "oil_prices_topic",
        "druid_datasource": "oil_prices_topic",
        "producer_file": "oil-pipeline/producer_oil.py",
        "supervisor_file": "kafka_oil_supervisor.json",
        "cac_loai_dau": {
            "OIL_WTI": "CL=F (West Texas Intermediate)",
            "OIL_BRENT": "BZ=F (Brent Crude - Bien Bac)"
        },
        "cac_truong_du_lieu": ["asset", "price"],
        "ghi_chu": "Thu thap dong thoi 2 loai dau. Producer nam trong thu muc oil-pipeline/. Kafka dung cong 29092 (Docker internal).",
        "type_data": "Real-time Streaming"
    },

    # ------ 5. TY GIA NGOAI HOI (FOREX) ------
    "forex-pipeline": {
        "is_timeseries": True,
        "thong_tin": "Ty gia Ngoai hoi (Forex) - USD/JPY, USD/VND, EUR/USD",
        "don_vi": "Ty le hoi doai",
        "nguon": {
            "ten": "ExchangeRate-API",
            "url": "https://www.exchangerate-api.com/"
        },
        "phuong_thuc": "REST API (GET https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD)",
        "tan_suat": "60 giay / lan (khuyen nghi 3600 giay cho goi Free)",
        "kafka_topic": "forex_rates_topic",
        "druid_datasource": "forex_rates_topic",
        "producer_file": "producer_forex.py",
        "supervisor_file": "kafka_forex_supervisor.json",
        "cac_cap_tien": ["USD/JPY", "USD/VND", "EUR/USD"],
        "cac_truong_du_lieu": ["asset", "price"],
        "ghi_chu": "Dung chien thuat Base-USD de tiet kiem so luong API call. Goi Free: 1,500 requests/thang. Muc an toan: 1 gio/lan.",
        "type_data": "Real-time Streaming"
    },

    # ------ 6. OSINT (TINH BAO NGUON MO) ------
    "osint-pipeline": {
        "is_timeseries": True,
        "thong_tin": "Thu thap va phan tich tin tuc quoc te tu nguon mo (OSINT) kem trich xuat dia ly tu dong",
        "don_vi": "Bai bao / Su kien",
        "nguon": {
            "ten": "Al Jazeera RSS",
            "url": "https://www.aljazeera.com/xml/rss/all.xml"
        },
        "phuong_thuc": "RSS Parsing (feedparser) + NLP NER (spaCy en_core_web_sm) + Geocoding (geopy/Nominatim)",
        "tan_suat": "60 giay / lan (quet RSS)",
        "kafka_topic": "osint_events_v2",
        "druid_datasource": "osint_events_v2",
        "producer_file": "osint-pipeline/producer_osint.py",
        "supervisor_file": "kafka_osint_supervisor.json",
        "cac_truong_du_lieu": [
            "title", "source", "summary", "link",
            "matched_keywords", "latitude", "longitude", "status"
        ],
        "cong_nghe_AI": {
            "NLP_model": "spaCy en_core_web_sm",
            "NER_labels": ["GPE (Quoc gia/Thanh pho)", "LOC (Dia ly)"],
            "geocoding": "OpenStreetMap / Nominatim"
        },
        "ghi_chu": "Co bo nho dem (cache) de giam tai API geocoding. Co chong gui trung tin (seen_entries). Lay TOAN BO tin tuc, khong loc tu khoa.",
        "type_data": "Real-time Streaming / Event-driven"
    }
}


# ===================================================================
# THUC THI
# ===================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("  AUTO-GENERATE PIPELINE METADATA (info.json)")
    print("=" * 60)
    print()

    for folder, data in datasets.items():
        export_info_json(folder, data)

    print()
    print(f"[DONE] Da tao {len(datasets)} file info.json thanh cong!")
    print("=" * 60)
