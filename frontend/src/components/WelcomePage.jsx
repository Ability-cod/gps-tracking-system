// frontend/src/components/WelcomePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function WelcomePage() {
    const navigate       = useNavigate();
    const { user }       = useAuth();
    const [loaded, setLoaded] = useState(false);
    const [pingIndex, setPingIndex] = useState(0);

    // Kama tayari amelogin — mpeleke dashboard yake moja kwa moja
    useEffect(() => {
        if (user) {
            if (user.role === 'admin')      navigate('/admin');
            else if (user.role === 'supervisor') navigate('/supervisor');
            else navigate('/student');
        }
    }, [user]);

    // Animate on mount
    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 100);
        return () => clearTimeout(t);
    }, []);

    // Animate ping dots
    useEffect(() => {
        const interval = setInterval(() => {
            setPingIndex((prev) => (prev + 1) % 3);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const features = [
        { icon: '📍', title: 'Real-Time Tracking',   desc: 'Monitor student locations live on an interactive map' },
        { icon: '✅', title: 'Easy Assessment',        desc: 'Conduct and record student assessments digitally' },
        { icon: '🏢', title: 'Visit Logs',             desc: 'Keep a complete history of supervision visits' },
        { icon: '📊', title: 'Instant Reports',        desc: 'Generate professional PDF reports in one click' },
        { icon: '📍', title: 'Location History',       desc: 'See exactly when and how long students shared location' },
        { icon: '🔐', title: 'Secure Access',          desc: 'Role-based access for Supervisors and Students' },
    ];

    return (
        <div style={s.page}>

            {/* ── ANIMATED BACKGROUND ─────────────────────── */}
            <div style={s.bgOverlay} />

            {/* Animated GPS rings */}
            <div style={s.gpsCenter}>
                <div style={{ ...s.ring, ...s.ring1 }} />
                <div style={{ ...s.ring, ...s.ring2 }} />
                <div style={{ ...s.ring, ...s.ring3 }} />
                <div style={s.gpsDot}>📍</div>
            </div>

            {/* Floating map dots */}
            {[
                { top: '20%', left: '15%', delay: '0s' },
                { top: '35%', left: '75%', delay: '0.5s' },
                { top: '60%', left: '20%', delay: '1s' },
                { top: '70%', left: '80%', delay: '1.5s' },
                { top: '15%', left: '60%', delay: '2s' },
                { top: '80%', left: '50%', delay: '0.8s' },
            ].map((dot, i) => (
                <div key={i} style={{
                    ...s.floatingDot,
                    top: dot.top, left: dot.left,
                    animationDelay: dot.delay,
                    background: i === pingIndex ? '#27ae60' : 'rgba(255,255,255,0.3)',
                }}>
                    {i === pingIndex && <div style={s.pingEffect} />}
                </div>
            ))}

            {/* ── MAIN CONTENT ────────────────────────────── */}
            <div style={{
                ...s.content,
                opacity:   loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(30px)',
            }}>

                {/* Header */}
                <div style={s.header}>
                    <div style={s.logoWrap}>
                        <span style={s.logoIcon}>📍</span>
                        <div style={s.logoPing} />
                    </div>
                    <h1 style={s.title}>Mzumbe GPS Tracker</h1>
                    <p style={s.subtitle}>
                        Field Attachment Supervision System
                    </p>
                    <div style={s.uniTag}>
                        🎓 Mzumbe University — Faculty of Science and Technology
                    </div>
                </div>

                {/* Description */}
                <p style={s.description}>
                    A smart digital platform that connects supervisors and students
                    during field attachment — enabling real-time location tracking,
                    seamless assessments, and complete supervision records.
                </p>

                {/* Live indicator */}
                <div style={s.liveBar}>
                    <div style={s.liveDot} />
                    <span style={s.liveText}>System is Live and Ready</span>
                    <div style={{ ...s.liveDot, animationDelay: '0.3s' }} />
                </div>

                {/* Features Grid */}
                <div style={s.featuresGrid}>
                    {features.map((f, i) => (
                        <div key={i} style={{
                            ...s.featureCard,
                            animationDelay: `${i * 0.1}s`,
                            opacity:   loaded ? 1 : 0,
                            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
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
                        style={s.ctaBtn}
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
                        Access is restricted to authorized Mzumbe University personnel only
                    </p>
                </div>

                {/* Footer */}
                <div style={s.footer}>
                    <p style={s.footerText}>
                        © 2026 Mzumbe University &nbsp;|&nbsp;
                        BSc. Information Technology and Systems &nbsp;|&nbsp;
                        Final Year Project
                    </p>
                </div>

            </div>

            {/* ── CSS ANIMATIONS ──────────────────────────── */}
            <style>{`
                @keyframes ringPulse {
                    0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-12px); }
                }
                @keyframes ping {
                    0%   { transform: scale(1); opacity: 1; }
                    100% { transform: scale(3); opacity: 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.4; }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes logoPing {
                    0%   { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

const s = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d2137 0%, #1a5276 50%, #1a6b4a 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Background overlay
    bgOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(41,128,185,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
    },

    // GPS animation center
    gpsCenter: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 0,
    },
    ring: {
        position: 'absolute',
        borderRadius: '50%',
        border: '1px solid rgba(41,128,185,0.3)',
        top: '50%',
        left: '50%',
        animation: 'ringPulse 3s ease-out infinite',
    },
    ring1: { width: '200px', height: '200px', animationDelay: '0s' },
    ring2: { width: '200px', height: '200px', animationDelay: '1s' },
    ring3: { width: '200px', height: '200px', animationDelay: '2s' },
    gpsDot: {
        fontSize: '40px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'drop-shadow(0 0 20px rgba(39,174,96,0.8))',
        animation: 'float 3s ease-in-out infinite',
    },

    // Floating dots
    floatingDot: {
        position: 'absolute',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        transition: 'background 0.5s',
        animation: 'float 4s ease-in-out infinite',
        zIndex: 1,
    },
    pingEffect: {
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: '#27ae60',
        animation: 'ping 1s ease-out infinite',
    },

    // Main content
    content: {
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '900px',
        padding: '40px 24px',
        textAlign: 'center',
        transition: 'all 0.8s ease',
    },

    // Header
    header: { marginBottom: '24px' },
    logoWrap: {
        position: 'relative',
        display: 'inline-block',
        marginBottom: '16px',
    },
    logoIcon: {
        fontSize: '64px',
        filter: 'drop-shadow(0 0 20px rgba(39,174,96,0.9))',
        display: 'block',
    },
    logoPing: {
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '2px solid rgba(39,174,96,0.5)',
        animation: 'logoPing 2s ease-out infinite',
    },
    title: {
        fontSize: '42px',
        fontWeight: 800,
        color: '#ffffff',
        margin: '0 0 8px',
        letterSpacing: '-0.5px',
        textShadow: '0 2px 20px rgba(0,0,0,0.3)',
    },
    subtitle: {
        fontSize: '18px',
        color: 'rgba(255,255,255,0.85)',
        margin: '0 0 12px',
        fontWeight: 300,
        letterSpacing: '1px',
    },
    uniTag: {
        display: 'inline-block',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '6px 18px',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
    },

    // Description
    description: {
        fontSize: '15px',
        color: 'rgba(255,255,255,0.75)',
        maxWidth: '600px',
        margin: '0 auto 24px',
        lineHeight: 1.7,
    },

    // Live bar
    liveBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '32px',
    },
    liveDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#27ae60',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    liveText: {
        fontSize: '13px',
        color: '#27ae60',
        fontWeight: 600,
        letterSpacing: '0.5px',
    },

    // Features grid
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '36px',
    },
    featureCard: {
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '20px 16px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.5s ease',
        cursor: 'default',
    },
    featureIcon:  { fontSize: '28px', display: 'block', marginBottom: '10px' },
    featureTitle: { margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#fff' },
    featureDesc:  { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 },

    // CTA
    ctaWrap: { marginBottom: '32px' },
    ctaBtn: {
        padding: '16px 48px',
        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
        color: '#fff',
        border: 'none',
        borderRadius: '50px',
        fontSize: '17px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        letterSpacing: '0.5px',
        marginBottom: '12px',
    },
    ctaNote: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.5)',
        margin: 0,
    },

    // Footer
    footer: { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' },
    footerText: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)',
        margin: 0,
    },
};

export default WelcomePage;