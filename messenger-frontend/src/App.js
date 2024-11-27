import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Home from './components/Home.js';
import Logout from './components/Logout.js';
import Profile from './components/Profile.js';
import Navbar from './components/Navbar.js';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Navbar /> {/* Вставляем навигацию */}
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/home" element={<Home />} />
            <Route path="/registration" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;