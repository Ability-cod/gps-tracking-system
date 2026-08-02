// frontend/src/services/locationService.js
import api from './api';

let isFirstUpdate = true;

const updateLocation = async (latitude, longitude, accuracy) => {
    const res = await api.post('/locations/update', {
        latitude,
        longitude,
        accuracy,
        is_new: isFirstUpdate, // true kwenye first call — inaanza session kwenye history
    });
    isFirstUpdate = false;
    return res.data;
};

const stopSharing = async () => {
    isFirstUpdate = true; // reset kwa wakati unaofuata
    const res = await api.delete('/locations/stop');
    return res.data;
};

const getStudentsWithLocations = async () => {
    const res = await api.get('/locations/students');
    return res.data;
};

const locationService = { updateLocation, stopSharing, getStudentsWithLocations };

export default locationService;