import { NextResponse } from 'next/server';

export async function GET() {
  const query = `
    SELECT 
      "__time", 
      "source", 
      "title", 
      "summary", 
      "link", 
      "matched_keywords",
      "latitude",
      "longitude"
    FROM "osint_events_v2"
    ORDER BY "__time" DESC
    LIMIT 50
  `;

  try {
    const response = await fetch('http://127.0.0.1:8888/druid/v2/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    // 1. Lấy dữ liệu dưới dạng text thô trước để kiểm tra (chống crash JSON.parse)
    const responseText = await response.text();

    if (!response.ok) {
      console.error("❌ Druid phản hồi lỗi:", responseText);
      return NextResponse.json({ error: 'Druid query failed', details: responseText }, { status: response.status });
    }

    // 2. Nếu Druid trả về rỗng, lập tức trả về mảng rỗng để an toàn
    if (!responseText) {
      console.warn("⚠️ Druid trả về cục dữ liệu rỗng!");
      return NextResponse.json([]); 
    }

    // 3. Lúc này mới an toàn để ép kiểu sang JSON
    const data = JSON.parse(responseText);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("❌ Lỗi mạng (Next.js không gọi được Druid):", error);
    return NextResponse.json({ error: 'Failed to connect to Druid' }, { status: 500 });
  }
}