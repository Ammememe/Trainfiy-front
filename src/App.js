// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Components/Navbar';
import SummaryPage from './Components/SummaryPage';
import Login from './Components/Login';
import MuscleGroupSelector from './Components/MuscleGroupSelection';
import SwipeCard from './Components/SwipeCard';
import MyWorkoutsPage from './Components/MyWorkoutsPage';
import { loginAxios, workoutsAxios } from './utils/axiosConfig';
import { checkTokenExpiration } from './utils/auth';
import '../src/styles/app.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [bodyPart, setBodyPart] = useState(null);
    const [level, setLevel] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [levels, setLevels] = useState([]);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial setup - only runs once
    useEffect(() => {
        const initializeApp = async () => {
            const token = localStorage.getItem('token');
            if (token && !checkTokenExpiration()) {
                setIsLoggedIn(true);
                try {
                    await loginAxios.get('/private/refreshtoken');
                    
                    const [levelsRes, muscleGroupsRes] = await Promise.all([
                        workoutsAxios.get('/levels'),
                        workoutsAxios.get('/muscleGroups')
                    ]);
                    
                    setLevels(levelsRes.data.levels);
                    setMuscleGroups(muscleGroupsRes.data.muscleGroups);
                    setError(null);
                } catch (error) {
                    console.error("Initialization error:", error);
                    if (error.response?.status === 401) {
                        handleSessionExpired();
                    } else {
                        setError("Failed to initialize application");
                    }
                }
            }
            setIsInitialized(true);
        };

        initializeApp();
    }, []);

    // Check token expiration periodically
    useEffect(() => {
        const checkSession = () => {
            if (isLoggedIn && checkTokenExpiration()) {
                handleSessionExpired();
            }
        };

        const sessionInterval = setInterval(checkSession, 60000);
        return () => clearInterval(sessionInterval);
    }, [isLoggedIn]);

    const fetchWorkouts = async () => {
        if (!level || !bodyPart) return;
        
        try {
            setLoading(true);
            const response = await workoutsAxios.get('/workouts', {
                params: { 
                    level, 
                    primaryMuscles: bodyPart,
                    sessionID: localStorage.getItem('user_id')
                }
            });
            setWorkouts(response.data.workouts || []);
            setError(null);
        } catch (error) {
            console.error("Error fetching workouts:", error);
            setError("Failed to load workouts");
        } finally {
            setLoading(false);
        }
    };

    const handleSessionExpired = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        setIsLoggedIn(false);
    };

    const handleLogin = async (token, userId) => {
        try {
            localStorage.setItem('token', token);
            localStorage.setItem('user_id', userId);
            setIsLoggedIn(true);
            setError(null);
        } catch (error) {
            console.error("Login error:", error);
            setError("Failed to complete login");
            throw error;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        setIsLoggedIn(false);
        setBodyPart(null);
        setLevel(null);
        setWorkouts([]);
        setError(null);
    };

    if (!isInitialized) {
        return <div className="loading">Initializing...</div>;
    }

    return (
        <Router>
            <div className="App">
                {isLoggedIn && <Navbar onLogout={handleLogout} />}
                {error && <div className="error-banner">{error}</div>}
                <Routes>
                    <Route path="/" element={
                        isLoggedIn ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <SummaryPage />
                        )
                    } />
                    <Route path="/login" element={
                        isLoggedIn ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    } />
                    <Route path="/home" element={
                        isLoggedIn ? (
                            <MuscleGroupSelector
                                onSelectBodyPart={setBodyPart}
                                onSelectLevel={setLevel}
                                selectedLevel={level}
                                selectedBodyPart={bodyPart}
                                onPrepareForSwipe={fetchWorkouts}
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    } />
                    <Route path="/swipe" element={
                        isLoggedIn ? (
                            loading ? (
                                <div className="loading">Loading workouts...</div>
                            ) : (
                                <SwipeCard 
                                    workouts={workouts} 
                                    currentUser={{ id: localStorage.getItem('user_id') }}
                                />
                            )
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    } />
                    <Route path="/my-workouts" element={
                        isLoggedIn ? (
                            <MyWorkoutsPage />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ToastContainer 
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </div>
        </Router>
    );
}

export default App;