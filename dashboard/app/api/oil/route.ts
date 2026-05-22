import { NextResponse } from 'next/server';

export async function GET() {
  const druidUrl = 'http://localhost:8888/druid/v2/sql';
  
  // SỬA LỖI 1 & 2: Lấy cột asset, bỏ các cột không tồn tại, và lọc riêng Dầu WTI
  const sqlQuery = {
    query: `SELECT __time AS "time", "asset", "price"
            FROM "oil_prices_topic" 
            WHERE "asset" = 'OIL_WTI'
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
    
    // Druid trả về DESC (mới nhất ở đầu), ta cần reverse để vẽ chart từ trái (cũ) sang phải (mới)
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

        // So sánh giá của điểm hiện tại với điểm ngay trước đó để ra phần trăm tăng/giảm
        if (index > 0) {
            const prevPrice = arr[index - 1].price;
            change_abs = parseFloat((item.price - prevPrice).toFixed(2));
            change_pct = parseFloat(((change_abs / prevPrice) * 100).toFixed(2));
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