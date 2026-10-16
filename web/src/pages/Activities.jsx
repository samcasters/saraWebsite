import { useEffect, useState } from 'react';
import { getJson } from '../api.js';
import { t } from '../i18n/index.js';

export default function Activities() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson('/api/activities').then(setItems).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="banner">{error || t.loadError}</p>;
  if (!items) return <p className="muted">{t.loading}</p>;

  return (
    <>
      <p className="kicker">{t.activitiesLead}</p>
      <h1>{t.navActivities}</h1>
      <ul className="activity-list">
        {items.map((item) => (
          <li key={item.name}>
            <p className="kind">{item.kind}</p>
            <h2>{item.name}</h2>
            <p>{item.summary}</p>
            <p className="note">{item.note}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
