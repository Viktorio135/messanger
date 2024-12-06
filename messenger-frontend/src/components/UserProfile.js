import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from './axiosConfig';

function UserProfile() {
  const navigate = useNavigate();
  const { username } = useParams(); // Получаем имя пользователя из URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInContacts, setIsInContacts] = useState(false); // Состояние для отслеживания наличия в контактах

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/api/accounts/profile/?username=${username}`);
        setUserData(response.data[0]);
        // Проверяем, есть ли пользователь в контактах
        const contactsResponse = await axiosInstance.get(`/api/accounts/contacts/check/?username=${localStorage.getItem('username')}&contact=${username}`);
        setIsInContacts(contactsResponse.data.isInContacts);
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
      await axiosInstance.post('/api/messages/chat/create_or_get_chat/', {
        "user1": localStorage.getItem("username"),
        "user2": userData.username,
      });
      navigate(`/chats?username=${userData.username}`);
    } catch (error) {
      console.error('Error creating or getting chat:', error);
      setError('Ошибка при создании или получении чата.');
    }
  };

  const handleAddToContacts = async () => {
    try {
      await axiosInstance.post('/api/accounts/contacts/', {
        "contact": userData.username,
        "username": localStorage.getItem('username')
      });
      setIsInContacts(true);
    } catch (error) {
      console.error('Error adding user to contacts:', error);
      setError('Ошибка при добавлении пользователя в контакты.');
    }
  };

  const handleRemoveFromContacts = async () => {
    try {
        await axiosInstance.delete('/api/accounts/contacts/', {data: {
            "contact": userData.username,
            "username": localStorage.getItem('username')
          }});
      setIsInContacts(false);
    } catch (error) {
      console.error('Error removing user from contacts:', error);
      setError('Ошибка при удалении пользователя из контактов.');
    }
  };

  return (
    <div>
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
          {isInContacts ? (
            <button onClick={handleRemoveFromContacts} style={{ marginTop: '20px', marginLeft: '10px' }}>Удалить из контактов</button>
          ) : (
            <button onClick={handleAddToContacts} style={{ marginTop: '20px', marginLeft: '10px' }}>Добавить в контакты</button>
          )}
        </div>
      ) : (
        <p>Данные пользователя не найдены.</p>
      )}
    </div>
  );
}

export default UserProfile;