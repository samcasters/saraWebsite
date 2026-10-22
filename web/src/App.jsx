import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Area from './pages/Area.jsx';
import Booking from './pages/Booking.jsx';
import Home from './pages/Home.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/huis/:area" element={<Area />} />
        <Route path="/booking" element={<Booking />} />
        <Route
          path="/activities"
          element={<Navigate to={{ pathname: '/', hash: 'activiteiten' }} replace />}
        />
      </Route>
    </Routes>
  );
}
