import { useEffect, useState } from 'react';
import { getJson, postJson } from '../api.js';
import { t } from '../i18n/index.js';

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(month, delta) {
  const [year, monthNumber] = month.split('-').map(Number);
  const next = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthTitle(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleString('en', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function buildCells(month, byDate) {
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const pad = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const cells = Array.from({ length: pad }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    const known = byDate.get(date);
    cells.push({
      date,
      day,
      state: known ? (known.taken ? 'taken' : 'free') : 'closed',
    });
  }
  return cells;
}

export default function Booking() {
  const [month, setMonth] = useState(currentMonth);
  const [days, setDays] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let ignore = false;
    setError('');
    getJson(`/api/availability?month=${month}`)
      .then((body) => {
        if (!ignore) setDays(body.days);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [month]);

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setMessage('');
    setError('');
    try {
      await postJson('/api/bookings', { date: selected, guestName: name, note });
      setMessage(t.booked);
      setSelected('');
      setName('');
      setNote('');
      const body = await getJson(`/api/availability?month=${month}`);
      setDays(body.days);
    } catch (err) {
      setError(err.message || t.formError);
    } finally {
      setSending(false);
    }
  }

  const byDate = new Map((days || []).map((day) => [day.date, day]));
  const cells = days ? buildCells(month, byDate) : [];

  return (
    <>
      <p className="kicker">{t.bookingLead}</p>
      <h1>{t.navBooking}</h1>
      <p className="lede">{t.bookingHint}</p>
      <div className="month-bar">
        <button type="button" onClick={() => setMonth(shiftMonth(month, -1))}>{t.previousMonth}</button>
        <strong>{monthTitle(month)}</strong>
        <button type="button" onClick={() => setMonth(shiftMonth(month, 1))}>{t.nextMonth}</button>
      </div>
      {error && <p className="banner">{error}</p>}
      {message && <p className="banner ok">{message}</p>}
      {!days && !error && <p className="muted">{t.loading}</p>}
      {days && (
        <div className="calendar" role="grid">
          {t.weekday.map((label) => (
            <div key={label} className="weekday">{label}</div>
          ))}
          {cells.map((cell, index) => (
            cell
              ? (
                <button
                  key={cell.date}
                  type="button"
                  className={`day ${cell.state}`}
                  disabled={cell.state !== 'free'}
                  onClick={() => {
                    setSelected(cell.date);
                    setMessage('');
                  }}
                  aria-pressed={selected === cell.date}
                >
                  <span>{cell.day}</span>
                  <small>{cell.state === 'taken' ? t.taken : cell.state === 'free' ? t.free : t.closed}</small>
                </button>
              )
              : <div key={`pad-${index}`} />
          ))}
        </div>
      )}
      {selected && (
        <form className="booking-form" onSubmit={submit}>
          <h2>{selected}</h2>
          <label>
            {t.nameLabel}
            <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} />
          </label>
          <label>
            {t.noteLabel}
            <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} rows={3} />
          </label>
          <p className="note">{t.noteHint}</p>
          <button type="submit" className="primary" disabled={sending}>
            {sending ? t.sending : t.requestDate}
          </button>
        </form>
      )}
    </>
  );
}
