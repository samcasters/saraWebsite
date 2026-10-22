import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { menuItems } from '../content.js';
import { t } from '../i18n/index.js';

function HouseMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const here = pathname.startsWith('/huis');

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      className={`menu${open ? ' open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={here ? 'active' : undefined}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        {t.navLayout}
        <span className="chevron" aria-hidden="true" />
      </button>
      <div className="menu-panel" role="menu">
        {menuItems.map((item) => (
          <NavLink key={item.to} to={item.to} role="menuitem">
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function Rail() {
  return (
    <aside className="rail" aria-label="Snel naar">
      <Link to="/booking" aria-label={t.toBooking} title={t.toBooking}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 9h16M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </Link>
      <button type="button" aria-label={t.phonePending} title={t.phonePending}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 4h3l1.5 4-2 1.5a12 12 0 0 0 5 5L17 13l4 1.5V18a2 2 0 0 1-2 2A14 14 0 0 1 4 6a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </button>
      <a
        href="https://www.google.com/maps/search/?api=1&query=Mouzaive%2C%20Belgi%C3%AB"
        target="_blank"
        rel="noreferrer"
        aria-label={t.mapLabel}
        title={t.mapLabel}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </a>
      <button type="button" aria-label={t.mailPending} title={t.mailPending}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="6" width="17" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </aside>
  );
}

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const node = document.getElementById(location.hash.slice(1));
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <div className="site">
      <header className="top">
        <Link to="/" className="brand">{t.siteName}</Link>
        <nav>
          <NavLink to="/" end>{t.navHome}</NavLink>
          <Link to="/booking">{t.navBookNow}</Link>
          <HouseMenu />
          <NavLink to="/booking">{t.navBooking}</NavLink>
        </nav>
      </header>
      <main className="shell">
        <Outlet />
      </main>
      <footer className="foot">
        <Link to="/" className="brand">{t.siteName}</Link>
        <p>{t.footerRights}</p>
        <div className="social" aria-hidden="true">
          <span>f</span>
          <span>𝕏</span>
          <span>
            <svg viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17" cy="7" r="0.8" fill="currentColor" />
            </svg>
          </span>
        </div>
      </footer>
      <Rail />
      <button
        type="button"
        className="to-top"
        aria-label={t.toTop}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 14l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
    </div>
  );
}
