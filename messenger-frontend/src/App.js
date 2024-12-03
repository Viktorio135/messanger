import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Posts from './components/Posts.js';
import Logout from './components/Logout.js';
import Profile from './components/Profile.js';
import Chats from './components/Chats.js'; 
import Navbar from './components/Navbar.js';
import Contacts from './components/Contacts.js';
import UserProfile from './components/UserProfile.js'; 

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
            <Route path="/posts" element={<Posts />} />
            <Route path="/registration" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/contacts" element={<Contacts />}/>
            <Route path="/chats" element={<Chats />} /> 
            <Route path="/user/:username" element={<UserProfile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;