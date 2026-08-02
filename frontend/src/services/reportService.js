// frontend/src/services/reportService.js
import api from './api';

const getStudentsReport = async () => {
    const res = await api.get('/reports/students');
    return res.data;
};

const reportService = { getStudentsReport };

export default reportService;