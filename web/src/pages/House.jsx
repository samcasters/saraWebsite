import { useEffect, useState } from 'react';
import { getJson } from '../api.js';
import { t } from '../i18n/index.js';

export default function House() {
  const [house, setHouse] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson('/api/house').then(setHouse).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="banner">{error || t.loadError}</p>;
  if (!house) return <p className="muted">{t.loading}</p>;

  const [lead, ...rest] = house.photos;

  return (
    <>
      <p className="kicker">{t.houseLead}</p>
      <h1>{house.name}</h1>
      <p className="lede">{house.summary}</p>
      <p className="location">{house.location}</p>
      {lead && (
        <figure className="lead">
          <img src={lead.url} alt={lead.caption} />
          <figcaption>{lead.caption}</figcaption>
        </figure>
      )}
      <div className="photo-grid">
        {rest.map((photo) => (
          <figure key={photo.file}>
            <img src={photo.url} alt={photo.caption} />
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
