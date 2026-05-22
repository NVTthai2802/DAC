import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Lấy tên cặp tiền từ URL (Mặc định là EUR/USD)
  const { searchParams } = new URL(request.url);
  const asset = searchParams.get('asset') || 'EUR/USD';

  const druidUrl = 'http://localhost:8888/druid/v2/sql';
  
  // Dùng WHERE để lấy đúng 1 cặp tiền duy nhất, chống lỗi "Điện tâm đồ"
  const sqlQuery = {
    query: `SELECT __time AS "time", "asset", "price"
            FROM "forex_rates_topic"
            WHERE "asset" = '${asset}'
            ORDER BY __time DESC 
            LIMIT 500`
  };

  try {
    const res = await fetch(druidUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sqlQuery),
      cache: 'no-store' 
    });

    const rawData = await res.json();
    if (!Array.isArray(rawData)) return NextResponse.json({ error: 'Lỗi Druid', details: rawData }, { status: 500 });
    
    const chronologicalData = rawData.reverse();

    const chartData = chronologicalData.map((item: any, index: number, arr: any[]) => {
        const dateObj = new Date(item.time);
        const timeString = dateObj.toLocaleTimeString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        
        let change_abs = 0;
        let change_pct = 0;
        
        if (index > 0 && arr[index - 1].price) {
            const prevPrice = arr[index - 1].price;
            change_abs = item.price - prevPrice;
            change_pct = (change_abs / prevPrice) * 100;
        }

        return { 
          ...item, 
          time: timeString, 
          change_abs,
          change_pct
        };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi kết nối API' }, { status: 500 });
  }
}