import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from './axiosConfig';
import '../App.css';
import './Chats.css';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Установите корневой элемент для модального окна

function Chats() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [lastMessageId, setLastMessageId] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState([]);

  const messageContainerRef = useRef(null); // Create a ref for the message container

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await axiosInstance.get(`/api/messages/chat/?user=${username}`);
        setChats(response.data);

        // Проверяем, есть ли параметр user в URL и выбираем соответствующий чат
        const userParam = searchParams.get('username');
        if (userParam) {
          const chat = response.data.find(chat => chat.user === userParam);
          if (chat) {
            setSelectedChat(chat);
          }
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        navigate('/login');
      }
    };

    fetchChats();
  }, [navigate, searchParams]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        try {
          const response = await axiosInstance.get(`/api/messages/message/?chat=${selectedChat.id}`);
          setMessages(response.data);
          if (response.data.length > 0) {
            setLastMessageId(response.data[response.data.length - 1].id);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      const accessToken = localStorage.getItem('accessToken');
      const url = `http://localhost:8000/api/messages/message/sse_messages/${selectedChat.id}/?last_message_id=${lastMessageId}`;

      const controller = new AbortController();

      const fetchSSE = async () => {
        try {
          await fetchEventSource(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            onmessage: (event) => {
              const data = JSON.parse(event.data);
              setMessages((prevMessages) => [...prevMessages, data]);
              setLastMessageId(data.id);
            },
            signal: controller.signal,
          });
        } catch (error) {
          console.error('Error with SSE connection:', error);
        }
      };

      fetchSSE();

      return () => {
        controller.abort();
      };
    }
  }, [selectedChat, lastMessageId]);

  useEffect(() => {
    // Scroll to bottom when messages are updated
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // const handleScroll = useCallback((e) => {
  //   if (showContacts) {
  //     e.preventDefault();
  //   }
  // }, [showContacts]);

  // useEffect(() => {
  //   window.addEventListener('scroll', handleScroll, { passive: false });
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, [handleScroll]);

  const handleChatSelect = (chat) => {
    if (selectedChat?.id !== chat.id) {
      setSelectedChat(chat);
      setMessages([]); // Очищаем сообщения только при выборе нового чата
    }
    // Scroll to bottom when a new chat is selected
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await axiosInstance.post('/api/messages/message/', {
        chat: selectedChat.id,
        sender: localStorage.getItem('username'),
        text: message,
      });

      setMessages([...messages, response.data]);
      setLastMessageId(response.data.id);
      setMessage('');

      // Scroll to bottom after sending a message
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await axiosInstance.get(`/api/accounts/contacts/?username=${username}`);
      const contactsWithNoChat = response.data.contacts;
      setContacts(contactsWithNoChat);
      setShowContacts(true);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleContactSelect = async (contact) => {
    try {
      const response = await axiosInstance.post('/api/messages/chat/create_or_get_chat/', {
        user1: localStorage.getItem('username'),
        user2: contact.username,
      });
      setSelectedChat(response.data);
      setShowContacts(false);
    } catch (error) {
      console.error('Error creating or getting chat:', error);
    }
  };



  

  return (
    <div className="container">
      <h1>Чаты</h1>
      <button onClick={handleCreateNewChat} style={{ marginBottom: '10px' }}>Создать новый чат</button>
      <Modal
        isOpen={showContacts}
        onRequestClose={() => setShowContacts(false)}
        contentLabel="Выбор контакта"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            // pointerEvents: showContacts ? 'auto' : 'none', // Блокировка взаимодействия с задним фоном
          },
          content: {
            width: '300px',
            height: '400px',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          },
        }}
      >
        <h2 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          Выберите контакт
        </h2>
        <div className="contacts-list" style={{ overflowY: 'auto', width: '100%', flex: '1' }}>
          {contacts.map((contact) => (
            <div
              key={contact.username}
              className="contact-item"
              onClick={() => handleContactSelect(contact)}
              style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}
            >
              <img 
                src={contact.avatar} 
                alt="Аватар пользователя" 
                style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
              />
              <div style={{ marginLeft: '10px' }}>
                <p>{contact.first_name} {contact.last_name}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowContacts(false)} style={{ width: '100%', padding: '10px', background: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}>
          Отмена
        </button>
      </Modal>
      <div className="chat-container">
        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
              onClick={() => handleChatSelect(chat)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src={chat.user_data.avatar} 
                  alt="Аватар пользователя" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
                />
                <div style={{ marginLeft: '10px' }}>
                  <p>{chat.user_data.first_name} {chat.user_data.last_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-window">
          {selectedChat ? (
            <>
              <div 
                className="user-profile" 
                onClick={() => navigate(`/user/${selectedChat.user}`)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}
              >
                <img 
                  src={selectedChat.user_data.avatar} 
                  alt="Аватар пользователя" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
                />
                <div style={{ marginLeft: '10px' }}>
                  <p>{selectedChat.user_data.first_name} {selectedChat.user_data.last_name}</p>
                </div>
              </div>
              <div className="messages" ref={messageContainerRef}> {/* Assign the ref here */}
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender === localStorage.getItem('username') ? 'user' : 'other'}`}>
                    <div className="bubble">
                      <p>{msg.text}</p>
                      <p className="timestamp">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
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