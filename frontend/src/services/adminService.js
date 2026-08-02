// frontend/src/services/adminService.js
import api from './api';

const getStats = async () => {
    const res = await api.get('/admin/stats');
    return res.data;
};

const getAllUsers = async () => {
    const res = await api.get('/admin/users');
    return res.data;
};

const getSupervisors = async () => {
    const res = await api.get('/admin/supervisors');
    return res.data;
};

const addUser = async (name, email, password, role, supervisorId = null, phone = '') => {
    const res = await api.post('/admin/users', {
        name, email, password, role, phone,
        supervisor_id: supervisorId,
    });
    return res.data;
};

const deleteUser = async (userId) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
};

const resetPassword = async (userId, newPassword) => {
    const res = await api.put(`/admin/users/${userId}/password`, {
        new_password: newPassword,
    });
    return res.data;
};

const updateUser = async (userId, name, phone = '') => {
    const res = await api.put(`/admin/users/${userId}`, { name, phone });
    return res.data;
};

const adminService = {
    getStats, getAllUsers, getSupervisors,
    addUser, deleteUser, resetPassword, updateUser,
};

export default adminService;