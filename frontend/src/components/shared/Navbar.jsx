// frontend/src/components/shared/Navbar.jsx
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleLabel = (role) => {
        if (role === 'admin')      return '⚙️ Administrator';
        if (role === 'supervisor') return '🎓 Supervisor';
        return '🧑‍💼 Student';
    };

    const getNavbarColor = (role) => {
        if (role === 'admin') return '#7d3c98';
        return '#1a5276';
    };

    return (
        <nav className="navbar" style={{
            background: `linear-gradient(135deg, ${getNavbarColor(user?.role)}, ${user?.role === 'admin' ? '#9b59b6' : '#2980b9'})`,
        }}>
            <div className="navbar__brand">
                📍 <span className="navbar__brand-text">Mzumbe GPS Tracker</span>
                {user?.role === 'admin' && (
                    <span style={{
                        background: 'rgba(255,255,255,0.2)',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        marginLeft: '8px',
                        fontWeight: 600,
                    }}>
                        ADMIN
                    </span>
                )}
            </div>

            <div className="navbar__right">
                {user && (
                    <div className="navbar__user">
                        <Link
                            to="/profile"
                            style={{
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <div className="avatar avatar--sm" style={{
                                background: user?.role === 'admin'
                                    ? 'rgba(255,255,255,0.3)'
                                    : '#2980b9',
                            }}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="navbar__user-name">{user.name}</p>
                                <p className="navbar__user-role">
                                    {getRoleLabel(user.role)}
                                </p>
                            </div>
                        </Link>
                    </div>
                )}
                <button onClick={handleLogout} className="navbar__logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;