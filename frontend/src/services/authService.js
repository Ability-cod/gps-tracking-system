// frontend/src/services/authService.js
import api from './api';

const register = async (name, email, password, role, supervisorEmail = '') => {
  const res = await api.post('/auth/register', {
    name,
    email,
    password,
    role,
    supervisorEmail: supervisorEmail || undefined,
  });
  return res.data;
};

const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

const getProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

const authService = { register, login, getProfile };

export default authService;