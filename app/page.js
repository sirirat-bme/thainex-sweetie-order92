'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const styles = {
  page: {
    maxWidth: 560,
    margin: '0 auto',
    padding: 20,
    fontSize: 20,
  },
  title: { fontSize: 32, margin: '0 0 20px' },
  label: { display: 'block', fontSize: 22, fontWeight: 600, marginBottom: 6 },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 28,
    padding: '12px 14px',
    border: '2px solid #999',
    borderRadius: 10,
    marginBottom: 16,
  },
  primaryBtn: {
    width: '100%',
    fontSize: 26,
    fontWeight: 700,
    padding: '16px 0',
    border: 'none',
    borderRadius: 12,
    background: '#1f8a4c',
    color: '#fff',
    cursor: 'pointer',
  },
  errorText: { color: '#c62828', fontSize: 20, marginBottom: 12 },
  warnBox: {
    border: '4px solid #e65100',
    background: '#fff3e0',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },
  warnText: { fontSize: 24, fontWeight: 700, color: '#bf360c', margin: '0 0 14px' },
  warnBtn: {
    fontSize: 22,
    fontWeight: 700,
    padding: '12px 18px',
    border: 'none',
    borderRadius: 10,
    background: '#e65100',
    color: '#fff',
    cursor: 'pointer',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 1000,
  },
  dialog: {
    background: '#fff',
    border: '5px solid #c62828',
    borderRadius: 16,
    padding: 22,
    width: '100%',
    maxWidth: 480,
    fontSize: 22,
  },
  dialogTitle: { fontSize: 28, fontWeight: 800, color: '#c62828', margin: '0 0 14px' },
  dialogRow: { margin: '6px 0' },
  dialogActions: { display: 'flex', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    fontSize: 22,
    fontWeight: 700,
    padding: '14px 0',
    border: '2px solid #666',
    borderRadius: 10,
    background: '#fff',
    color: '#333',
    cursor: 'pointer',
  },
  confirmBtn: {
    flex: 1,
    fontSize: 22,
    fontWeight: 700,
    padding: '14px 0',
    border: 'none',
    borderRadius: 10,
    background: '#c62828',
    color: '#fff',
    cursor: 'pointer',
  },
  resultBox: { textAlign: 'center' },
  qrImg: { width: 300, height: 300, maxWidth: '100%' },
  summary: { fontSize: 28, fontWeight: 700, margin: '14px 0 8px' },
  urlRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
    margin: '8px 0 20px',
  },
  urlText: { fontSize: 20, wordBreak: 'break-all' },
  copyBtn: {
    fontSize: 16,
    padding: '6px 12px',
    border: '2px solid #1f8a4c',
    borderRadius: 8,
    background: '#fff',
    color: '#1f8a4c',
    cursor: 'pointer',
  },
};

