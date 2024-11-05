// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import SwipeCard from './Components/SwipeCard';
import axios from 'axios';
import MuscleGroupSelector from './Components/MuscleGroupSelection';
import Login from './Components/Login';
import "../src/styles/app.css";

const API_HOST = 'https://exercisedb.p.rapidapi.com';
const API_KEY = process.env.REACT_APP_RAPIDAPI_KEY;

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [bodyPart, setBodyPart] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (bodyPart) {
            setLoading(true);

            const headers = {
                headers: {
                    'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
                    'x-rapidapi-key': API_KEY
                }
            };

            const requests = bodyPart === "all"
                ? [axios.get(`${API_HOST}/exercises?offset=0&limit=1300`, headers)]
                : bodyPart === "legs"
                    ? [
                        axios.get(`${API_HOST}/exercises/bodyPart/upper%20legs?limit=200`, headers),
                        axios.get(`${API_HOST}/exercises/bodyPart/lower%20legs?limit=200`, headers)
                      ]
                    : bodyPart === "arms"
                        ? [
                            axios.get(`${API_HOST}/exercises/bodyPart/upper%20arms?limit=200`, headers),
                            axios.get(`${API_HOST}/exercises/bodyPart/lower%20arms?limit=200`, headers)
                          ]
                        : [axios.get(`${API_HOST}/exercises/bodyPart/${bodyPart}?limit=200`, headers)];

            Promise.all(requests)
                .then((responses) => {
                    const allExercises = responses.flatMap(response => response.data);
                    setWorkouts(allExercises);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching workouts:", error);
                    setLoading(false);
                });
        }
    }, [bodyPart]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    return (
        <Router>
            <div className="App">
                {isLoggedIn ? (
                    <>
                        <Navbar /> {/* Display Navbar after login */}
                        <Routes>
                            <Route path="/" element={<Navigate to="/home" replace />} />
                            <Route
                                path="/home"
                                element={<MuscleGroupSelector onSelectBodyPart={setBodyPart} />}
                            />
                            <Route
                                path="/workouts"
                                element={
                                    loading ? (
                                        <p>Loading workouts...</p>
                                    ) : (
                                        workouts.length > 0 ? <SwipeCard workouts={workouts} /> : <Navigate to="/home" />
                                    )
                                }
                            />
                        </Routes>
                    </>
                ) : (
                    <Login onLogin={handleLogin} />
                )}
            </div>
        </Router>
    );
}

export default App;
