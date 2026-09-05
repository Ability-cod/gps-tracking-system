// frontend/src/components/Admin/InstitutionSettings.jsx
import { useState }       from 'react';
import { useSettings }    from '../../context/SettingsContext';
import Navbar             from '../shared/Navbar';
import '../../App.css';

function InstitutionSettings() {
    const { settings, updateSettings } = useSettings();

    const [form, setForm] = useState({
        name:            settings.name            || '',
        short_name:      settings.short_name      || '',
        logo_url:        settings.logo_url        || '',
        primary_color:   settings.primary_color   || '#1a5276',
        secondary_color: settings.secondary_color || '#27ae60',
        program_label:   settings.program_label   || 'Field Attachment',
        address:         settings.address         || '',
        website:         settings.website         || '',
        email:           settings.email           || '',
        phone:           settings.phone           || '',
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg]         = useState({ text: '', type: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });
        try {
            await updateSettings(form);
            setMsg({ text: '✅ Institution settings updated successfully!', type: 'success' });
        } catch (err) {
            setMsg({
                text: err.response?.data?.message || 'Failed to update settings.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Navbar />

            <div className="container">

                {/* Header */}
                <div className="welcome-card" style={{ marginBottom: '24px' }}>
                    <div>
                        <h2 className="welcome-card__title">🏛️ Institution Settings</h2>
                        <p className="welcome-card__subtitle">
                            Customize how the system appears for your institution
                        </p>
                    </div>
                    <div className="role-tag">⚙️ Administrator</div>
                </div>

                {msg.text && (
                    <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Basic Info */}
                    <div style={s.card}>
                        <h3 style={s.cardTitle}>🏛️ Basic Information</h3>
                        <div style={s.grid2}>
                            <div>
                                <label className="form-label">Institution Full Name *</label>
                                <input name="name" type="text" className="form-input"
                                    placeholder="e.g. Mzumbe University"
                                    value={form.name} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="form-label">Short Name / Abbreviation *</label>
                                <input name="short_name" type="text" className="form-input"
                                    placeholder="e.g. MU"
                                    value={form.short_name} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="form-label">Program Label *</label>
                                <input name="program_label" type="text" className="form-input"
                                    placeholder="e.g. Field Attachment / Internship / Placement"
                                    value={form.program_label} onChange={handleChange} required />
                                <p className="form-hint">
                                    This appears throughout the system e.g. "Field Attachment Supervision System"
                                </p>
                            </div>
                            <div>
                                <label className="form-label">Address (optional)</label>
                                <input name="address" type="text" className="form-input"
                                    placeholder="e.g. Morogoro, Tanzania"
                                    value={form.address} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div style={s.card}>
                        <h3 style={s.cardTitle}>🎨 Branding & Colors</h3>
                        <div style={s.grid2}>
                            <div>
                                <label className="form-label">Logo URL (optional)</label>
                                <input name="logo_url" type="url" className="form-input"
                                    placeholder="https://yourschool.ac.tz/logo.png"
                                    value={form.logo_url} onChange={handleChange} />
                                <p className="form-hint">
                                    Paste a direct link to your institution logo image
                                </p>
                                {form.logo_url && (
                                    <img src={form.logo_url} alt="Logo preview"
                                        style={{ height: '50px', marginTop: '8px', borderRadius: '6px' }}
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                )}
                            </div>
                            <div>
                                <label className="form-label">Primary Color</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input name="primary_color" type="color"
                                        value={form.primary_color}
                                        onChange={handleChange}
                                        style={{ width: '50px', height: '42px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', padding: '2px' }}
                                    />
                                    <input name="primary_color" type="text" className="form-input"
                                        value={form.primary_color} onChange={handleChange}
                                        placeholder="#1a5276" style={{ flex: 1 }}
                                    />
                                </div>
                                <p className="form-hint">Used for navbar, buttons, and headings</p>

                                <label className="form-label" style={{ marginTop: '16px' }}>Secondary Color</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input name="secondary_color" type="color"
                                        value={form.secondary_color}
                                        onChange={handleChange}
                                        style={{ width: '50px', height: '42px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', padding: '2px' }}
                                    />
                                    <input name="secondary_color" type="text" className="form-input"
                                        value={form.secondary_color} onChange={handleChange}
                                        placeholder="#27ae60" style={{ flex: 1 }}
                                    />
                                </div>
                                <p className="form-hint">Used for accents, live indicators, and CTA buttons</p>
                            </div>
                        </div>

                        {/* Color preview */}
                        <div style={s.colorPreview}>
                            <div style={{
                                ...s.previewBar,
                                background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`,
                            }}>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                                    📍 {form.name || 'Institution'} Tracker
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                                    Navbar Preview
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div style={s.card}>
                        <h3 style={s.cardTitle}>📬 Contact Information (optional)</h3>
                        <div style={s.grid2}>
                            <div>
                                <label className="form-label">Email</label>
                                <input name="email" type="email" className="form-input"
                                    placeholder="info@university.ac.tz"
                                    value={form.email} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="form-label">Phone</label>
                                <input name="phone" type="tel" className="form-input"
                                    placeholder="+255 23 000 0000"
                                    value={form.phone} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="form-label">Website</label>
                                <input name="website" type="url" className="form-input"
                                    placeholder="https://www.university.ac.tz"
                                    value={form.website} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ marginTop: '8px' }}
                    >
                        {loading ? '⏳ Saving...' : '💾 Save Institution Settings'}
                    </button>

                </form>
            </div>
        </div>
    );
}

const s = {
    card: {
        background: '#fff', borderRadius: '12px',
        padding: '24px', marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        border: '1px solid #eaecee',
    },
    cardTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#1a5276' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' },
    colorPreview: { marginTop: '20px' },
    previewBar: {
        borderRadius: '8px', padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
};

export default InstitutionSettings;