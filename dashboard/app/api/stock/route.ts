import { NextResponse } from 'next/server';

export async function GET() {
  const druidUrl = `${process.env.DRUID_URL || 'http://localhost:8888'}/druid/v2/sql`;

  const sqlQuery = {
    query: `SELECT "ticker", 
                   LATEST("price", 100) as "price", 
                   LATEST("volume", 100) as "volume", 
                   LATEST("ref_price", 100) as "ref_price",
                   LATEST("ceil_price", 100) as "ceil_price",
                   LATEST("floor_price", 100) as "floor_price",
                   LATEST("total_vol", 100) as "total_vol",
                   LATEST("high", 100) as "high",
                   LATEST("low", 100) as "low",
                   LATEST("bid_1_price", 100) as "bid_1_price",
                   LATEST("bid_1_vol", 100) as "bid_1_vol",
                   LATEST("bid_2_price", 100) as "bid_2_price",
                   LATEST("bid_2_vol", 100) as "bid_2_vol",
                   LATEST("bid_3_price", 100) as "bid_3_price",
                   LATEST("bid_3_vol", 100) as "bid_3_vol",
                   LATEST("ask_1_price", 100) as "ask_1_price",
                   LATEST("ask_1_vol", 100) as "ask_1_vol",
                   LATEST("ask_2_price", 100) as "ask_2_price",
                   LATEST("ask_2_vol", 100) as "ask_2_vol",
                   LATEST("ask_3_price", 100) as "ask_3_price",
                   LATEST("ask_3_vol", 100) as "ask_3_vol",
                   MAX("__time") as "last_updated"
            FROM "vn_stock_topic"
            GROUP BY "ticker"
            ORDER BY "ticker" ASC`
  };

  try {
    // Thêm timeout 5 giây để tránh bị treo 5 phút khi Druid bị đơ
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(druidUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sqlQuery),
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const rawData = await res.json();

    if (!Array.isArray(rawData)) {
      console.error("Lỗi từ Druid:", rawData);
      return NextResponse.json({ error: 'Druid trả về lỗi', details: rawData }, { status: 500 });
    }

    const chartData = rawData.map((item: any) => {
      const dateObj = new Date(item.last_updated);

      const timeString = dateObj.toLocaleTimeString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      return {
        ticker: item.ticker,
        price: item.price || item.ref_price || 0,
        volume: item.volume || 0,
        ref_price: item.ref_price || 0,
        ceil_price: item.ceil_price || 0,
        floor_price: item.floor_price || 0,
        total_vol: item.total_vol || 0,
        high: item.high || 0,
        low: item.low || 0,
        bid_1_price: item.bid_1_price || 0,
        bid_1_vol: item.bid_1_vol || 0,
        bid_2_price: item.bid_2_price || 0,
        bid_2_vol: item.bid_2_vol || 0,
        bid_3_price: item.bid_3_price || 0,
        bid_3_vol: item.bid_3_vol || 0,
        ask_1_price: item.ask_1_price || 0,
        ask_1_vol: item.ask_1_vol || 0,
        ask_2_price: item.ask_2_price || 0,
        ask_2_vol: item.ask_2_vol || 0,
        ask_3_price: item.ask_3_price || 0,
        ask_3_vol: item.ask_3_vol || 0,
        last_updated: timeString,
      };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Lỗi hệ thống Next.js:", error);
    return NextResponse.json({ error: 'Lỗi kết nối Next.js -> Druid' }, { status: 500 });
  }
}
