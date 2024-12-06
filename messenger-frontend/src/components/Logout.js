import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosConfig';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('refreshToken')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post('/api/accounts/logout/', {"refresh_token": localStorage.getItem("refreshToken")});
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      navigate('/login'); // Перенаправляем на страницу входа после выхода
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login'); // Перенаправляем на страницу входа в случае ошибки
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <p>Вы уверены, что хотите выйти?</p>
        <button type="submit">Выйти</button>
      </form>
    </div>
  );
}

export default Logout;