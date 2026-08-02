// frontend/src/components/shared/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import Navbar from './Navbar';
import '../../App.css';

function Profile() {
    const { user } = useAuth();

    const [name, setName]                         = useState('');
    const [phone, setPhone]                       = useState('');
    const [profileMsg, setProfileMsg]             = useState({ text: '', type: '' });
    const [profileLoading, setProfileLoading]     = useState(false);
    const [currentPassword, setCurrentPassword]   = useState('');
    const [newPassword, setNewPassword]           = useState('');
    const [confirmPassword, setConfirmPassword]   = useState('');
    const [passwordMsg, setPasswordMsg]           = useState({ text: '', type: '' });
    const [passwordLoading, setPasswordLoading]   = useState(false);
    const [activeTab, setActiveTab]               = useState('info');

    useEffect(() => {
        if (user) {
            setName(user.name   || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const getRoleLabel = (role) => {
        if (role === 'admin')      return '⚙️ Administrator';
        if (role === 'supervisor') return '🎓 Supervisor';
        return '🧑‍💼 Student';
    };

    const getRoleColor = (role) => {
        if (role === 'admin')      return '#7d3c98';
        if (role === 'supervisor') return '#1a5276';
        return '#2980b9';
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileMsg({ text: '', type: '' });
        if (!name.trim()) {
            setProfileMsg({ text: 'Name is required.', type: 'error' });
            return;
        }
        try {
            setProfileLoading(true);
            await profileService.updateProfile(name.trim(), phone.trim());
            const savedUser   = JSON.parse(localStorage.getItem('user') || '{}');
            savedUser.name    = name.trim();
            savedUser.phone   = phone.trim();
            localStorage.setItem('user', JSON.stringify(savedUser));
            setProfileMsg({ text: '✅ Profile updated successfully!', type: 'success' });
        } catch (err) {
            setProfileMsg({
                text: err.response?.data?.message || 'Failed to update profile.',
                type: 'error',
            });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMsg({ text: '', type: '' });
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMsg({ text: 'All fields are required.', type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ text: 'Passwords do not match.', type: 'error' });
            return;
        }
        try {
            setPasswordLoading(true);
            await profileService.changePassword(currentPassword, newPassword, confirmPassword);
            setPasswordMsg({ text: '✅ Password changed successfully!', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMsg({
                text: err.response?.data?.message || 'Failed to change password.',
                type: 'error',
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'long', year: 'numeric',
        });
    };

    return (
        <div className="page">
            <Navbar />
            <div className="container">

                {/* Header */}
                <div className="welcome-card" style={{
                    marginBottom: '24px',
                    background: `linear-gradient(135deg, ${getRoleColor(user?.role)}, ${user?.role === 'admin' ? '#9b59b6' : '#2980b9'})`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '32px', fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="welcome-card__title">{user?.name}</h2>
                            <p className="welcome-card__subtitle">{user?.email}</p>
                            {user?.phone && (
                                <p style={{ margin: '2px 0 0', opacity: 0.85, fontSize: '13px' }}>
                                    📱 {user.phone}
                                </p>
                            )}
                            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px' }}>
                                Member since {formatDate(user?.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="role-tag">{getRoleLabel(user?.role)}</div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'info' ? 'tab-btn--active' : 'tab-btn--inactive'}`}
                        onClick={() => setActiveTab('info')}
                    >
                        👤 Personal Info
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'password' ? 'tab-btn--active' : 'tab-btn--inactive'}`}
                        onClick={() => setActiveTab('password')}
                    >
                        🔒 Change Password
                    </button>
                </div>

                {/* PERSONAL INFO TAB */}
                {activeTab === 'info' && (
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Personal Information</h3>

                        {/* Read-only info */}
                        <div style={styles.infoGrid}>
                            <div style={styles.infoItem}>
                                <span style={styles.infoLabel}>Email Address</span>
                                <span style={styles.infoValue}>{user?.email}</span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.infoLabel}>Role</span>
                                <span style={{ ...styles.infoValue, color: getRoleColor(user?.role) }}>
                                    {getRoleLabel(user?.role)}
                                </span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.infoLabel}>Phone Number</span>
                                <span style={styles.infoValue}>
                                    {user?.phone || '— Not set'}
                                </span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.infoLabel}>Member Since</span>
                                <span style={styles.infoValue}>{formatDate(user?.created_at)}</span>
                            </div>
                        </div>

                        <hr style={styles.divider} />
                        <h4 style={styles.subTitle}>Update Profile</h4>

                        {profileMsg.text && (
                            <div className={`alert ${profileMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                                {profileMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="form">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="e.g. +255 712 345 678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="btn btn-primary"
                                style={{ marginTop: '16px' }}
                            >
                                {profileLoading ? '⏳ Saving...' : '💾 Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {/* CHANGE PASSWORD TAB */}
                {activeTab === 'password' && (
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Change Password</h3>
                        <p style={styles.cardSubtitle}>
                            Choose a strong password with at least 6 characters.
                        </p>

                        {passwordMsg.text && (
                            <div className={`alert ${passwordMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                                {passwordMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="form">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Your current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Min. 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="btn btn-primary"
                                style={{ marginTop: '16px' }}
                            >
                                {passwordLoading ? '⏳ Changing...' : '🔒 Change Password'}
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}

const styles = {
    card: {
        background: '#fff', borderRadius: '12px', padding: '28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eaecee',
    },
    cardTitle:    { margin: '0 0 20px', fontSize: '18px', color: '#1a5276', fontWeight: 700 },
    cardSubtitle: { margin: '-12px 0 20px', fontSize: '13px', color: '#7f8c8d' },
    subTitle:     { margin: '0 0 16px', fontSize: '15px', color: '#2c3e50', fontWeight: 600 },
    infoGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
    infoItem:     { background: '#f8f9fa', borderRadius: '8px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' },
    infoLabel:    { fontSize: '11px', fontWeight: 700, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoValue:    { fontSize: '15px', fontWeight: 600, color: '#2c3e50' },
    divider:      { border: 'none', borderTop: '1px solid #eaecee', margin: '0 0 24px' },
};

export default Profile;