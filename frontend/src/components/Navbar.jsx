import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Navbar() {
const location = useLocation();

return (
    <nav className="navbar">
    <div className="navbar__brand">
        <img src={logo} alt="Seijaku Balance" className="navbar__logo" />
        <div>
        <h1 className="navbar__title">Seijaku Balance</h1>
        <p className="navbar__subtitle">Centro de Masajes & Aeroyoga</p>
        </div>
    </div>
    <div className="navbar__links">
        <Link
        to="/"
        className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
        >
        Reservar
        </Link>
        <Link
        to="/admin"
        className={`navbar__link ${location.pathname === '/admin' ? 'navbar__link--active' : ''}`}
        >
        Panel Admin
        </Link>
    </div>
    </nav>
);
}