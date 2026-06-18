import { NextResponse } from 'next/server';

export async function GET() {
  const druidUrl = `${process.env.DRUID_URL || 'http://localhost:8888'}/druid/v2/sql`;
  
  const sqlQuery = {
    query: `SELECT __time AS "time", price, asset
            FROM silver_prices_topic
            ORDER BY __time DESC 
            LIMIT 1000`
  };

  try {
    const res = await fetch(druidUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sqlQuery),
      cache: 'no-store' 
    });

    const rawData = await res.json();
    
    if (!Array.isArray(rawData)) {
        console.error("Lỗi từ Druid:", rawData);
        return NextResponse.json({ error: 'Druid trả về lỗi', details: rawData }, { status: 500 });
    }

    const chronologicalData = rawData.reverse();

    const chartData = chronologicalData.map((item: any, index: number, arr: any[]) => {
        const dateObj = new Date(item.time);
        
        const timeString = dateObj.toLocaleTimeString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false
        });
        
        let change_abs = 0;
        let change_pct = 0;
        
        if (index > 0) {
            const prevItem = arr[index - 1];
            change_abs = parseFloat((item.price - prevItem.price).toFixed(2));
            change_pct = parseFloat(((change_abs / prevItem.price) * 100).toFixed(2));
        }

        return { 
          ...item, 
          time: timeString, 
          change_abs: change_abs,
          change_pct: change_pct
        };
    });
    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Lỗi hệ thống Next.js:", error);
    return NextResponse.json({ error: 'Lỗi kết nối Next.js -> Druid' }, { status: 500 });
  }
}
