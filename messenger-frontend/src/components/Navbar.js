import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUser, FaUsers, FaComment, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css'; // Подключаем стили

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">LinkUp</div>
      <ul className="navbar-links">
        <li><Link to="/posts"><FaHome /></Link></li>
        <li><Link to="/profile"><FaUser /></Link></li>
        <li><Link to="/contacts"><FaUsers /></Link></li>
        <li><Link to="/chats"><FaComment /></Link></li>
        <li><Link to="/logout"><FaSignOutAlt /></Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;