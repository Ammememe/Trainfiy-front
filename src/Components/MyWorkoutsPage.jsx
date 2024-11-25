import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MyWorkoutsPage.css';

const MyWorkoutsPage = ({ userId }) => {
    const [todayWorkouts, setTodayWorkouts] = useState([]);
    const [previousWorkouts, setPreviousWorkouts] = useState([]);

    useEffect(() => {
        const fetchWorkouts = async () => {
            const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

            try {
                // Fetch today's workouts
                const todayResponse = await axios.get(`http://localhost:8001/workout-history/${userId}?date=${today}`);
                setTodayWorkouts(todayResponse.data.workouts);

                // Fetch all previous workouts (excluding today)
                const previousResponse = await axios.get(`http://localhost:8001/workout-history/${userId}`);
                setPreviousWorkouts(
                    previousResponse.data.workouts.filter((workout) => workout.workout_date.split('T')[0] !== today)
                );
            } catch (error) {
                console.error('Error fetching workouts:', error);
            }
        };

        fetchWorkouts();
    }, [userId]);

    return (
        <div className="my-workouts-page">
            <h1>My Workouts</h1>

            {/* Current Workout Section */}
            <div className="workout-section current-workout">
                <h2>Current Workout of the Day</h2>
                <div className="workout-container">
                    {todayWorkouts.length > 0 ? (
                        <ul>
                            {todayWorkouts.map((workout, index) => (
                                <li key={index}>
                                    Workout ID: {workout.workout_id}, Added on: {new Date(workout.workout_date).toLocaleDateString()}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No workout assigned for today yet.</p>
                    )}
                </div>
            </div>

            {/* Previous Workouts Section */}
            <div className="workout-section previous-workouts">
                <h2>Previous Workouts</h2>
                <div className="workouts-container">
                    {previousWorkouts.length > 0 ? (
                        previousWorkouts.map((workout, index) => (
                            <div key={index} className="previous-workout-card">
                                Workout ID: {workout.workout_id}, Date: {new Date(workout.workout_date).toLocaleDateString()}
                            </div>
                        ))
                    ) : (
                        <p>No previous workouts to show yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyWorkoutsPage;
