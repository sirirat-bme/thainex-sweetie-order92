import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: 24, textAlign: 'center' }}>
      <h1>Thainexsweetie</h1>
      <p>ระบบสั่งอาหารร้านขนมหวาน</p>
      <nav style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Link href="/generate-qr">สร้าง QR Code</Link>
        <Link href="/kitchen">หน้าครัว</Link>
      </nav>
    </main>
  );
}
