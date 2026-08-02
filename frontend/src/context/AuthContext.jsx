// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token     = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const register = async (name, email, password, role, supervisorEmail) => {
        const data = await authService.register(name, email, password, role, supervisorEmail);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return data.data.user;
    };

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return data.data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #1a5276, #2980b9)',
            }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>📍</div>
                <p style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                    Mzumbe GPS Tracker
                </p>
                <p style={{ color: '#aed6f1', fontSize: '14px', marginTop: '8px' }}>
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
            isAdmin:      user?.role === 'admin',
            isStudent:    user?.role === 'student',
            isSupervisor: user?.role === 'supervisor',
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export { useAuth, AuthProvider };