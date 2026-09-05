// frontend/src/context/SettingsContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

// Default fallback settings — shown while loading
const DEFAULT_SETTINGS = {
    name:            'FieldTrack',
    short_name:      'FT',
    logo_url:        null,
    primary_color:   '#1a5276',
    secondary_color: '#27ae60',
    program_label:   'Field Attachment',
    address:         null,
    website:         null,
    email:           null,
    phone:           null,
};

const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data?.data) {
                setSettings({ ...DEFAULT_SETTINGS, ...res.data.data });
                // Apply primary color to CSS variable globally
                applyColors(res.data.data);
            }
        } catch {
            // Use default settings if API fails
        } finally {
            setLoading(false);
        }
    };

    // Apply institution colors to CSS variables so entire app updates
    const applyColors = (s) => {
        const root = document.documentElement;
        if (s.primary_color)   root.style.setProperty('--color-primary',   s.primary_color);
        if (s.secondary_color) root.style.setProperty('--color-secondary',  s.secondary_color);
    };

    const updateSettings = async (data) => {
        const res = await api.put('/settings', data);
        if (res.data?.data) {
            setSettings({ ...DEFAULT_SETTINGS, ...res.data.data });
            applyColors(res.data.data);
        }
        return res.data;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #1a3a5c, #2980b9)',
            }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>📍</div>
                <p style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, loadSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
};

export { SettingsProvider, useSettings };