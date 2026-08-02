// frontend/src/services/profileService.js
import api from './api';

const getProfile = async () => {
    const res = await api.get('/profile');
    return res.data;
};

const updateProfile = async (name, phone = '') => {
    const res = await api.put('/profile', { name, phone });
    return res.data;
};

const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    const res = await api.put('/profile/password', {
        current_password: currentPassword,
        new_password:     newPassword,
        confirm_password: confirmPassword,
    });
    return res.data;
};

const profileService = { getProfile, updateProfile, changePassword };

export default profileService;