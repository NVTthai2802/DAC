import { NextResponse } from 'next/server';

export async function GET() {
  const druidUrl = 'http://localhost:8888/druid/v2/sql';
  
  // Sửa lại câu lệnh SQL: bọc "time" trong ngoặc kép
  const sqlQuery = {
    query: `SELECT __time AS "time", price, change_pct, change_abs
            FROM investing_oil_realtime 
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
    
    // Nếu vẫn lỗi, in ra log để theo dõi
    if (!Array.isArray(rawData)) {
        console.error("Lỗi từ Druid:", rawData);
        return NextResponse.json({ error: 'Druid trả về lỗi', details: rawData }, { status: 500 });
    }
    
    const chartData = rawData.reverse().map((item: any) => {
    //   const dateObj = new Date(item.time);
    //   const timeString = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    //   return { ...item, time: timeString };
        const timeString = item.time.substring(11, 19); 
        return { ...item, time: timeString };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Lỗi hệ thống Next.js:", error);
    return NextResponse.json({ error: 'Lỗi kết nối Next.js -> Druid' }, { status: 500 });
  }
}