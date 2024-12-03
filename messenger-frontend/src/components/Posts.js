import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosConfig';

function Posts() {
    const navigate = useNavigate();
    const [postsData, setPostsData] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axiosInstance.get('/api/posts/');
                setPostsData(response.data);

            } catch (error) {
                console.error('Error fetching posts:', error);
                navigate('/login'); // Перенаправляем на страницу входа в случае ошибки
            }
        };

        fetchPosts();
    }, [navigate]);

    return (
        <div>
            <meta name="csrf-token" content={localStorage.getItem('csrf')}></meta>
            <h1>Домашняя страница</h1>
            <ul>
                {postsData.map(post => (
                    <li key={post.author}>
                        <h2>{post.text}</h2>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Posts;