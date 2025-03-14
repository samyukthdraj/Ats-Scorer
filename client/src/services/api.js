// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Point to your Node.js backend

export const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
        const response = await axios.post(`${API_BASE_URL}/api/analyze-resume`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading resume:", error);
        throw error;
    }
};