// frontend/src/services/assessmentService.js
import api from './api';

const upsert = async (studentId, status, note = '') => {
  const res = await api.post('/assessments', {
    student_id: studentId,
    status,
    note,
  });
  return res.data;
};

const getByStudent = async (studentId) => {
  const res = await api.get(`/assessments/${studentId}`);
  return res.data;
};

const getMySupervisorAssessments = async () => {
  const res = await api.get('/assessments/my');
  return res.data;
};

const addVisitLog = async (studentId, note, locationName = '') => {
  const res = await api.post('/visits', {
    student_id: studentId,
    note,
    location_name: locationName,
  });
  return res.data;
};

const getMyVisits = async () => {
  const res = await api.get('/visits/my-visits');
  return res.data;
};

const getSupervisorVisits = async () => {
  const res = await api.get('/visits/supervisor');
  return res.data;
};

const assessmentService = {
  upsert,
  getByStudent,
  getMySupervisorAssessments,
  addVisitLog,
  getMyVisits,
  getSupervisorVisits,
};

export default assessmentService;