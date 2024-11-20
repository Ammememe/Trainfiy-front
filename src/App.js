
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import SummaryPage from './Components/SummaryPage';
import Login from './Components/Login'
import MuscleGroupSelector from './Components/MuscleGroupSelection';
import SwipeCard from './Components/SwipeCard';
import axios from 'axios';
import '../src/styles/app.css';
const API_HOST = 'http://localhost:8080'; // Local server
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [bodyPart, setBodyPart] = useState(null);
    const [level, setLevel] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [levels, setLevels] = useState([]);
    // Fetch levels for selection
    useEffect(() => {
        axios.get(`${API_HOST}/levels`)
            .then(response => setLevels(response.data.levels))
            .catch(error => console.error("Error fetching levels:", error));
    }, []);
    // Fetch muscle groups for selection
    useEffect(() => {
        axios.get(`${API_HOST}/muscleGroups`)
            .then(response => setMuscleGroups(response.data.muscleGroups))
            .catch(error => console.error("Error fetching muscle groups:", error));
    }, []);
    // Fetch workouts when level or body part is selected
    useEffect(() => {
        if (level && bodyPart) {
            setLoading(true);
            axios.get(`${API_HOST}/workouts`, { params: { level, primaryMuscles: bodyPart } })
                .then(response => {
                    setWorkouts(response.data.workouts);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching workouts:", error);
                    setLoading(false);
                });
        }
    }, [level, bodyPart]);
    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token from localStorage
        setIsLoggedIn(false);
    };

    return (
        <Router>
            <div className="App">
                {isLoggedIn && <Navbar onLogout={handleLogout} />}
                <Routes>
                    {/* Landing route */}
                    <Route 
                        path="/" 
                        element={
                            isLoggedIn ? (
                                <Navigate to="/home" replace />
                            ) : (
                                <SummaryPage />
                            )
                        } 
                    />
                    
                    {/* Login route */}
                    <Route 
                        path="/login" 
                        element={
                            isLoggedIn ? (
                                <Navigate to="/home" replace />
                            ) : (
                                <Login onLogin={handleLogin} />
                            )
                        }
                    />
                    {/* Home route (MuscleGroupSelector) */}
                    <Route 
                        path="/home" 
                        element={
                            isLoggedIn ? (
                                <MuscleGroupSelector 
                                    onSelectBodyPart={setBodyPart} 
                                    onSelectLevel={setLevel} 
                                    muscleGroups={muscleGroups}
                                    levels={levels}
                                />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    {/* Swipe route */}
                    <Route 
                        path="/swipe" 
                        element={
                            isLoggedIn ? (
                                loading ? (
                                    <p>Loading workouts...</p>
                                ) : (
                                    <SwipeCard workouts={workouts} />
                                )
                            ) : (
                                <Navigate to="/" />
                            )
                        } 
                    />
                </Routes>
            </div>
        </Router>
    );
}
export default App;