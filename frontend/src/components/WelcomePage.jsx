// frontend/src/components/WelcomePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import { useSettings }         from '../context/SettingsContext';

function WelcomePage() {
    const navigate       = useNavigate();
    const { user }       = useAuth();
    const { settings }   = useSettings();
    const [loaded, setLoaded]       = useState(false);
    const [pingIndex, setPingIndex] = useState(0);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin')      navigate('/admin');
            else if (user.role === 'supervisor') navigate('/supervisor');
            else navigate('/student');
        }
    }, [user]);

    // Fade in on mount
    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 100);
        return () => clearTimeout(t);
    }, []);

    // Animate floating dots
    useEffect(() => {
        const interval = setInterval(() => {
            setPingIndex((prev) => (prev + 1) % 6);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const features = [
        { icon: '📍', title: 'Real-Time Tracking',   desc: `Monitor student locations live on an interactive map` },
        { icon: '✅', title: 'Easy Assessment',        desc: 'Conduct and record student assessments digitally' },
        { icon: '🏢', title: 'Visit Logs',             desc: 'Keep a complete history of all supervision visits' },
        { icon: '📊', title: 'Instant Reports',        desc: 'Generate professional PDF reports in one click' },
        { icon: '📅', title: 'Location History',       desc: 'See exactly when and how long students shared location' },
        { icon: '🔐', title: 'Secure Access',          desc: 'Role-based access for Admin, Supervisors and Students' },
    ];

    const primary   = settings.primary_color   || '#1a5276';
    const secondary = settings.secondary_color || '#27ae60';

    return (
        <div style={{ ...s.page, background: `linear-gradient(135deg, #0d2137 0%, ${primary} 50%, ${secondary}33 100%)` }}>

            {/* Background overlay */}
            <div style={s.bgOverlay} />

            {/* GPS rings animation */}
            <div style={s.gpsCenter}>
                <div style={{ ...s.ring, ...s.ring1 }} />
                <div style={{ ...s.ring, ...s.ring2 }} />
                <div style={{ ...s.ring, ...s.ring3 }} />
                <div style={s.gpsDot}>📍</div>
            </div>

            {/* Floating location dots */}
            {[
                { top: '18%', left: '12%' },
                { top: '32%', left: '78%' },
                { top: '62%', left: '18%' },
                { top: '72%', left: '82%' },
                { top: '14%', left: '58%' },
                { top: '78%', left: '48%' },
            ].map((dot, i) => (
                <div key={i} style={{
                    ...s.floatingDot,
                    top: dot.top, left: dot.left,
                    background: i === pingIndex ? secondary : 'rgba(255,255,255,0.25)',
                    animationDelay: `${i * 0.4}s`,
                }}>
                    {i === pingIndex && (
                        <div style={{ ...s.pingEffect, background: secondary }} />
                    )}
                </div>
            ))}

            {/* Main content */}
            <div style={{
                ...s.content,
                opacity:   loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(30px)',
            }}>

                {/* Header */}
                <div style={s.header}>
                    <div style={s.logoWrap}>
                        {settings.logo_url ? (
                            <img
                                src={settings.logo_url}
                                alt={settings.short_name}
                                style={{ height: '80px', borderRadius: '12px', boxShadow: `0 0 30px ${secondary}88` }}
                            />
                        ) : (
                            <>
                                <span style={{ ...s.logoIcon, filter: `drop-shadow(0 0 20px ${secondary}cc)` }}>📍</span>
                                <div style={{ ...s.logoPing, borderColor: `${secondary}88` }} />
                            </>
                        )}
                    </div>

                    <h1 style={s.title}>{settings.name}</h1>
                    <p style={s.subtitle}>
                        {settings.program_label} Supervision System
                    </p>

                    {settings.name !== 'FieldTrack' && (
                        <div style={s.uniTag}>
                            🎓 {settings.name}
                            {settings.address ? ` — ${settings.address}` : ''}
                        </div>
                    )}
                </div>

                {/* Description */}
                <p style={s.description}>
                    A smart digital platform that connects supervisors and students
                    during {settings.program_label.toLowerCase()} — enabling real-time
                    location tracking, seamless assessments, and complete supervision records.
                </p>

                {/* Live indicator */}
                <div style={s.liveBar}>
                    <div style={{ ...s.liveDot, background: secondary }} />
                    <span style={{ ...s.liveText, color: secondary }}>System is Live and Ready</span>
                    <div style={{ ...s.liveDot, background: secondary, animationDelay: '0.4s' }} />
                </div>

                {/* Features Grid */}
                <div style={s.featuresGrid}>
                    {features.map((f, i) => (
                        <div key={i} style={{
                            ...s.featureCard,
                            opacity:   loaded ? 1 : 0,
                            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                            transition: `all 0.6s ease ${i * 0.08}s`,
                        }}>
                            <span style={s.featureIcon}>{f.icon}</span>
                            <h3 style={s.featureTitle}>{f.title}</h3>
                            <p style={s.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div style={s.ctaWrap}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{ ...s.ctaBtn, background: `linear-gradient(135deg, ${secondary}, ${secondary}cc)` }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-3px)';
                            e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                        }}
                    >
                        🔐 Login to System
                    </button>
                    <p style={s.ctaNote}>
                        Access is restricted to authorized {settings.name} personnel only
                    </p>
                </div>

                {/* Contact info if set */}
                {(settings.email || settings.phone || settings.website) && (
                    <div style={s.contactBar}>
                        {settings.email   && <span>📧 {settings.email}</span>}
                        {settings.phone   && <span>📱 {settings.phone}</span>}
                        {settings.website && <span>🌐 {settings.website}</span>}
                    </div>
                )}

                {/* Footer */}
                <div style={s.footer}>
                    <p style={s.footerText}>
                        © {new Date().getFullYear()} {settings.name}
                        &nbsp;|&nbsp; Powered by FieldTrack GPS Supervision System
                    </p>
                </div>

            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes ringPulse {
                    0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 0.7; }
                    100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-14px); }
                }
                @keyframes ping {
                    0%   { transform: scale(1); opacity: 1; }
                    100% { transform: scale(3); opacity: 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.3; }
                }
                @keyframes logoPing {
                    0%   { transform: scale(1); opacity: 0.7; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

const s = {
    page: {
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgOverlay: {
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(41,128,185,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    gpsCenter: {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', zIndex: 0,
    },
    ring: {
        position: 'absolute', borderRadius: '50%',
        border: '1px solid rgba(41,128,185,0.25)',
        top: '50%', left: '50%',
        animation: 'ringPulse 3s ease-out infinite',
    },
    ring1: { width: '220px', height: '220px', animationDelay: '0s' },
    ring2: { width: '220px', height: '220px', animationDelay: '1s' },
    ring3: { width: '220px', height: '220px', animationDelay: '2s' },
    gpsDot: {
        fontSize: '42px',
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'float 3s ease-in-out infinite',
    },
    floatingDot: {
        position: 'absolute', width: '10px', height: '10px',
        borderRadius: '50%', transition: 'background 0.5s',
        animation: 'float 4s ease-in-out infinite', zIndex: 1,
    },
    pingEffect: {
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        animation: 'ping 1s ease-out infinite',
    },
    content: {
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: '900px',
        padding: '40px 24px', textAlign: 'center',
        transition: 'all 0.8s ease',
    },
    header:   { marginBottom: '20px' },
    logoWrap: { position: 'relative', display: 'inline-block', marginBottom: '16px' },
    logoIcon: { fontSize: '64px', display: 'block' },
    logoPing: {
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '2px solid', animation: 'logoPing 2s ease-out infinite',
    },
    title: {
        fontSize: '40px', fontWeight: 800, color: '#ffffff',
        margin: '0 0 8px', letterSpacing: '-0.5px',
        textShadow: '0 2px 20px rgba(0,0,0,0.3)',
    },
    subtitle: {
        fontSize: '17px', color: 'rgba(255,255,255,0.8)',
        margin: '0 0 12px', letterSpacing: '0.5px',
    },
    uniTag: {
        display: 'inline-block',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px', padding: '6px 18px',
        fontSize: '13px', color: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
    },
    description: {
        fontSize: '15px', color: 'rgba(255,255,255,0.72)',
        maxWidth: '600px', margin: '0 auto 20px', lineHeight: 1.7,
    },
    liveBar: {
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '10px', marginBottom: '28px',
    },
    liveDot: {
        width: '8px', height: '8px', borderRadius: '50%',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    liveText: { fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' },
    featuresGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px', marginBottom: '32px',
    },
    featureCard: {
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px', padding: '20px 14px',
        backdropFilter: 'blur(10px)',
    },
    featureIcon:  { fontSize: '28px', display: 'block', marginBottom: '10px' },
    featureTitle: { margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#fff' },
    featureDesc:  { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.62)', lineHeight: 1.5 },
    ctaWrap:      { marginBottom: '20px' },
    ctaBtn: {
        padding: '16px 48px', color: '#fff', border: 'none',
        borderRadius: '50px', fontSize: '17px', fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease', letterSpacing: '0.5px', marginBottom: '10px',
    },
    ctaNote: { fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 },
    contactBar: {
        display: 'flex', gap: '20px', justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: '16px',
        fontSize: '12px', color: 'rgba(255,255,255,0.55)',
    },
    footer: { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' },
    footerText: { fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 },
};

export default WelcomePage;