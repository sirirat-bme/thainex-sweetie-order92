# Thainexsweetie

ระบบสั่งอาหารร้านขนมหวาน — Next.js (App Router, JavaScript) + Supabase, deploy บน Vercel

## เริ่มต้นใช้งาน

```bash
npm install
cp .env.example .env.local   # แล้วใส่ค่า Supabase จริง
npm run dev
```

เปิด http://localhost:3000

## Scripts
- `npm run dev` — รันโหมดพัฒนา
- `npm run build` — build สำหรับ production
- `npm run start` — รัน production server

## Deploy บน Vercel
1. Push โค้ดขึ้น GitHub
2. Import โปรเจกต์ใน Vercel
3. ตั้ง Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## หมายเหตุสำคัญ
โปรเจกต์นี้ใช้ Next.js เวอร์ชันล่าสุด ซึ่ง `params` ของ Dynamic Route เป็น Promise
ต้อง unwrap ด้วย `use()` จาก React เสมอ (ดูรายละเอียดและโครงสร้างตารางใน `CLAUDE.md`)
