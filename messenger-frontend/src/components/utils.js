import axios from "axios";


export const refreshToken = async (refresh) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/token/refresh/', 
        { refresh }
      );
      return response.data; // Возвращаем данные ответа
    } catch (error) {
      throw error;
    }
  };


