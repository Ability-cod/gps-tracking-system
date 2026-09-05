// frontend/src/components/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../../context/AuthContext';
import { useSettings }         from '../../context/SettingsContext';
import adminService            from '../../services/adminService';
import Navbar                  from '../shared/Navbar';
import '../../App.css';

function AdminDashboard() {
    const { user }     = useAuth();
    const { settings } = useSettings();
    const navigate     = useNavigate();

    const [activeTab, setActiveTab]         = useState('dashboard');
    const [stats, setStats]                 = useState(null);
    const [users, setUsers]                 = useState([]);
    const [supervisors, setSupervisors]     = useState([]);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState('');
    const [success, setSuccess]             = useState('');

    const [addForm, setAddForm] = useState({
        name: '', email: '', password: '',
        role: 'supervisor', supervisor_id: '', phone: '',
    });
    const [addLoading, setAddLoading]       = useState(false);
    const [resetModal, setResetModal]       = useState(null);
    const [newPassword, setNewPassword]     = useState('');
    const [resetLoading, setResetLoading]   = useState(false);
    const [deleteModal, setDeleteModal]     = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [filterRole, setFilterRole]       = useState('all');
    const [searchTerm, setSearchTerm]       = useState('');

    const loadStats = async () => {
        try {
            const res = await adminService.getStats();
            setStats(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load stats.');
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllUsers();
            setUsers(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users.');
        } finally { setLoading(false); }
    };

    const loadSupervisors = async () => {
        try {
            const res = await adminService.getSupervisors();
            setSupervisors(res.data || []);
        } catch {}
    };

    useEffect(() => {
        loadStats(); loadUsers(); loadSupervisors();
    }, []);

    const showSuccess = (msg) => {
        setSuccess(msg); setError('');
        setTimeout(() => setSuccess(''), 4000);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddLoading(true); setError('');
        try {
            await adminService.addUser(
                addForm.name, addForm.email, addForm.password,
                addForm.role,
                addForm.role === 'student' ? addForm.supervisor_id : null,
                addForm.phone
            );
            showSuccess(`✅ ${addForm.role === 'supervisor' ? 'Supervisor' : 'Student'} "${addForm.name}" added!`);
            setAddForm({ name: '', email: '', password: '', role: 'supervisor', supervisor_id: '', phone: '' });
            loadUsers(); loadStats(); loadSupervisors();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add user.');
        } finally { setAddLoading(false); }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters.'); return;
        }
        setResetLoading(true);
        try {
            await adminService.resetPassword(resetModal.userId, newPassword);
            showSuccess(`✅ Password for "${resetModal.userName}" reset!`);
            setResetModal(null); setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally { setResetLoading(false); }
    };

    const handleDeleteUser = async () => {
        setDeleteLoading(true);
        try {
            await adminService.deleteUser(deleteModal.userId);
            showSuccess(`✅ User "${deleteModal.userName}" deleted.`);
            setDeleteModal(null);
            loadUsers(); loadStats(); loadSupervisors();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user.');
        } finally { setDeleteLoading(false); }
    };

    const filteredUsers = users.filter((u) => {
        const matchRole   = filterRole === 'all' || u.role === filterRole;
        const matchSearch = !searchTerm ||
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.phone && u.phone.includes(searchTerm));
        return matchRole && matchSearch;
    });

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    };

    return (
        <div className="page" style={{ minHeight: '100vh', background: '#f0f4f8' }}>
            <Navbar />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

                {/* Header */}
                <div className="welcome-card" style={{ marginBottom: '24px' }}>
                    <div>
                        <h2 className="welcome-card__title">🔧 Admin Dashboard</h2>
                        <p className="welcome-card__subtitle">
                            {settings.name} — {settings.program_label} System Management
                        </p>
                    </div>
                    <div className="role-tag">⚙️ Administrator</div>
                </div>

                {success && <div className="alert alert-success">{success}</div>}
                {error   && <div className="alert alert-error">⚠️ {error}</div>}

                {/* Tabs */}
                <div className="tabs" style={{ marginBottom: '24px' }}>
                    {[
                        { key: 'dashboard', label: '📊 Dashboard' },
                        { key: 'users',     label: `👥 Manage Users (${users.length})` },
                        { key: 'add',       label: '➕ Add User' },
                    ].map((tab) => (
                        <button key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setError(''); setSuccess(''); }}
                            className={`tab-btn ${activeTab === tab.key ? 'tab-btn--active' : 'tab-btn--inactive'}`}>
                            {tab.label}
                        </button>
                    ))}

                    {/* Institution Settings Button */}
                    <button
                        onClick={() => navigate('/admin/settings')}
                        className="tab-btn tab-btn--inactive"
                        style={{ background: '#8e44ad', color: '#fff', borderColor: '#8e44ad' }}
                    >
                        🏛️ Institution Settings
                    </button>
                </div>

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && stats && (
                    <div>
                        <div style={s.statsGrid}>
                            {[
                                { label: 'Total Users',  value: stats.total_users,       color: '#1a5276', icon: '👥' },
                                { label: 'Supervisors',  value: stats.total_supervisors, color: '#2980b9', icon: '🎓' },
                                { label: 'Students',     value: stats.total_students,    color: '#8e44ad', icon: '🧑‍💼' },
                                { label: 'Assessed',     value: stats.total_assessed,    color: '#27ae60', icon: '✅' },
                                { label: 'Total Visits', value: stats.total_visits,      color: '#e67e22', icon: '🏢' },
                                { label: 'Sharing Now',  value: stats.active_locations,  color: '#e74c3c', icon: '📡' },
                            ].map((st) => (
                                <div key={st.label} style={{ ...s.statCard, borderTop: `3px solid ${st.color}` }}>
                                    <span style={{ fontSize: '28px' }}>{st.icon}</span>
                                    <span style={{ fontSize: '28px', fontWeight: 800, color: st.color }}>{st.value}</span>
                                    <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 600 }}>{st.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Recent registrations */}
                        <div style={s.card}>
                            <h3 style={s.cardTitle}>🕒 Recent Registrations (Last 7 Days)</h3>
                            {stats.recent_users.length === 0 ? (
                                <p style={{ color: '#7f8c8d', fontSize: '14px' }}>No new registrations in last 7 days.</p>
                            ) : (
                                <table style={s.table}>
                                    <thead>
                                        <tr style={s.thead}>
                                            <th style={s.th}>Name</th>
                                            <th style={s.th}>Email</th>
                                            <th style={s.th}>Phone</th>
                                            <th style={s.th}>Role</th>
                                            <th style={s.th}>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_users.map((u) => (
                                            <tr key={u.id} style={s.tr}>
                                                <td style={s.td}>{u.name}</td>
                                                <td style={s.td}>{u.email}</td>
                                                <td style={{ ...s.td, color: '#2980b9' }}>{u.phone || '—'}</td>
                                                <td style={s.td}>
                                                    <span className={`badge ${u.role === 'supervisor' ? 'badge--success' : 'badge--warning'}`}>
                                                        {u.role === 'supervisor' ? '🎓 Supervisor' : '🧑‍💼 Student'}
                                                    </span>
                                                </td>
                                                <td style={s.td}>{formatDate(u.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Quick link to institution settings */}
                        <div className="alert alert-info">
                            🏛️ <strong>Want to customize the system?</strong>&nbsp;
                            <button
                                onClick={() => navigate('/admin/settings')}
                                style={{ background: 'none', border: 'none', color: '#2980b9', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline', padding: 0 }}
                            >
                                Go to Institution Settings
                            </button>
                            &nbsp;— Change your institution name, logo, colors and contact info.
                        </div>
                    </div>
                )}

                {/* MANAGE USERS TAB */}
                {activeTab === 'users' && (
                    <div style={s.card}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <input type="text" className="form-input"
                                placeholder="🔍 Search by name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ flex: 1, minWidth: '200px' }} />
                            <select className="form-select" value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                style={{ width: '160px' }}>
                                <option value="all">All Roles</option>
                                <option value="supervisor">Supervisors</option>
                                <option value="student">Students</option>
                            </select>
                        </div>

                        {loading ? (
                            <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px' }}>⏳ Loading users...</p>
                        ) : filteredUsers.length === 0 ? (
                            <div className="empty-box">
                                <p className="empty-box__icon">👥</p>
                                <p className="empty-box__text">No users found.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={s.table}>
                                    <thead>
                                        <tr style={s.thead}>
                                            <th style={s.th}>#</th>
                                            <th style={s.th}>Name</th>
                                            <th style={s.th}>Email</th>
                                            <th style={s.th}>Phone</th>
                                            <th style={s.th}>Role</th>
                                            <th style={s.th}>Supervisor</th>
                                            <th style={s.th}>Visits</th>
                                            <th style={s.th}>Assessment</th>
                                            <th style={s.th}>Joined</th>
                                            <th style={s.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u, i) => (
                                            <tr key={u.id} style={{ ...s.tr, background: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                                                <td style={s.td}>{i + 1}</td>
                                                <td style={{ ...s.td, fontWeight: 600 }}>{u.name}</td>
                                                <td style={{ ...s.td, fontSize: '12px', color: '#7f8c8d' }}>{u.email}</td>
                                                <td style={{ ...s.td, color: '#2980b9', fontWeight: 600 }}>
                                                    {u.phone ? `📱 ${u.phone}` : '—'}
                                                </td>
                                                <td style={s.td}>
                                                    <span className={`badge ${u.role === 'supervisor' ? 'badge--success' : 'badge--warning'}`}>
                                                        {u.role === 'supervisor' ? '🎓 Supervisor' : '🧑‍💼 Student'}
                                                    </span>
                                                </td>
                                                <td style={{ ...s.td, fontSize: '12px' }}>
                                                    {u.supervisor_name || '—'}
                                                </td>
                                                <td style={{ ...s.td, textAlign: 'center' }}>
                                                    {u.role === 'student' ? u.visit_count || 0 : '—'}
                                                </td>
                                                <td style={s.td}>
                                                    {u.role === 'student' ? (
                                                        <span className={`badge ${u.assessment_status === 'assessed' ? 'badge--success' : 'badge--offline'}`}>
                                                            {u.assessment_status === 'assessed' ? '✅ Done' : '⏳ Pending'}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td style={{ ...s.td, fontSize: '12px' }}>{formatDate(u.created_at)}</td>
                                                <td style={s.td}>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            onClick={() => { setResetModal({ userId: u.id, userName: u.name }); setNewPassword(''); }}
                                                            style={s.btnBlue} title="Reset Password">🔑
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteModal({ userId: u.id, userName: u.name })}
                                                            style={s.btnRed} title="Delete User">🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ADD USER TAB */}
                {activeTab === 'add' && (
                    <div style={s.card}>
                        <h3 style={s.cardTitle}>➕ Add New User</h3>
                        <p style={s.cardSubtitle}>
                            Create supervisor or student accounts and assign their credentials.
                        </p>

                        <form onSubmit={handleAddUser} className="form">
                            <div style={s.formGrid}>
                                <div>
                                    <label className="form-label">Full Name *</label>
                                    <input type="text" className="form-input"
                                        placeholder="e.g. Dr. John Mbwana"
                                        value={addForm.name}
                                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                        required />
                                </div>
                                <div>
                                    <label className="form-label">Email Address *</label>
                                    <input type="email" className="form-input"
                                        placeholder="e.g. john@university.ac.tz"
                                        value={addForm.email}
                                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                        required />
                                </div>
                                <div>
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" className="form-input"
                                        placeholder="e.g. +255 712 345 678"
                                        value={addForm.phone}
                                        onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Password *</label>
                                    <input type="text" className="form-input"
                                        placeholder="Min. 6 characters"
                                        value={addForm.password}
                                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                                        required />
                                    <p className="form-hint">User can change this after first login.</p>
                                </div>
                                <div>
                                    <label className="form-label">Role *</label>
                                    <select className="form-select" value={addForm.role}
                                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value, supervisor_id: '' })}>
                                        <option value="supervisor">🎓 Supervisor</option>
                                        <option value="student">🧑‍💼 Student</option>
                                    </select>
                                </div>
                                {addForm.role === 'student' && (
                                    <div>
                                        <label className="form-label">Assign Supervisor *</label>
                                        <select className="form-select" value={addForm.supervisor_id}
                                            onChange={(e) => setAddForm({ ...addForm, supervisor_id: e.target.value })}
                                            required>
                                            <option value="">— Select Supervisor —</option>
                                            {supervisors.map((sv) => (
                                                <option key={sv.id} value={sv.id}>
                                                    {sv.name}{sv.phone ? ` (${sv.phone})` : ''} — {sv.email}
                                                </option>
                                            ))}
                                        </select>
                                        {supervisors.length === 0 && (
                                            <p className="form-hint">⚠️ No supervisors found. Add a supervisor first.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {addForm.name && addForm.email && addForm.password && (
                                <div className="alert alert-info" style={{ marginTop: '16px' }}>
                                    <strong>📋 Credentials to Share:</strong><br />
                                    Name: <strong>{addForm.name}</strong><br />
                                    Email: <strong>{addForm.email}</strong><br />
                                    Password: <strong>{addForm.password}</strong><br />
                                    {addForm.phone && <>Phone: <strong>{addForm.phone}</strong><br /></>}
                                    Role: <strong>{addForm.role}</strong>
                                </div>
                            )}

                            <button type="submit" disabled={addLoading}
                                className="btn btn-primary" style={{ marginTop: '16px' }}>
                                {addLoading ? '⏳ Adding...' : `➕ Add ${addForm.role === 'supervisor' ? 'Supervisor' : 'Student'}`}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* RESET PASSWORD MODAL */}
            {resetModal && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <h3 style={s.modalTitle}>🔑 Reset Password</h3>
                        <p style={s.modalSubtitle}>Resetting password for: <strong>{resetModal.userName}</strong></p>
                        {error && <div className="alert alert-error" style={{ marginBottom: '12px' }}>⚠️ {error}</div>}
                        <label className="form-label">New Password</label>
                        <input type="text" className="form-input"
                            placeholder="Min. 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoFocus />
                        <p className="form-hint">The user will use this to login.</p>
                        <div style={s.modalBtns}>
                            <button onClick={() => { setResetModal(null); setNewPassword(''); setError(''); }}
                                style={s.cancelBtn}>Cancel</button>
                            <button onClick={handleResetPassword} disabled={resetLoading}
                                className="btn btn-primary" style={{ marginTop: 0, flex: 1 }}>
                                {resetLoading ? '⏳ Resetting...' : '🔑 Reset Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteModal && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <h3 style={{ ...s.modalTitle, color: '#e74c3c' }}>🗑️ Delete User</h3>
                        <p style={s.modalSubtitle}>
                            Are you sure you want to delete <strong>{deleteModal.userName}</strong>?
                        </p>
                        <div className="alert alert-error">
                            ⚠️ This cannot be undone. All their data will also be deleted.
                        </div>
                        <div style={s.modalBtns}>
                            <button onClick={() => { setDeleteModal(null); setError(''); }}
                                style={s.cancelBtn}>Cancel</button>
                            <button onClick={handleDeleteUser} disabled={deleteLoading}
                                className="btn btn-danger" style={{ marginTop: 0, flex: 1 }}>
                                {deleteLoading ? '⏳ Deleting...' : '🗑️ Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const s = {
    statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' },
    statCard:    { background: '#fff', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)' },
    card:        { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eaecee', marginBottom: '16px' },
    cardTitle:   { margin: '0 0 16px', fontSize: '17px', color: '#1a5276', fontWeight: 700 },
    cardSubtitle:{ margin: '-8px 0 16px', fontSize: '13px', color: '#7f8c8d' },
    formGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' },
    table:       { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    thead:       { background: '#1a5276' },
    th:          { padding: '10px 12px', textAlign: 'left', color: '#fff', fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap' },
    tr:          { borderBottom: '1px solid #eaecee' },
    td:          { padding: '10px 12px', verticalAlign: 'middle' },
    btnBlue:     { padding: '4px 8px', background: '#eaf4fb', border: '1px solid #2980b9', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
    btnRed:      { padding: '4px 8px', background: '#fde8e8', border: '1px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
    overlay:     { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
    modal:       { background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    modalTitle:  { margin: '0 0 8px', fontSize: '18px', color: '#1a5276', fontWeight: 700 },
    modalSubtitle:{ margin: '0 0 16px', fontSize: '14px', color: '#555' },
    modalBtns:   { display: 'flex', gap: '10px', marginTop: '16px' },
    cancelBtn:   { flex: 1, padding: '11px', background: '#f0f4f8', border: '1px solid #d5dbdb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 600 },
};

export default AdminDashboard;