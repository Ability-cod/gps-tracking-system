// frontend/src/components/auth/Login.jsx
// Registration removed — accounts created by Admin only
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';

function Login() {
    const { login }   = useAuth();
    const navigate    = useNavigate();
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
            if (userData.role === 'admin')      navigate('/admin',      { replace: true });
            else if (userData.role === 'supervisor') navigate('/supervisor', { replace: true });
            else navigate('/student', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Incorrect email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Header */}
                <div className="auth-header">
                    <div className="auth-logo">📍</div>
                    <h1 className="auth-title">Mzumbe GPS Tracker</h1>
                    <p className="auth-subtitle">Field Attachment Supervision System</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit} className="form">
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="you@mzumbe.ac.tz"
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

                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? '⏳ Signing in...' : '🔐 Login'}
                    </button>
                </form>

                {/* Info note — no register link */}
                <div className="alert alert-info" style={{ marginTop: '20px' }}>
                    ℹ️ <strong>Don't have an account?</strong><br />
                    Contact your system administrator to create an account for you.
                </div>

            </div>
        </div>
    );
}

export default Login;