import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from './axiosConfig';
import './Contacts.css'; // Подключаем стили

function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await axiosInstance.get(`/api/accounts/contacts/?username=${username}`);
        setContacts(response.data.contacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError('Ошибка при загрузке списка контактов.');
        navigate('/login'); // Перенаправляем на страницу входа в случае ошибки
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [navigate]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim()) {
        try {
          const response = await axiosInstance.get(`/api/accounts/search/?search=${searchQuery}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Error fetching search results:', error);
          setError('Ошибка при поиске пользователей.');
        }
      } else {
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  return (
    <div>
      <h1>Контакты</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Поиск пользователей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Загрузка данных...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          {searchQuery.trim() ? (
            searchResults.length > 0 ? (
              <ul>
                {searchResults.map((user) => (
                  <li key={user.id}>
                    <Link to={`/user/${user.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                          src={user.avatar} 
                          alt="Аватар пользователя" 
                          style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
                        />
                        <div style={{ marginLeft: '10px' }}>
                          <p>{user.first_name} {user.last_name}</p>
                          <p>{user.description}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>По вашему запросу ничего не найдено.</p>
            )
          ) : (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <Link to={`/user/${contact.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img 
                        src={contact.avatar} 
                        alt="Аватар контакта" 
                        style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
                      />
                      <div style={{ marginLeft: '10px' }}>
                        <p>{contact.first_name} {contact.last_name}</p>
                        <p>{contact.description}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Contacts;
