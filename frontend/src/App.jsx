// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth }         from './context/AuthContext';
import { SettingsProvider }              from './context/SettingsContext';
import WelcomePage                       from './components/WelcomePage';
import Login                             from './components/auth/Login';
import StudentDashboard                  from './components/student/StudentDashboard';
import SupervisorDashboard               from './components/supervisor/SupervisorDashboard';
import LocationHistory                   from './components/supervisor/LocationHistory';
import AdminDashboard                    from './components/Admin/AdminDashboard';
import InstitutionSettings               from './components/Admin/InstitutionSettings';
import Report                            from './components/supervisor/Report';
import Profile                           from './components/shared/Profile';
import PrivateRoute                      from './components/shared/PrivateRoute';

function RootRedirect() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/welcome" replace />;
    if (user.role === 'admin')      return <Navigate to="/admin"      replace />;
    if (user.role === 'supervisor') return <Navigate to="/supervisor" replace />;
    return <Navigate to="/student" replace />;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login"   element={<Login />} />

            {/* Admin */}
            <Route path="/admin"
                element={<PrivateRoute allowedRole="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/settings"
                element={<PrivateRoute allowedRole="admin"><InstitutionSettings /></PrivateRoute>} />

            {/* Supervisor */}
            <Route path="/supervisor"
                element={<PrivateRoute allowedRole="supervisor"><SupervisorDashboard /></PrivateRoute>} />
            <Route path="/location-history"
                element={<PrivateRoute allowedRole="supervisor"><LocationHistory /></PrivateRoute>} />
            <Route path="/report"
                element={<PrivateRoute allowedRole="supervisor"><Report /></PrivateRoute>} />

            {/* Student */}
            <Route path="/student"
                element={<PrivateRoute allowedRole="student"><StudentDashboard /></PrivateRoute>} />

            {/* Shared */}
            <Route path="/profile"
                element={<PrivateRoute><Profile /></PrivateRoute>} />

            <Route path="*" element={<RootRedirect />} />
        </Routes>
    );
}

function App() {
    return (
        <SettingsProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </SettingsProvider>
    );
}

export default App;