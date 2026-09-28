# Thainexsweetie — ระบบสั่งอาหารร้านขนมหวาน

## Stack
- Next.js (App Router) — **JavaScript ไม่ใช่ TypeScript**
- Deploy บน Vercel
- Database: Supabase (`lib/supabaseClient.js`)

## ข้อควรจำสำคัญ (Next.js เวอร์ชันล่าสุด)
- `params` ของ Dynamic Route (เช่น `app/order/[sessionId]/page.js`) เป็น **Promise**
- ต้อง unwrap ด้วย `use()` จาก React เสมอ (ใน Client Component ที่มี `'use client'`):

```js
'use client';
import { use } from 'react';

export default function Page({ params }) {
  const { sessionId } = use(params);
  // ...
}
```

- ใน Server Component ให้ใช้ `const { sessionId } = await params;` (async function)

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- เก็บใน `.env.local` (ไม่ commit) และตั้งค่าใน Vercel Project Settings

## โครงสร้างตารางฐานข้อมูล (มีอยู่แล้วใน Supabase — ไม่ต้องสร้างใหม่)

### sessions
| column | หมายเหตุ |
|---|---|
| id | |
| table_number | |
| adult_count | |
| child_count | |
| status | |
| created_at | |

### menu_categories
| column | หมายเหตุ |
|---|---|
| id | |
| name | |
| sort_order | |

### menu_items
| column | หมายเหตุ |
|---|---|
| id | |
| category_id | อ้างอิง menu_categories.id |
| name | |

### orders
| column | หมายเหตุ |
|---|---|
| id | |
| session_id | อ้างอิง sessions.id |
| table_number | |
| items | jsonb |
| status | |
| created_at | |

## หน้าในระบบ
- `/` หน้าแรก (ใช้ทดสอบ deploy)
- `/generate-qr` สร้าง QR Code ประจำโต๊ะ
- `/kitchen` หน้าครัว
- `/order/[sessionId]` หน้าสั่งอาหารของลูกค้า
