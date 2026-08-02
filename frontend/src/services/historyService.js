// frontend/src/services/historyService.js
import api from './api';

const getAllHistory = async (days = 30) => {
    const res = await api.get(`/location-history?days=${days}`);
    return res.data;
};

const getStudentHistory = async (studentId, days = 30) => {
    const res = await api.get(`/location-history/${studentId}?days=${days}`);
    return res.data;
};

const historyService = { getAllHistory, getStudentHistory };

export default historyService;