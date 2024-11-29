import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosConfig';
import '../App.css';

function Chats() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await axiosInstance.get(`/api/chat/?user=${username}`);
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
        navigate('/login'); // Перенаправляем на страницу входа в случае ошибки
      }
    };

    fetchChats();
  }, [navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        try {
          const response = await axiosInstance.get(`/api/message/?chat=${selectedChat.id}`);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [selectedChat]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return; // Проверка на пустое сообщение

    try {
      const response = await axiosInstance.post('api/message/', {
        "chat": selectedChat.id,
        "sender": localStorage.getItem('username'),
        "text": message,
      });
      console.log(response.data);

      // Обновляем список сообщений
      setMessages([...messages, response.data]);
      setMessage(''); // Очищаем поле ввода
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container">
      <h1>Чаты</h1>
      <div className="chat-container">
        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
              onClick={() => handleChatSelect(chat)}
            >
              {chat.user}
            </div>
          ))}
        </div>
        <div className="chat-window">
          {selectedChat ? (
            <>
              <div className="messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender === localStorage.getItem('username') ? 'user' : ''}`}>
                    <div className="bubble">{msg.text}</div>
                  </div>
                ))}
              </div>
              <div className="input-bar">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                />
                <button onClick={handleSendMessage}>Отправить</button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">Выберите чат, чтобы начать общение</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chats;