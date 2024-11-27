import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Подключаем стили

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Мессенджер</div>
      <ul className="navbar-links">
        <li><Link to="/home">Главная</Link></li>
        <li><Link to="/profile">Профиль</Link></li>
        <li><Link to="/logout">Выход</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
