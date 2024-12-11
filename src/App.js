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

    // Check token expiration periodically
    useEffect(() => {
        const checkSession = () => {
            if (isLoggedIn && checkTokenExpiration()) {
                handleSessionExpired();
            }
        };

        const sessionInterval = setInterval(checkSession, 60000);
        window.addEventListener('focus', checkSession);

        return () => {
            clearInterval(sessionInterval);
            window.removeEventListener('focus', checkSession);
        };
    }, [isLoggedIn]);

    // Initial token check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !checkTokenExpiration()) {
            setIsLoggedIn(true);
        }
    }, []);

    // Fetch levels
    useEffect(() => {
        if (isLoggedIn) {
            const fetchLevels = async () => {
                try {
                    setLoading(true);
                    const response = await workoutsAxios.get('/levels');
                    setLevels(response.data.levels);
                    setError(null);
                } catch (error) {
                    console.error("Error fetching levels:", error);
                    setError("Failed to load exercise levels");
                } finally {
                    setLoading(false);
                }
            };
            fetchLevels();
        }
    }, [isLoggedIn]);

    // Fetch muscle groups
    useEffect(() => {
        if (isLoggedIn) {
            const fetchMuscleGroups = async () => {
                try {
                    setLoading(true);
                    const response = await workoutsAxios.get('/muscleGroups');
                    setMuscleGroups(response.data.muscleGroups);
                    setError(null);
                } catch (error) {
                    console.error("Error fetching muscle groups:", error);
                    setError("Failed to load muscle groups");
                } finally {
                    setLoading(false);
                }
            };
            fetchMuscleGroups();
        }
    }, [isLoggedIn]);

    // Fetch workouts when level or body part is selected
    useEffect(() => {
        if (isLoggedIn && level && bodyPart) {
            const fetchWorkouts = async () => {
                try {
                    setLoading(true);
                    const response = await workoutsAxios.get('/workouts', {
                        params: { level, primaryMuscles: bodyPart }
                    });
                    setWorkouts(response.data.workouts);
                    setError(null);
                } catch (error) {
                    console.error("Error fetching workouts:", error);
                    setError("Failed to load workouts");
                } finally {
                    setLoading(false);
                }
            };
            fetchWorkouts();
        }
    }, [level, bodyPart, isLoggedIn]);

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
                            loading ? (
                                <div className="loading">Loading...</div>
                            ) : (
                                <MuscleGroupSelector
                                    onSelectBodyPart={setBodyPart}
                                    onSelectLevel={setLevel}
                                    muscleGroups={muscleGroups}
                                    levels={levels}
                                />
                            )
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