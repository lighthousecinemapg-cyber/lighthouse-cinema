'use client';
// app/admin/orders/page.js -> /admin/orders  (staff-only ticket orders dashboard)
import { useEffect, useState } from 'react';

const gold = '#d4af37';
const darkBg = '#111111';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';

function money(cents) { return '$' + ((cents || 0) / 100).toFixed(2); }
function when(iso) { try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }

export default function AdminOrdersPage() {
  const [state, setState] = useState('loading'); // loading | ok | unauth | error
  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(async (r) => {
        if (r.status === 401) { setState('unauth'); return null; }
        if (!r.ok) { setState('error'); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setOrders(d.orders || []);
        setRevenue(d.revenueCents || 0);
        setState('ok');
      })
      .catch(() => setState('error'));
  }, []);

  const filtered = orders.filter((o) => {
    if (!q.trim()) return true;
    const hay = [o.movie, o.date, o.time, o.confRef, o.id, o.state].join(' ').toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  const wrap = { maxWidth: 1150, margin: '0 auto', padding: '32px 20px 80px', color: textLight };

  if (state === 'loading') return <div style={wrap}>Loading orders…</div>;

  if (state === 'unauth') {
    return (
      <div style={{ ...wrap, textAlign: 'center' }}>
        <h1 style={{ color: gold }}>Staff Login Required</h1>
        <p style={{ color: textMuted, margin: '10px 0 24px' }}>Please sign in to view ticket orders.</p>
        <a href="/staff.html" style={{ background: gold, color: '#000', padding: '12px 26px', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>Go to Staff Login</a>
      </div>
    );
  }

  if (state === 'error') {
    return <div style={{ ...wrap, textAlign: 'center' }}><h1 style={{ color: gold }}>Couldn't load orders</h1><p style={{ color: textMuted }}>Please try again shortly.</p></div>;
  }

  return (
    <div style={wrap}>
      <h1 style={{ color: '#fff', fontSize: '1.9rem', fontWeight: 900, margin: '0 0 4px' }}>Ticket Orders</h1>
      <p style={{ color: textMuted, margin: '0 0 20px' }}>Live from Square · {orders.length} orders · Paid revenue {money(revenue)}</p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search movie, date, showtime, confirmation # or order #"
        style={{ width: '100%', maxWidth: 520, background: '#0a0a0a', border: '1px solid ' + darkBorder, color: '#fff', padding: '12px 14px', borderRadius: 8, fontSize: '0.95rem', marginBottom: 18 }}
      />

      <div style={{ overflowX: 'auto', border: '1px solid ' + darkBorder, borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead>
            <tr style={{ background: darkBg, textAlign: 'left' }}>
              {['Movie', 'Date', 'Showtime', 'Qty', 'Amount', 'Status', 'Confirmation #', 'Order ID', 'Placed'].map((h) => (
                <th key={h} style={{ padding: '11px 12px', color: gold, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid ' + darkBorder, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr key={o.id} style={{ background: i % 2 ? darkBg : darkCard }}>
                <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 600 }}>{o.movie || '—'}</td>
                <td style={{ padding: '10px 12px' }}>{o.date || '—'}</td>
                <td style={{ padding: '10px 12px', color: gold, fontWeight: 700 }}>{o.time || '—'}</td>
                <td style={{ padding: '10px 12px' }}>{o.quantity}</td>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>{money(o.totalCents)}</td>
                <td style={{ padding: '10px 12px', color: o.state === 'COMPLETED' ? '#4CAF50' : textMuted, fontWeight: 700 }}>{o.state === 'COMPLETED' ? 'Paid' : o.state}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.8rem' }}>{o.confRef || '—'}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.72rem', color: textMuted }}>{o.id}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: textMuted, whiteSpace: 'nowrap' }}>{when(o.createdAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: textMuted }}>No matching orders.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={{ color: textMuted, fontSize: '0.8rem', marginTop: 12 }}>Showing open &amp; completed orders. Each row links a customer's payment to the exact movie, date &amp; showtime.</p>
    </div>
  );
}
