import { NavLink, Route, Routes } from 'react-router-dom';
import { t } from './i18n/index.js';
import House from './pages/House.jsx';
import Activities from './pages/Activities.jsx';
import Booking from './pages/Booking.jsx';

export default function App() {
  return (
    <div className="page">
      <header className="top">
        <NavLink to="/" className="brand">{t.siteName}</NavLink>
        <nav>
          <NavLink to="/" end>{t.navHouse}</NavLink>
          <NavLink to="/activities">{t.navActivities}</NavLink>
          <NavLink to="/booking">{t.navBooking}</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<House />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/booking" element={<Booking />} />
        </Routes>
      </main>
      <footer>{t.sampleNote}</footer>
    </div>
  );
}
