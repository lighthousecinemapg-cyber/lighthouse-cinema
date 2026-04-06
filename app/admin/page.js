'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('events');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', time: '', venue: 'Main Auditorium',
    ticketPrice: '', totalSeats: '140', category: 'special', image: '/popcorn-hero.jpg',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [evRes, bkRes] = await Promise.all([
        fetch('/api/events').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
      ]);
      setEvents(evRes.events || []);
      setBookings(bkRes.bookings || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function openCreate() {
    setEditingEvent(null);
    setFormData({
      title: '', description: '', date: '', time: '', venue: 'Main Auditorium',
      ticketPrice: '', totalSeats: '140', category: 'special', image: '/popcorn-hero.jpg',
    });
    setShowForm(true);
  }

  function openEdit(event) {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: event.venue,
      ticketPrice: String(event.ticketPrice),
      totalSeats: String(event.totalSeats),
      category: event.category,
      image: event.image,
    });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingEvent
        ? `/api/events/${editingEvent.id}`
        : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ticketPrice: parseFloat(formData.ticketPrice),
          totalSeats: parseInt(formData.totalSeats),
        }),
      });
      setShowForm(false);
      await loadData();
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Deactivate this event?')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    await loadData();
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Stats
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const totalDeposits = bookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0);
  const totalTickets = bookings.reduce((sum, b) =>
    sum + (b.lineItems || []).reduce((s, l) => s + l.quantity, 0), 0);

  return (
    <div className="animate-in">
      <div className="container section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>
              <span className="gold-text">Admin</span> Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage events, bookings, and revenue</p>
          </div>
          <button onClick={openCreate} className="btn btn-gold">+ New Event</button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Events', value: events.length, icon: '&#127916;' },
            { label: 'Bookings', value: bookings.length, icon: '&#127915;' },
            { label: 'Tickets Sold', value: totalTickets, icon: '&#127903;' },
            { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: '&#128176;' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
              borderRadius: 'var(--radius)', padding: '20px',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--gold)', fontFamily: 'Playfair Display, serif' }}
                dangerouslySetInnerHTML={{ __html: typeof stat.value === 'string' ? stat.value : stat.value }}
              />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['events', 'bookings'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? 'btn btn-gold btn-sm' : 'btn btn-dark btn-sm'}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '32px', height: '32px' }}></div>
          </div>
        ) : tab === 'events' ? (
          /* Events Table */
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td style={{ fontWeight: '600' }}>{event.title}</td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.time}</td>
                    <td>${event.ticketPrice}</td>
                    <td>
                      {event.bookedSeats}/{event.totalSeats}
                      {event.totalSeats - event.bookedSeats < 20 && (
                        <span className="badge badge-red" style={{ marginLeft: '8px' }}>Low</span>
                      )}
                    </td>
                    <td><span className="badge badge-gold">{event.category}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openEdit(event)} className="btn btn-dark btn-sm" style={{ marginRight: '8px' }}>Edit</button>
                      <button onClick={() => handleDelete(event.id)} className="btn btn-danger btn-sm">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Bookings Table */
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Event</th>
                  <th>Tickets</th>
                  <th>Total</th>
                  <th>Deposit</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No bookings yet</td></tr>
                ) : bookings.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '600', color: 'var(--gold)' }}>{b.bookingRef}</td>
                    <td>
                      <div>{b.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.customerEmail}</div>
                    </td>
                    <td>{b.lineItems?.[0]?.eventTitle || 'â'}</td>
                    <td>{b.lineItems?.reduce((s, l) => s + l.quantity, 0) || 'â'}</td>
                    <td>${b.grandTotal?.toFixed(2)}</td>
                    <td style={{ color: 'var(--success)' }}>${b.depositAmount?.toFixed(2)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'â'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Event Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '24px',
          }}>
            <div style={{
              background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
              borderRadius: 'var(--radius)', width: '100%', maxWidth: '560px',
              maxHeight: '90vh', overflow: 'auto',
            }}>
              <div style={{
                padding: '20px 24px', borderBottom: '1px solid var(--dark-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                <button onClick={() => setShowForm(false)} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  fontSize: '1.5rem', cursor: 'pointer',
                }}>&times;</button>
              </div>
              <form onSubmit={handleSave} style={{ padding: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input type="time" className="form-input" value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Ticket Price ($)</label>
                    <input type="number" step="0.01" className="form-input" value={formData.ticketPrice}
                      onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Seats</label>
                    <input type="number" className="form-input" value={formData.totalSeats}
                      onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input className="form-input" value={formData.venue}
                      onChange={e => setFormData({ ...formData, venue: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      <option value="weekly">Weekly</option>
                      <option value="special">Special</option>
                      <option value="screening">Screening</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-gold" disabled={saving} style={{ flex: 1 }}>
                    {saving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-dark" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
