import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SavedWorkouts from './SavedWorkouts';
import { loginAxios } from '../utils/axiosConfig'; // Import the correct axios instance

const MyWorkoutsPage = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await loginAxios.get('/private/refreshtoken'); // Use loginAxios
                setCurrentUser(response.data.user);
            } catch (error) {
                console.error('Error fetching user:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="workouts-page">
            <SavedWorkouts currentUser={currentUser} />
        </div>
    );
};

export default MyWorkoutsPage;
