// frontend/src/components/supervisor/LocationHistory.jsx
import { useState, useEffect } from 'react';
import historyService from '../../services/historyService';
import locationService from '../../services/locationService';
import Navbar from '../shared/Navbar';
import '../../App.css';

function LocationHistory() {
    const [history, setHistory]             = useState([]);
    const [students, setStudents]           = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('all');
    const [selectedDays, setSelectedDays]   = useState(30);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState('');
    const [studentDetail, setStudentDetail] = useState(null);

    // Load history na students wakati ukianza
    useEffect(() => {
        loadHistory();
        loadStudents();
    }, [selectedDays]);

    const loadStudents = async () => {
        try {
            const res = await locationService.getStudentsWithLocations();
            setStudents(res.data || []);
        } catch {}
    };

    const loadHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await historyService.getAllHistory(selectedDays);
            setHistory(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load history.');
        } finally {
            setLoading(false);
        }
    };

    const loadStudentHistory = async (studentId) => {
        setLoading(true);
        setError('');
        try {
            const res = await historyService.getStudentHistory(studentId, selectedDays);
            setStudentDetail(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load student history.');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentChange = async (studentId) => {
        setSelectedStudent(studentId);
        setStudentDetail(null);
        if (studentId !== 'all') {
            await loadStudentHistory(studentId);
        }
    };

    // Format date — inaonyesha siku na wakati
    const formatDateTime = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('en-GB', {
            day:    '2-digit',
            month:  'short',
            year:   'numeric',
            hour:   '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    // Format muda wa kushare
    const formatDuration = (minutes) => {
        if (!minutes) return 'Still sharing';
        if (minutes < 1) return 'Less than 1 min';
        if (minutes < 60) return `${Math.round(minutes)} min`;
        const hrs  = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hrs}h ${mins}m`;
    };

    // Pata rangi kulingana na muda
    const getDurationColor = (minutes) => {
        if (!minutes) return '#27ae60'; // bado inashare
        if (minutes < 30)  return '#e74c3c';  // chini ya dakika 30
        if (minutes < 120) return '#e67e22';  // chini ya saa 2
        return '#27ae60';                      // saa 2 au zaidi
    };

    // Chuja history kulingana na student aliyechaguliwa
    const filteredHistory = selectedStudent === 'all'
        ? history
        : history.filter((h) => h.student_id == selectedStudent);

    // Hesabu stats
    const totalSessions    = filteredHistory.length;
    const activeSessions   = filteredHistory.filter((h) => !h.ended_at).length;
    const completedSessions = filteredHistory.filter((h) => h.ended_at).length;
    const totalMinutes     = filteredHistory.reduce((sum, h) => sum + (h.duration_minutes || 0), 0);

    const displayHistory   = studentDetail ? studentDetail.history : filteredHistory;
    const displayStudent   = studentDetail ? studentDetail.student : null;

    return (
        <div className="page">
            <Navbar />

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

                {/* Header */}
                <div className="welcome-card" style={{ marginBottom: '24px' }}>
                    <div>
                        <h2 className="welcome-card__title">📍 Location Sharing History</h2>
                        <p className="welcome-card__subtitle">
                            View when students shared their location — date, start time and end time
                        </p>
                    </div>
                    <div className="role-tag">🎓 Supervisor</div>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {/* Filters */}
                <div style={s.filterBar}>
                    {/* Student filter */}
                    <div style={s.filterGroup}>
                        <label style={s.filterLabel}>Filter by Student</label>
                        <select className="form-select"
                            value={selectedStudent}
                            onChange={(e) => handleStudentChange(e.target.value)}
                            style={{ minWidth: '220px' }}>
                            <option value="all">👥 All Students</option>
                            {students.map((st) => (
                                <option key={st.id} value={st.id}>
                                    {st.name} {st.phone ? `(${st.phone})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Days filter */}
                    <div style={s.filterGroup}>
                        <label style={s.filterLabel}>Time Period</label>
                        <select className="form-select"
                            value={selectedDays}
                            onChange={(e) => { setSelectedDays(Number(e.target.value)); setStudentDetail(null); }}
                            style={{ minWidth: '160px' }}>
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={60}>Last 60 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    </div>
                </div>

                {/* Selected student info */}
                {displayStudent && (
                    <div style={s.studentBanner}>
                        <div style={s.studentBannerAvatar}>
                            {displayStudent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#1a5276' }}>
                                {displayStudent.name}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#7f8c8d' }}>
                                {displayStudent.email}
                                {displayStudent.phone && ` • 📱 ${displayStudent.phone}`}
                            </p>
                        </div>
                        <button onClick={() => { setSelectedStudent('all'); setStudentDetail(null); }}
                            style={s.clearBtn}>
                            ✕ Show All
                        </button>
                    </div>
                )}

                {/* Summary Stats */}
                <div style={s.statsGrid}>
                    {[
                        { label: 'Total Sessions', value: totalSessions,    color: '#1a5276', icon: '📊' },
                        { label: 'Active Now',      value: activeSessions,   color: '#27ae60', icon: '🟢' },
                        { label: 'Completed',       value: completedSessions,color: '#2980b9', icon: '✅' },
                        { label: 'Total Time',      value: formatDuration(totalMinutes), color: '#8e44ad', icon: '⏱️' },
                    ].map((st) => (
                        <div key={st.label} style={{ ...s.statCard, borderTop: `3px solid ${st.color}` }}>
                            <span style={{ fontSize: '24px' }}>{st.icon}</span>
                            <span style={{ fontSize: '22px', fontWeight: 800, color: st.color }}>{st.value}</span>
                            <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 600 }}>{st.label}</span>
                        </div>
                    ))}
                </div>

                {/* History Table */}
                <div style={s.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={s.cardTitle}>
                            📋 Session History
                            {displayHistory.length > 0 && (
                                <span style={s.countBadge}>{displayHistory.length}</span>
                            )}
                        </h3>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                            ⏳ Loading history...
                        </div>
                    ) : displayHistory.length === 0 ? (
                        <div className="empty-box">
                            <p className="empty-box__icon">📍</p>
                            <p className="empty-box__text">
                                No location sharing history found for the selected period.
                            </p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={s.table}>
                                <thead>
                                    <tr style={s.thead}>
                                        <th style={s.th}>#</th>
                                        <th style={s.th}>Student</th>
                                        <th style={s.th}>Phone</th>
                                        <th style={s.th}>Date</th>
                                        <th style={s.th}>Started At</th>
                                        <th style={s.th}>Ended At</th>
                                        <th style={s.th}>Duration</th>
                                        <th style={s.th}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayHistory.map((record, index) => (
                                        <tr key={record.id}
                                            style={{ ...s.tr, background: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                                            <td style={s.td}>{index + 1}</td>
                                            <td style={{ ...s.td, fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={s.miniAvatar}>
                                                        {record.student_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600 }}>{record.student_name}</p>
                                                        <p style={{ margin: 0, fontSize: '11px', color: '#7f8c8d' }}>{record.student_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ ...s.td, color: '#2980b9', fontSize: '13px' }}>
                                                {record.student_phone ? `📱 ${record.student_phone}` : '—'}
                                            </td>
                                            <td style={s.td}>
                                                <span style={s.dateBadge}>
                                                    📅 {new Date(record.started_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                            </td>
                                            <td style={s.td}>
                                                <span style={s.timeBadge}>
                                                    🕐 {new Date(record.started_at).toLocaleTimeString('en-GB', {
                                                        hour: '2-digit', minute: '2-digit', hour12: false
                                                    })}
                                                </span>
                                            </td>
                                            <td style={s.td}>
                                                {record.ended_at ? (
                                                    <span style={s.timeBadge}>
                                                        🕐 {new Date(record.ended_at).toLocaleTimeString('en-GB', {
                                                            hour: '2-digit', minute: '2-digit', hour12: false
                                                        })}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#27ae60', fontWeight: 600, fontSize: '12px' }}>
                                                        Still sharing...
                                                    </span>
                                                )}
                                            </td>
                                            <td style={s.td}>
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: getDurationColor(record.duration_minutes),
                                                    fontSize: '13px',
                                                }}>
                                                    ⏱️ {formatDuration(record.duration_minutes)}
                                                </span>
                                            </td>
                                            <td style={s.td}>
                                                {record.ended_at ? (
                                                    <span className="badge badge--offline">✅ Completed</span>
                                                ) : (
                                                    <span className="badge badge--online">🟢 Active</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="alert alert-info">
                    ℹ️ <strong>Duration Color Guide:</strong>&nbsp;
                    <span style={{ color: '#e74c3c', fontWeight: 600 }}>Red = Less than 30 min</span> &nbsp;|&nbsp;
                    <span style={{ color: '#e67e22', fontWeight: 600 }}>Orange = Less than 2 hours</span> &nbsp;|&nbsp;
                    <span style={{ color: '#27ae60', fontWeight: 600 }}>Green = 2 hours or more</span>
                </div>

            </div>
        </div>
    );
}

const s = {
    filterBar: {
        display: 'flex', gap: '16px', flexWrap: 'wrap',
        marginBottom: '20px', alignItems: 'flex-end',
    },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    filterLabel: { fontSize: '13px', fontWeight: 600, color: '#2c3e50' },
    studentBanner: {
        background: '#eaf4fb', border: '1px solid #aed6f1',
        borderRadius: '10px', padding: '14px 16px',
        display: 'flex', alignItems: 'center',
        gap: '14px', marginBottom: '20px',
    },
    studentBannerAvatar: {
        width: '44px', height: '44px', borderRadius: '50%',
        background: '#1a5276', color: '#fff',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 700,
        fontSize: '18px', flexShrink: 0,
    },
    clearBtn: {
        marginLeft: 'auto', padding: '6px 14px',
        background: '#fff', border: '1px solid #aed6f1',
        borderRadius: '6px', cursor: 'pointer',
        fontSize: '13px', fontWeight: 600, color: '#1a5276',
    },
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '20px',
    },
    statCard: {
        background: '#fff', borderRadius: '10px', padding: '16px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '6px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
    },
    card: {
        background: '#fff', borderRadius: '12px', padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #eaecee', marginBottom: '16px',
    },
    cardTitle: { margin: 0, fontSize: '17px', color: '#1a5276', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' },
    countBadge: { background: '#1a5276', color: '#fff', borderRadius: '12px', padding: '2px 10px', fontSize: '13px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    thead: { background: '#1a5276' },
    th:    { padding: '10px 12px', textAlign: 'left', color: '#fff', fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap' },
    tr:    { borderBottom: '1px solid #eaecee' },
    td:    { padding: '10px 12px', verticalAlign: 'middle' },
    miniAvatar: {
        width: '30px', height: '30px', borderRadius: '50%',
        background: '#1a5276', color: '#fff',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 700,
        fontSize: '12px', flexShrink: 0,
    },
    dateBadge: { background: '#f0f4f8', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#1a5276' },
    timeBadge: { background: '#f8f9fa', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#2c3e50' },
};

export default LocationHistory;