function minutesSince(createdAt) {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

export default function GenerateQrPage() {
  const [tableNumber, setTableNumber] = useState('');
  const [adultCount, setAdultCount] = useState('');
  const [childCount, setChildCount] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // session เก่าที่ยังเปิดค้างอยู่ (ถ้ามี) -> แสดงกล่องเตือน
  const [existing, setExisting] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [closing, setClosing] = useState(false);

  // ผลลัพธ์หลังสร้าง session ใหม่สำเร็จ
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  function handleTableChange(value) {
    setTableNumber(value);
    // เปลี่ยนเลขโต๊ะแล้ว กล่องเตือนของโต๊ะเดิมไม่เกี่ยวข้องอีก
    setExisting(null);
    setShowConfirm(false);
    setError('');
  }

  function resetAll() {
    setTableNumber('');
    setAdultCount('');
    setChildCount('');
    setError('');
    setExisting(null);
    setShowConfirm(false);
    setResult(null);
    setCopied(false);
  }

  async function handleOpenTable(e) {
    e.preventDefault();
    setError('');

    const table = Number(tableNumber);
    const adults = Number(adultCount || 0);
    const children = Number(childCount || 0);

    if (!Number.isInteger(table) || table < 1) {
      setError('กรุณากรอกเลขโต๊ะให้ถูกต้อง');
      return;
    }
    if (
      !Number.isInteger(adults) ||
      !Number.isInteger(children) ||
      adults < 0 ||
      children < 0
    ) {
      setError('จำนวนผู้ใหญ่/เด็กต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป');
      return;
    }
    if (adults + children < 1) {
      setError('กรุณากรอกจำนวนลูกค้าอย่างน้อย 1 คน');
      return;
    }

    setLoading(true);
    try {
      // 1) เช็คว่าโต๊ะนี้มี session ที่ยังเปิดอยู่หรือไม่
      const { data: openRows, error: checkError } = await supabase
        .from('sessions')
        .select('id, table_number, adult_count, child_count, created_at')
        .eq('table_number', table)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1);

      if (checkError) throw checkError;

      if (openRows && openRows.length > 0) {
        setExisting(openRows[0]);
        return;
      }

      // 2) ไม่มี -> สร้าง session ใหม่
      const { error: insertError } = await supabase.from('sessions').insert({
        table_number: table,
        adult_count: adults,
        child_count: children,
        status: 'open',
      });

      if (insertError) throw insertError;

      const url = `${window.location.origin}/order/${table}`;
      setResult({ table, adults, children, url });
      setCopied(false);
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาด: ' + (err?.message || 'ไม่สามารถเปิดโต๊ะได้'));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmClose() {
    if (!existing) return;
    setClosing(true);
    setError('');
    try {
      // update เฉพาะแถวนี้ และเฉพาะตอนที่ยัง open อยู่ (กันกดซ้ำซ้อน)
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ status: 'closed' })
        .eq('id', existing.id)
        .eq('status', 'open');

      if (updateError) throw updateError;

      // ปิดสำเร็จ (หรือมีคนปิดไปก่อนแล้ว) -> กลับไปที่ฟอร์มเดิม ค่าที่กรอกยังอยู่
      setShowConfirm(false);
      setExisting(null);
    } catch (err) {
      console.error(err);
      setError('ปิดโต๊ะไม่สำเร็จ: ' + (err?.message || 'เกิดข้อผิดพลาด'));
      setShowConfirm(false);
    } finally {
      setClosing(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      setError('คัดลอกไม่สำเร็จ กรุณาคัดลอกลิงก์ด้วยตัวเอง');
    }
  }

  // ---------- หน้าผลลัพธ์ QR ----------
  if (result) {
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      result.url
    )}`;

    return (
      <main style={styles.page}>
        <h1 style={styles.title}>เปิดโต๊ะสำเร็จ</h1>
        <div style={styles.resultBox}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt={`QR Code โต๊ะ ${result.table}`} style={styles.qrImg} />
          <div style={styles.summary}>
            โต๊ะ {result.table} · ผู้ใหญ่ {result.adults} · เด็ก {result.children}
          </div>
          <div style={styles.urlRow}>
            <span style={styles.urlText}>{result.url}</span>
            <button type="button" style={styles.copyBtn} onClick={handleCopy}>
              {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
            </button>
          </div>
          {error && <div style={styles.errorText}>{error}</div>}
          <button type="button" style={styles.primaryBtn} onClick={resetAll}>
            เปิดโต๊ะใหม่
          </button>
        </div>
      </main>
    );
  }

  // ---------- หน้าฟอร์ม ----------
  return (
    <main style={styles.page}>
      <h1 style={styles.title}>เปิดโต๊ะ</h1>

      {existing && (
        <div style={styles.warnBox} role="alert">
          <p style={styles.warnText}>
            โต๊ะนี้มีลูกค้าอยู่ระหว่างทานอาหาร กรุณาปิดออเดอร์เดิมก่อน
          </p>
          <button
            type="button"
            style={styles.warnBtn}
            onClick={() => setShowConfirm(true)}
          >
            ปิดออเดอร์เดิม
          </button>
        </div>
      )}

      <form onSubmit={handleOpenTable}>
        <label style={styles.label} htmlFor="table">
          เลขโต๊ะ
        </label>
        <input
          id="table"
          type="number"
          inputMode="numeric"
          min="1"
          style={styles.input}
          value={tableNumber}
          onChange={(e) => handleTableChange(e.target.value)}
        />

        <label style={styles.label} htmlFor="adults">
          จำนวนผู้ใหญ่
        </label>
        <input
          id="adults"
          type="number"
          inputMode="numeric"
          min="0"
          style={styles.input}
          value={adultCount}
          onChange={(e) => setAdultCount(e.target.value)}
        />

        <label style={styles.label} htmlFor="children">
          จำนวนเด็ก
        </label>
        <input
          id="children"
          type="number"
          inputMode="numeric"
          min="0"
          style={styles.input}
          value={childCount}
          onChange={(e) => setChildCount(e.target.value)}
        />

        {error && <div style={styles.errorText}>{error}</div>}

        <button type="submit" style={styles.primaryBtn} disabled={loading}>
          {loading ? 'กำลังตรวจสอบ...' : 'เปิดโต๊ะ'}
        </button>
      </form>

      {showConfirm && existing && (
        <div style={styles.overlay}>
          <div style={styles.dialog} role="dialog" aria-modal="true">
            <h2 style={styles.dialogTitle}>ยืนยันปิดโต๊ะเดิม?</h2>
            <div style={styles.dialogRow}>โต๊ะ {existing.table_number}</div>
            <div style={styles.dialogRow}>
              ผู้ใหญ่ {existing.adult_count} · เด็ก {existing.child_count}
            </div>
            <div style={styles.dialogRow}>
              เปิดมาแล้ว {minutesSince(existing.created_at)} นาที
            </div>
            <div style={styles.dialogActions}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setShowConfirm(false)}
                disabled={closing}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                style={styles.confirmBtn}
                onClick={handleConfirmClose}
                disabled={closing}
              >
                {closing ? 'กำลังปิด...' : 'ยืนยันปิดโต๊ะเดิม'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
