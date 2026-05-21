import { NextResponse } from 'next/server';

// Bắt buộc Next.js luôn lấy dữ liệu mới nhất, không dùng Cache cũ
export const dynamic = 'force-dynamic';

export async function GET() {
  // Lấy tối đa 30 bản ghi mới nhất (tương đương 30 ngày) để vẽ biểu đồ
  const query = `
    SELECT "currency", "rate", "quota_remaining"
    FROM "forex_rates_full"
    WHERE "currency" IN ('VND', 'EUR', 'JPY')
    ORDER BY "__time" DESC
    LIMIT 3
  `;

  try {
    const response = await fetch('http://127.0.0.1:8888/druid/v2/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("❌ Druid phản hồi lỗi:", responseText);
      return NextResponse.json({ error: 'Druid query failed' }, { status: response.status });
    }

    if (!responseText) {
      return NextResponse.json([]); 
    }

    const data = JSON.parse(responseText);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("❌ Lỗi mạng:", error);
    return NextResponse.json({ error: 'Failed to connect to Druid' }, { status: 500 });
  }
}