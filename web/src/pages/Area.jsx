import { Link, useParams } from 'react-router-dom';
import { areas, photo } from '../content.js';
import { t } from '../i18n/index.js';

export default function Area() {
  const { area } = useParams();
  const page = areas[area];

  if (!page) {
    return (
      <section className="missing">
        <p>{t.missingArea}</p>
        <Link className="btn" to="/">Home</Link>
      </section>
    );
  }

  return (
    <article className="area">
      <div className="area-copy">
        <h1 className="script area-title">{page.title}</h1>
        {page.subtitle && <p className="script area-sub">{page.subtitle}</p>}
        {page.paragraphs?.map((text) => <p key={text}>{text}</p>)}
        {page.groups && (
          <ul className="amenities">
            {page.groups.map((group) => (
              <li key={group.title}>
                <span>{group.title}</span>
                {group.items && (
                  <ul>
                    {group.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="photo-grid">
        {page.photos.map((item) => (
          <figure key={item.file}>
            <img src={photo(item.file)} alt={item.caption} />
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </article>
  );
}
