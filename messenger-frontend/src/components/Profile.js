import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosConfig';

import './Profile.css'

function Profile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const username = localStorage.getItem('username')
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
    }, [navigate]);
    
    return (
        <div>
            <meta name="csrf-token" content={localStorage.getItem('csrf')}></meta>
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
                </div>
            ) : (
                <p>Данные пользователя не найдены.</p>
            )}
        </div>
    );
}

export default Profile;



