// frontend/src/components/shared/Navbar.jsx
import { useNavigate, Link } from 'react-router-dom';
import { useAuth }           from '../../context/AuthContext';
import { useSettings }       from '../../context/SettingsContext';
import '../../App.css';

function Navbar() {
    const { user, logout }    = useAuth();
    const { settings }        = useSettings();
    const navigate            = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleLabel = (role) => {
        if (role === 'admin')      return '⚙️ Administrator';
        if (role === 'supervisor') return '🎓 Supervisor';
        return '🧑‍💼 Student';
    };

    // Navbar color: purple for admin, institution primary color for others
    const navBg = user?.role === 'admin'
        ? 'linear-gradient(135deg, #7d3c98, #9b59b6)'
        : `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})`;

    return (
        <nav className="navbar" style={{ background: navBg }}>
            <div className="navbar__brand">
                {/* Show logo if institution has one, else show pin icon */}
                {settings.logo_url ? (
                    <img
                        src={settings.logo_url}
                        alt={settings.short_name}
                        style={{ height: '32px', borderRadius: '4px', marginRight: '8px' }}
                    />
                ) : (
                    <span>📍</span>
                )}
                <span className="navbar__brand-text">
                    {settings.name}
                </span>
                {user?.role === 'admin' && (
                    <span style={{
                        background: 'rgba(255,255,255,0.2)',
                        fontSize: '11px', padding: '2px 8px',
                        borderRadius: '10px', marginLeft: '8px', fontWeight: 600,
                    }}>
                        ADMIN
                    </span>
                )}
            </div>

            <div className="navbar__right">
                {user && (
                    <div className="navbar__user">
                        <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar avatar--sm">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="navbar__user-name">{user.name}</p>
                                <p className="navbar__user-role">{getRoleLabel(user.role)}</p>
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