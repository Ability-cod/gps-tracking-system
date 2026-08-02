// frontend/src/components/shared/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function PrivateRoute({ children, allowedRole }) {
    const { user } = useAuth();

    // Not logged in
    if (!user) return <Navigate to="/login" replace />;

    // Wrong role — redirect to correct dashboard
    if (allowedRole && user.role !== allowedRole) {
        if (user.role === 'admin')      return <Navigate to="/admin"      replace />;
        if (user.role === 'supervisor') return <Navigate to="/supervisor" replace />;
        return <Navigate to="/student" replace />;
    }

    return children;
}

export default PrivateRoute;