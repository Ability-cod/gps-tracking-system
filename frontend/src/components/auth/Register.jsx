import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';

function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'student', supervisorEmail: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      const userData = await register(
        form.name, form.email, form.password,
        form.role, form.supervisorEmail
      );
      navigate(userData.role === 'supervisor' ? '/supervisor' : '/student', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">

        <div className="auth-header">
          <div className="auth-logo">📍</div>
          <h1 className="auth-title">Mzumbe GPS Tracker</h1>
          <p className="auth-subtitle">Create a new account</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="form-label">Full Name</label>
          <input
            name="name" type="text"
            className="form-input"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange} required
          />

          <label className="form-label">Email Address</label>
          <input
            name="email" type="email"
            className="form-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange} required
          />

          <label className="form-label">Password</label>
          <input
            name="password" type="password"
            className="form-input"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange} required
          />

          <label className="form-label">I am registering as</label>
          <select
            name="role"
            className="form-select"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">🧑‍💼 Student</option>
            <option value="supervisor">🎓 Supervisor</option>
          </select>

          {form.role === 'student' && (
            <>
              <label className="form-label">Your Supervisor's Email</label>
              <input
                name="supervisorEmail" type="email"
                className="form-input"
                placeholder="supervisor@mzumbe.ac.tz"
                value={form.supervisorEmail}
                onChange={handleChange}
              />
              <p className="form-hint">
                ⚠️ Supervisor must register first before you.
              </p>
            </>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? '⏳ Registering...' : '✅ Register'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login Here</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;