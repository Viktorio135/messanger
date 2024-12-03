
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from './axiosConfig';

function UserProfile() {
  const navigate = useNavigate();
  const { username } = useParams(); // Получаем имя пользователя из URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/api/accounts/profile/?username=${username}`);
        setUserData(response.data[0]);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Ошибка при загрузке данных пользователя.');
        navigate('/login'); // Перенаправляем на страницу входа в случае ошибки
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate, username]);

  const handleGoToChat = async () => {
    try {
      const response = await axiosInstance.post('/api/messages/chat/create_or_get_chat/', {
        "user1": localStorage.getItem("username"),
        "user2": userData.username,
      });
      navigate(`/chats?username=${userData.username}`);
    } catch (error) {
      console.error('Error creating or getting chat:', error);
      setError('Ошибка при создании или получении чата.');
    }
  };

  return (
    <div>
      <h1>Профиль пользователя {username}</h1>
      {loading ? (
        <p>Загрузка данных...</p>
      ) : error ? (
        <p>{error}</p>
      ) : userData ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={userData.avatar} 
              alt="Аватар пользователя" 
              style={{ width: '100px', height: '100px', borderRadius: '50%' }} 
            />
            <div style={{ marginLeft: '20px' }}>
              <p>Имя: {userData.first_name}</p>
              <p>Фамилия: {userData.last_name}</p>
              <p>Описание: {userData.description}</p>
            </div>
          </div>
          <button onClick={handleGoToChat} style={{ marginTop: '20px' }}>Перейти в чат</button>
        </div>
      ) : (
        <p>Данные пользователя не найдены.</p>
      )}
    </div>
  );
}

export default UserProfile;
