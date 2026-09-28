'use client';

import { use } from 'react';

// Next.js เวอร์ชันล่าสุด: params เป็น Promise ต้อง unwrap ด้วย use()
export default function OrderPage({ params }) {
  const { sessionId } = use(params);

  return (
    <main style={{ padding: 24 }}>
      <h1>สั่งอาหาร</h1>
      <p>Session: {sessionId}</p>
      <p>หน้านี้ยังเป็นโครง (placeholder) จะพัฒนาในขั้นตอนถัดไป</p>
    </main>
  );
}
