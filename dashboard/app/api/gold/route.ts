import { NextResponse } from 'next/server';

export async function GET() {
  const druidUrl = `${process.env.DRUID_URL || 'http://localhost:8888'}/druid/v2/sql`;
  
  // Sửa lại câu lệnh SQL: bọc "time" trong ngoặc kép
  const sqlQuery = {
    query: `SELECT __time AS "time", price, asset
            FROM gold_prices_topic
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
    
    // Nếu vẫn lỗi, in ra log để theo dõi
    if (!Array.isArray(rawData)) {
        console.error("Lỗi từ Druid:", rawData);
        return NextResponse.json({ error: 'Druid trả về lỗi', details: rawData }, { status: 500 });
    }

    const chronologicalData = rawData.reverse();

    // SỬA LỖI 1 (tiếp): Tự động tính toán biến động giá (change_abs, change_pct) bằng code JS
    const chartData = chronologicalData.map((item: any, index: number, arr: any[]) => {
        // const timeString = item.time.substring(11, 19); 
        const dateObj = new Date(item.time);
        
        // Ép múi giờ chuẩn và định dạng 24h
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