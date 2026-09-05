// frontend/src/components/auth/Login.jsx
import { useState }       from 'react';
import { useNavigate }    from 'react-router-dom';
import { useAuth }        from '../../context/AuthContext';
import { useSettings }    from '../../context/SettingsContext';
import '../../App.css';

function Login() {
    const { login }    = useAuth();
    const { settings } = useSettings();
    const navigate     = useNavigate();

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            setLoading(true);
            const userData = await login(email.trim().toLowerCase(), password);
            if (userData.role === 'admin')           navigate('/admin',      { replace: true });
            else if (userData.role === 'supervisor') navigate('/supervisor', { replace: true });
            else                                     navigate('/student',    { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Incorrect email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{
            background: `linear-gradient(135deg, #0d2137, ${settings.primary_color})`,
        }}>
            <div className="auth-card">

                <div className="auth-header">
                    {settings.logo_url ? (
                        <img
                            src={settings.logo_url}
                            alt={settings.short_name}
                            style={{ height: '60px', marginBottom: '12px', borderRadius: '8px' }}
                        />
                    ) : (
                        <div className="auth-logo">📍</div>
                    )}
                    <h1 className="auth-title">{settings.name} Tracker</h1>
                    <p className="auth-subtitle">
                        {settings.program_label} Supervision System
                    </p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit} className="form">
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ background: settings.primary_color }}
                    >
                        {loading ? '⏳ Signing in...' : '🔐 Login'}
                    </button>
                </form>

                <div className="alert alert-info" style={{ marginTop: '20px' }}>
                    ℹ️ <strong>Don't have an account?</strong><br />
                    Contact your system administrator to create an account for you.
                </div>

                {settings.email && (
                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#7f8c8d', marginTop: '12px' }}>
                        📧 {settings.email}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;