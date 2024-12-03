import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from './axiosConfig';
import './Login.css'




function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/accounts/token/', {
        username,
        password,
      });
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('username', username);
      navigate('/profile');
    } catch (error) {
      setError("Неверные учетные данные.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Добро пожаловать</h2>
        <p>Введите данные для входа в ваш аккаунт</p>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">Войти</button>
        </form>
        <div className="login-footer">
          <p>Еще нет аккаунта? <Link to="/registration">Зарегистрироваться</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;