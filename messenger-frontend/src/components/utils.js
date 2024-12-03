import axios from "axios";

export const refreshToken = async (refresh) => {
    try {
        const response = await axios.post(
            'http://127.0.0.1:8000/api/accounts/token/refresh/', 
            { refresh: refresh } // Передаем словарь с ключом 'refresh'
        );
        return response.data; // Возвращаем данные ответа
    } catch (error) {
        if (error.response && error.response.data && error.response.data.detail) {
            throw new Error(error.response.data.detail);
        }
        throw error;
    }
};