import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DeerMark, Flourish, SectionTitle } from '../components/Decor.jsx';
import Icon from '../components/Icon.jsx';
import {
  activityGroups,
  areaCards,
  carousel,
  photo,
  region,
} from '../content.js';
import { t } from '../i18n/index.js';

function Carousel() {
  const [index, setIndex] = useState(0);
  const [touchX, setTouchX] = useState(null);
  const count = carousel.length;
  const slide = carousel[index];

  function step(delta) {
    setIndex((current) => (current + delta + count) % count);
  }

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label="Foto's van het huis"
      onTouchStart={(event) => setTouchX(event.changedTouches[0].clientX)}
      onTouchEnd={(event) => {
        if (touchX == null) return;
        const delta = event.changedTouches[0].clientX - touchX;
        if (delta > 40) step(-1);
        if (delta < -40) step(1);
        setTouchX(null);
      }}
    >
      <img src={photo(slide.file)} alt={slide.caption} />
      <div className="dots">
        {carousel.map((item, itemIndex) => (
          <button
            key={item.file}
            type="button"
            aria-label={item.caption}
            aria-current={itemIndex === index ? 'true' : undefined}
            onClick={() => setIndex(itemIndex)}
          />
        ))}
      </div>
      <p className="carousel-caption">{slide.caption}</p>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="script hero-script">Beleef pure ontspanning!</p>
          <div className="flank">
            <Flourish />
            <p>
              Vakantiehuis La Carrière biedt de perfecte vakantie-uitje, boek vandaag
              nog en verheug je op een geweldige ervaring.
            </p>
            <Flourish />
          </div>
          <Link className="btn" to="/booking">{t.bookStay}</Link>
        </div>
        <DeerMark />
      </section>

      <section className="stay">
        <p className="script stay-script">Verblijf in</p>
        <div className="flank quote-line">
          <Flourish />
          <p className="script quote">"Vakantiehuis La Carrière"</p>
          <Flourish />
        </div>
        <p className="stay-line">bij Ons Huis</p>
        <p className="stay-line">Ontdek onze geweldige faciliteiten</p>
        <p className="max">
          Onze woning is voorzien voor
          <br />
          Max 8 personen .
        </p>
        <p>
          Ervaar het beste van beide werelden in onze woning met 2 aparte woningen.
        </p>
        <p>
          De bovenste verdieping is standaard beschikbaar voor verhuur, met de
          mogelijkheid om de benedenverdieping erbij te huren voor extra ruimte en comfort.
        </p>
        <p>
          De inrichting van het huis omvat een ruime inkomhal voor een gastvrij ontvangst,
          een handige garage met diverse voorzieningen ook is er een lift die beschikbaar
          is voor extra gemak om Bagage, boodschappen naar boven te brengen.
        </p>
      </section>

      <Carousel />

      <section className="cards">
        {areaCards.map((card) => (
          <Link key={card.to} className="area-card" to={card.to}>
            <img src={photo(card.file)} alt="" />
            <span>{card.label}</span>
          </Link>
        ))}
      </section>

      <section className="region">
        <SectionTitle>Verken de regio</SectionTitle>
        <div className="region-grid">
          {region.map((text, index) => (
            <p key={text} className={index > 0 ? 'with-diamond' : undefined}>{text}</p>
          ))}
        </div>
        <img src={photo('outsideHouse1.jpg')} alt="Het huis" />
      </section>

      {activityGroups.map((group) => (
        <section key={group.title || group.items[0].label} className="activities" id={group.id}>
          {group.title && <SectionTitle>{group.title}</SectionTitle>}
          <div className="activity-grid">
            {group.items.map((item) => (
              <article key={item.label}>
                <Icon name={item.icon} />
                <h3>{item.label}</h3>
                {item.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
