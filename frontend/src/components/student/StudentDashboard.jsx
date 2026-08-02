import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import locationService from '../../services/locationService';
import assessmentService from '../../services/assessmentService';
import Navbar from '../shared/Navbar';
import '../../App.css';

function StudentDashboard() {
  const { user } = useAuth();

  const [isSharing, setIsSharing]   = useState(false);
  const [coords, setCoords]         = useState(null);
  const [error, setError]           = useState('');
  const [consent, setConsent]       = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [visitLogs, setVisitLogs]   = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [activeTab, setActiveTab]   = useState('location');

  const watchIdRef = useRef(null);

  useEffect(() => {
    loadVisitLogs();
    loadAssessment();
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        locationService.stopSharing().catch(() => {});
      }
    };
  }, []);

  const loadVisitLogs = async () => {
    try {
      const res = await assessmentService.getMyVisits();
      setVisitLogs(res.data || []);
    } catch {}
  };

  const loadAssessment = async () => {
    try {
      const res = await assessmentService.getByStudent(user.id);
      setAssessment(res.data);
    } catch {}
  };

  const handleStart = () => {
    if (!consent) {
      setError('Please accept the terms before sharing your location.');
      return;
    }
    if (!navigator.geolocation) {
      setError('Your browser does not support GPS.');
      return;
    }
    setError('');

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({
          latitude:  latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          accuracy:  Math.round(accuracy),
        });
        setLastUpdate(new Date().toLocaleTimeString());
        try {
          await locationService.updateLocation(latitude, longitude, accuracy);
        } catch {}
      },
      (err) => {
        const msgs = {
          1: 'Location permission denied. Please allow GPS in your browser.',
          2: 'Location unavailable. Check your GPS or internet connection.',
          3: 'Location request timed out. Please try again.',
        };
        setError(msgs[err.code] || 'Unknown GPS error.');
        setIsSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );

    watchIdRef.current = watchId;
    setIsSharing(true);
  };

  const handleStop = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    try {
      await locationService.stopSharing();
    } catch {}
    setIsSharing(false);
    setCoords(null);
    setLastUpdate(null);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString();
  };

  return (
    <div className="page">
      <Navbar />

      <div className="container">

        {/* Welcome Banner */}
        <div className="welcome-card">
          <div>
            <h2 className="welcome-card__title">Welcome, {user?.name} 👋</h2>
            <p className="welcome-card__subtitle">
              Field Attachment Supervision System
            </p>
          </div>
          <div className="role-tag">🧑‍💼 Student</div>
        </div>

        {/* Assessment Status */}
        {assessment && (
          <div className={`assess-banner ${
            assessment.status === 'assessed'
              ? 'assess-banner--done'
              : 'assess-banner--pending'
          }`}>
            {assessment.status === 'assessed'
              ? `✅ You have been assessed${assessment.note ? `: "${assessment.note}"` : ''}`
              : '⏳ You have not been assessed yet by your supervisor'}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'location' ? 'tab-btn--active' : 'tab-btn--inactive'}`}
            onClick={() => setActiveTab('location')}
          >
            📍 Share Location
          </button>
          <button
            className={`tab-btn ${activeTab === 'visits' ? 'tab-btn--active' : 'tab-btn--inactive'}`}
            onClick={() => setActiveTab('visits')}
          >
            📋 Supervisor Visits ({visitLogs.length})
          </button>
        </div>

        {/* LOCATION TAB */}
        {activeTab === 'location' && (
          <div>

            {/* Status Card */}
            <div className={`status-card ${isSharing ? 'status-card--active' : 'status-card--inactive'}`}>
              <div className="status-row">
                <div className={`status-dot ${isSharing ? 'status-dot--active' : 'status-dot--inactive'}`} />
                <div>
                  <p className={isSharing ? 'status-text--active' : 'status-text--inactive'}>
                    {isSharing ? '🟢 Location Sharing is ON' : '⭕ Location Sharing is OFF'}
                  </p>
                  <p className="status-subtext">
                    {isSharing
                      ? 'Your supervisor can see you on the map'
                      : 'Your supervisor cannot see you'}
                  </p>
                </div>
              </div>

              {isSharing && coords && (
                <div className="coords-grid">
                  {[
                    ['Latitude',    coords.latitude + '°'],
                    ['Longitude',   coords.longitude + '°'],
                    ['Accuracy',    '±' + coords.accuracy + 'm'],
                    ['Last Update', lastUpdate],
                  ].map(([label, val]) => (
                    <div key={label} className="coord-item">
                      <span className="coord-label">{label}</span>
                      <span className="coord-value">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error">⚠️ {error}</div>
            )}

            {/* Consent */}
            {!isSharing && (
              <div className="consent-card">
                <label className="consent-label">
                  <input
                    type="checkbox"
                    className="consent-checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  I consent to sharing my real-time location with my supervisor
                  for field attachment supervision purposes. I understand I can
                  stop sharing at any time.
                </label>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={isSharing ? handleStop : handleStart}
              className={`btn btn-lg ${isSharing ? 'btn-danger' : 'btn-success'}`}
            >
              {isSharing
                ? '🛑 Stop Sharing Location'
                : '📍 Start Sharing Location'}
            </button>

            {/* Info */}
            <div className="alert alert-info">
              ℹ️ <strong>How it works:</strong> When you click "Start Sharing
              Location", your browser will ask for GPS permission. Your location
              will be sent to your supervisor in real time.
            </div>

          </div>
        )}

        {/* VISITS TAB */}
        {activeTab === 'visits' && (
          <div>
            <h3 className="section-title">📋 Supervisor Visit History</h3>

            {visitLogs.length === 0 ? (
              <div className="empty-box">
                <p className="empty-box__icon">📭</p>
                <p className="empty-box__text">
                  Your supervisor has not visited you yet.
                </p>
              </div>
            ) : (
              <div className="log-list">
                {visitLogs.map((log) => (
                  <div key={log.id} className="log-card">
                    <div className="log-card__header">
                      <div className="log-card__icon">🏢</div>
                      <div style={{ flex: 1 }}>
                        <p className="log-card__name">{log.supervisor_name}</p>
                        <p className="log-card__date">{formatDate(log.visited_at)}</p>
                      </div>
                      <span className="badge badge--success">✅ Visited</span>
                    </div>
                    {log.location_name && (
                      <p className="log-card__location">📍 {log.location_name}</p>
                    )}
                    {log.note && (
                      <div className="log-card__note">{log.note}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default StudentDashboard;