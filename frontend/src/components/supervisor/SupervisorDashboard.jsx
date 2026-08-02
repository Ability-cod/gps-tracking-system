// frontend/src/components/supervisor/SupervisorDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';
import locationService from '../../services/locationService';
import assessmentService from '../../services/assessmentService';
import Navbar from '../shared/Navbar';
import '../../App.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const makeIcon = (color) => new L.Icon({
    iconUrl:     `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:   'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowSize: [41,41],
});

const greenIcon = makeIcon('green');
const redIcon   = makeIcon('red');

function FlyTo({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) map.flyTo([coords.latitude, coords.longitude], 15, { duration: 1.2 });
    }, [coords]);
    return null;
}

function SupervisorDashboard() {
    const { user }   = useAuth();
    const navigate   = useNavigate();

    const [students, setStudents]       = useState([]);
    const [assessments, setAssessments] = useState({});
    const [visitLogs, setVisitLogs]     = useState([]);
    const [selected, setSelected]       = useState(null);
    const [flyTarget, setFlyTarget]     = useState(null);
    const [activeTab, setActiveTab]     = useState('map');
    const [activePanel, setActivePanel] = useState('assess');
    const [assessNote, setAssessNote]   = useState('');
    const [visitNote, setVisitNote]     = useState('');
    const [visitLoc, setVisitLoc]       = useState('');
    const [saving, setSaving]           = useState(false);
    const pollRef = useRef(null);

    const loadStudents = async () => {
        try {
            const res = await locationService.getStudentsWithLocations();
            setStudents(res.data || []);
        } catch {}
    };

    const loadAssessments = async () => {
        try {
            const res = await assessmentService.getMySupervisorAssessments();
            const map = {};
            (res.data || []).forEach((a) => { map[a.student_id] = a; });
            setAssessments(map);
        } catch {}
    };

    const loadVisitLogs = async () => {
        try {
            const res = await assessmentService.getSupervisorVisits();
            setVisitLogs(res.data || []);
        } catch {}
    };

    useEffect(() => {
        loadStudents();
        loadAssessments();
        loadVisitLogs();
        pollRef.current = setInterval(() => loadStudents(), 5000);
        return () => clearInterval(pollRef.current);
    }, []);

    const handleSelectStudent = (st) => {
        setSelected(st);
        setAssessNote(assessments[st.id]?.note || '');
        setVisitNote(''); setVisitLoc('');
        if (st.location) setFlyTarget(st.location);
    };

    const handleAssess = async (status) => {
        if (!selected) return;
        setSaving(true);
        try {
            await assessmentService.upsert(selected.id, status, assessNote);
            await loadAssessments();
        } catch (err) {
            alert(err.response?.data?.message || 'An error occurred.');
        } finally { setSaving(false); }
    };

    const handleAddVisit = async () => {
        if (!selected || !visitNote.trim()) return;
        setSaving(true);
        try {
            await assessmentService.addVisitLog(selected.id, visitNote, visitLoc);
            await loadVisitLogs();
            setVisitNote(''); setVisitLoc('');
            alert(`✅ Visit for ${selected.name} recorded!`);
        } catch (err) {
            alert(err.response?.data?.message || 'An error occurred.');
        } finally { setSaving(false); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString() : '—';
    const sharingCount  = students.filter((s) => s.location).length;
    const assessedCount = students.filter((s) => assessments[s.id]?.status === 'assessed').length;

    return (
        <div className="supervisor-page">
            <Navbar />

            {/* Stats */}
            <div className="stats-bar">
                {[
                    { label: 'All Students', value: students.length,  color: '#1a5276', icon: '👥' },
                    { label: 'Sharing Now',  value: sharingCount,     color: '#27ae60', icon: '📡' },
                    { label: 'Assessed',     value: assessedCount,    color: '#2980b9', icon: '✅' },
                    { label: 'Total Visits', value: visitLogs.length, color: '#8e44ad', icon: '🏢' },
                ].map((st) => (
                    <div key={st.label} className="stat-card" style={{ borderTop: `3px solid ${st.color}` }}>
                        <span className="stat-card__icon">{st.icon}</span>
                        <span className="stat-card__value" style={{ color: st.color }}>{st.value}</span>
                        <span className="stat-card__label">{st.label}</span>
                    </div>
                ))}
            </div>

            {/* Main Tabs */}
<div className="main-tabs">
    {[
        { key: 'map',      label: '🗺️ Map' },
        { key: 'students', label: '👥 Students' },
        { key: 'visits',   label: '📋 Visits' },
    ].map((tab) => (
        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`main-tab ${activeTab === tab.key ? 'main-tab--active' : 'main-tab--inactive'}`}>
            {tab.label}
        </button>
    ))}
    <button onClick={() => navigate('/location-history')}
        className="main-tab main-tab--inactive"
        style={{ background: '#1a5276', color: '#fff', borderColor: '#1a5276' }}>
        📍 Location History
    </button>
    <button onClick={() => navigate('/report')}
        className="main-tab main-tab--inactive"
        style={{ background: '#8e44ad', color: '#fff', borderColor: '#8e44ad' }}>
        📄 Generate Report
    </button>
</div>

            
            {/* MAP TAB */}
            {activeTab === 'map' && (
                <div className="map-layout">

                    {/* Sidebar */}
                    <div className="sidebar">
                        <p className="sidebar__title">Students ({students.length})</p>
                        <div className="student-list">
                            {students.length === 0 && (
                                <p style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                                    No students assigned yet.
                                </p>
                            )}
                            {students.map((st) => {
                                const assessed = assessments[st.id]?.status === 'assessed';
                                return (
                                    <div key={st.id} onClick={() => handleSelectStudent(st)}
                                        className={`student-card ${selected?.id === st.id ? 'student-card--selected' : 'student-card--normal'}`}>
                                        <div className="student-card__row">
                                            <div className="avatar avatar--md">
                                                {st.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p className="student-card__name">{st.name}</p>
                                                <p className="student-card__email">{st.email}</p>
                                                {/* Phone number */}
                                                {st.phone && (
                                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#2980b9', fontWeight: 600 }}>
                                                        📱 {st.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="tag-row">
                                            <span className={`badge ${st.location ? 'badge--online' : 'badge--offline'}`}>
                                                {st.location ? '📡 Live' : '📴 Offline'}
                                            </span>
                                            <span className={`badge ${assessed ? 'badge--success' : 'badge--warning'}`}>
                                                {assessed ? '✅ Assessed' : '⏳ Pending'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Map + Panel */}
                    <div className="map-section">
                        <div className="map-wrapper">
                            <MapContainer center={[-6.369028, 34.888822]} zoom={6}
                                style={{ width: '100%', height: '100%' }}>
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {flyTarget && <FlyTo coords={flyTarget} />}
                                {students.filter((s) => s.location).map((st) => {
                                    const assessed = assessments[st.id]?.status === 'assessed';
                                    return (
                                        <Marker key={st.id}
                                            position={[st.location.latitude, st.location.longitude]}
                                            icon={assessed ? greenIcon : redIcon}
                                            eventHandlers={{ click: () => handleSelectStudent(st) }}>
                                            <Popup>
                                                <strong>{st.name}</strong><br />
                                                {st.email}<br />
                                                {st.phone && <>📱 {st.phone}<br /></>}
                                                <span style={{ color: assessed ? 'green' : 'orange' }}>
                                                    {assessed ? '✅ Assessed' : '⏳ Pending'}
                                                </span><br />
                                                <small>Updated: {formatDate(st.location?.updated_at)}</small>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                            <div className="map-legend">
                                <span>🟢 Assessed</span>
                                <span>🔴 Pending</span>
                            </div>
                        </div>

                        {/* Action Panel */}
                        {selected && (
                            <div className="action-panel">
                                <div className="panel-header">
                                    <div className="avatar avatar--lg">{selected.name.charAt(0)}</div>
                                    <div>
                                        <p className="panel-name">{selected.name}</p>
                                        <p className="panel-email">{selected.email}</p>
                                        {selected.phone && (
                                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#2980b9', fontWeight: 600 }}>
                                                📱 {selected.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="panel-tabs">
                                    {[
                                        { key: 'assess', label: '📊 Assessment' },
                                        { key: 'visit',  label: '🏢 Record Visit' },
                                    ].map((tab) => (
                                        <button key={tab.key} onClick={() => setActivePanel(tab.key)}
                                            className={`panel-tab ${activePanel === tab.key ? 'panel-tab--active' : 'panel-tab--inactive'}`}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {activePanel === 'assess' && (
                                    assessments[selected.id]?.status === 'assessed' ? (
                                        <div>
                                            <div className="assessed-badge">✅ This student has been assessed</div>
                                            {assessments[selected.id]?.note && (
                                                <div className="note-box">
                                                    <strong>Note:</strong> {assessments[selected.id].note}
                                                </div>
                                            )}
                                            <button onClick={() => handleAssess('not_assessed')} disabled={saving}
                                                className="btn-action btn-danger" style={{ marginTop: '10px' }}>
                                                {saving ? 'Updating...' : '↩ Revert to Not Assessed'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="input-label">Assessment Note (optional)</label>
                                            <textarea rows={3} value={assessNote}
                                                onChange={(e) => setAssessNote(e.target.value)}
                                                placeholder="e.g. Student was found at workplace..."
                                                className="form-textarea" />
                                            <button onClick={() => handleAssess('assessed')} disabled={saving}
                                                className="btn-action btn-success">
                                                {saving ? 'Saving...' : '✅ Mark as Assessed'}
                                            </button>
                                        </div>
                                    )
                                )}

                                {activePanel === 'visit' && (
                                    <div>
                                        <label className="input-label">Workplace (optional)</label>
                                        <input type="text" value={visitLoc}
                                            onChange={(e) => setVisitLoc(e.target.value)}
                                            placeholder="e.g. NMB Bank, Dar es Salaam"
                                            className="input-field" />
                                        <label className="input-label">Visit Note *</label>
                                        <textarea rows={3} value={visitNote}
                                            onChange={(e) => setVisitNote(e.target.value)}
                                            placeholder="Details of this visit..."
                                            className="form-textarea" />
                                        <button onClick={handleAddVisit}
                                            disabled={saving || !visitNote.trim()}
                                            className="btn-action btn-purple">
                                            {saving ? 'Saving...' : '🏢 Record Visit'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
                <div className="tab-content">
                    <h3 className="section-title">👥 All Students ({students.length})</h3>
                    {students.length === 0 ? (
                        <div className="empty-box">
                            <p className="empty-box__icon">👥</p>
                            <p className="empty-box__text">No students assigned yet.</p>
                        </div>
                    ) : (
                        <div className="card-grid">
                            {students.map((st) => {
                                const a       = assessments[st.id];
                                const visited = visitLogs.filter((v) => v.student_id === st.id).length;
                                return (
                                    <div key={st.id} className="full-student-card">
                                        <div className="full-student-card__header">
                                            <div className="avatar avatar--xl">
                                                {st.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="full-student-card__name">{st.name}</p>
                                                <p className="full-student-card__email">{st.email}</p>
                                                {/* Phone number */}
                                                {st.phone && (
                                                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#2980b9', fontWeight: 600 }}>
                                                        📱 {st.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="student-stats-grid">
                                            <div className="student-stat-item">
                                                <span className="student-stat-item__label">Location</span>
                                                <span style={{ fontWeight: 700, color: st.location ? '#27ae60' : '#7f8c8d' }}>
                                                    {st.location ? '📡 Live' : '📴 Offline'}
                                                </span>
                                            </div>
                                            <div className="student-stat-item">
                                                <span className="student-stat-item__label">Assessment</span>
                                                <span style={{ fontWeight: 700, color: a?.status === 'assessed' ? '#27ae60' : '#d35400' }}>
                                                    {a?.status === 'assessed' ? '✅ Done' : '⏳ Pending'}
                                                </span>
                                            </div>
                                            <div className="student-stat-item">
                                                <span className="student-stat-item__label">Visits</span>
                                                <span style={{ fontWeight: 700, color: '#1a5276' }}>{visited}</span>
                                            </div>
                                        </div>
                                        {a?.status === 'assessed' && a?.note && (
                                            <div className="assessment-note-box">
                                                <strong>Note:</strong> {a.note}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* VISITS TAB */}
            {activeTab === 'visits' && (
                <div className="tab-content">
                    <h3 className="section-title">📋 All Visit History ({visitLogs.length})</h3>
                    {visitLogs.length === 0 ? (
                        <div className="empty-box">
                            <p className="empty-box__icon">📭</p>
                            <p className="empty-box__text">No visits recorded yet.</p>
                        </div>
                    ) : (
                        <div className="card-grid">
                            {visitLogs.map((log) => (
                                <div key={log.id} className="visit-card">
                                    <div className="visit-card__header">
                                        <div className="visit-card__icon">🏢</div>
                                        <div style={{ flex: 1 }}>
                                            <p className="visit-card__student">{log.student_name}</p>
                                            <p className="visit-card__date">{formatDate(log.visited_at)}</p>
                                        </div>
                                    </div>
                                    {log.location_name && (
                                        <p className="visit-card__location">📍 {log.location_name}</p>
                                    )}
                                    {log.note && <div className="visit-card__note">{log.note}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SupervisorDashboard;