import React, { useState, useRef, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { loginAxios, workoutsAxios } from '../utils/axiosConfig'; // Updated import
import '../styles/SwipeCard.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SwipeCard = ({ workouts, currentUser }) => {
    const [currentIndex, setCurrentIndex] = useState(workouts ? workouts.length - 1 : 0);
    const [dailyRoutine, setDailyRoutine] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [instructions, setInstructions] = useState({});
    const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const alreadyRemoved = useRef([]);
    const currentCardRef = useRef();
    const sessionID = useRef(localStorage.getItem('swipeSessionID') || Math.random().toString(36).substring(7));

    useEffect(() => {
        localStorage.setItem('swipeSessionID', sessionID.current);
    }, []);

    useEffect(() => {
        if (workouts && workouts.length > 0) {
            const currentWorkout = workouts[currentIndex];
            if (currentWorkout?.id) {
                fetchInstructions(currentWorkout.id);
            }
        }
    }, [currentIndex, workouts]);

    if (!workouts || workouts.length === 0) {
        return <div>No workouts available. Please try again later.</div>;
    }

    const handleRewind = () => {
        if (alreadyRemoved.current.length > 0) {
            const lastIndex = currentIndex + 1;
            if (lastIndex < workouts.length) {
                setCurrentIndex(lastIndex);
                alreadyRemoved.current.pop();
                
                setDailyRoutine(prev => {
                    const newRoutine = [...prev];
                    newRoutine.pop();
                    return newRoutine;
                });
            }
        }
    };

    const handleReset = () => {
        setShowResetConfirm(true);
    };

    const confirmReset = () => {
        setDailyRoutine([]);
        setShowResetConfirm(false);
    };

    const removeWorkout = (indexToRemove) => {
        setDailyRoutine(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSwipe = async (direction, workout) => {
        if (direction === 'left') {
            try {
                await workoutsAxios.post('/reject-workout', null, {
                    params: {
                        sessionID: sessionID.current,
                        workoutID: workout.id,
                    },
                });
            } catch (error) {
                console.error('Error recording rejected workout:', error);
            }
        } else if (direction === 'right') {
            if (!workout || !workout.id) {
                console.error('Invalid workout data:', workout);
                return;
            }
            // Check if workout already exists in dailyRoutine
            if (!dailyRoutine.some(w => w.name === workout.name)) {
                setDailyRoutine(prevRoutine => [...prevRoutine, workout]);
            } else {
                toast.info("This workout is already in your routine!");
            }
        }
        setCurrentImageIndex(0);
        setIsInstructionsExpanded(false);
    };
    const saveWorkout = async () => {
        if (dailyRoutine.length === 0) {
            toast.error("Add some exercises before saving!");
            return;
        }
    
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please log in to save workouts");
            return;
        }
    
        try {
            const workoutDate = new Date().toISOString();
            const promises = dailyRoutine.map((workout) => {
                return workoutsAxios.post('/workout-history', {
                    workout_id: workout.id,
                    workout_date: workoutDate,
                });
            });
    
            await Promise.all(promises);
            toast.success("Workout saved successfully!");
            setDailyRoutine([]);
        } catch (error) {
            console.error("Error saving workout history:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
                window.location.href = '/login';
            } else {
                toast.error(error.response?.data?.error || "Failed to save workout");
            }
        }
    };

    const handleCardLeftScreen = (index) => {
        alreadyRemoved.current.push(workouts[index]);
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : workouts.length - 1));
    };

    const swipe = (direction) => {
        if (currentCardRef.current) {
            currentCardRef.current.swipe(direction);
        }
    };

    const getFormattedImageUrl = (path) => {
        return path; // Simply return the S3 URL as it is
    };
    
    // Fallback URL if the image path is missing
    const getFallbackImageUrl = (workout, index) => {
        const workoutName = workout.name.replace(/ /g, "_"); // Convert spaces to underscores
        return `https://myexercisesbucket.s3.us-east-1.amazonaws.com/public/${workoutName}/images/${index}.jpg`;
    };

    const handleImageSwitch = (direction) => {
        setCurrentImageIndex((prevIndex) => {
            const totalImages = workouts[currentIndex]?.image_paths?.length || 2;
            if (direction === "left") {
                return prevIndex === 0 ? totalImages - 1 : prevIndex - 1;
            } else {
                return (prevIndex + 1) % totalImages;
            }
        });
    };

    const fetchInstructions = async (workoutId) => {
        if (!workoutId || instructions[workoutId]) return;
        
        try {
            const response = await workoutsAxios.get(`/instructions/${workoutId}`);
            setInstructions((prev) => ({
                ...prev,
                [workoutId]: response.data.instructions || 'No instructions available.',
            }));
        } catch (error) {
            console.error(`Error fetching instructions for workout ${workoutId}:`, error);
            setInstructions(prev => ({
                ...prev,
                [workoutId]: "Instructions temporarily unavailable."
            }));
        }
    };

    return (
        <div className="swipe-container">
            <div className="card-stack">
                {workouts.map((workout, index) => (
                    index === currentIndex && (
                        <TinderCard
                            className="swipe-card"
                            key={workout.id || index}
                            onSwipe={(dir) => handleSwipe(dir, workout)}
                            onCardLeftScreen={() => handleCardLeftScreen(index)}
                            preventSwipe={["up", "down"]}
                            ref={currentCardRef}
                        >
                            <div className="card-content">
    <div
        className="workout-image"
        style={{
            backgroundImage: workout.image_paths && workout.image_paths[currentImageIndex]
                ? `url(${getFormattedImageUrl(workout.image_paths[currentImageIndex])})`
                : `url(${getFallbackImageUrl(workout, currentImageIndex)})`,
        }}
        onClick={() => setCurrentImageIndex(prevIndex => prevIndex === 0 ? 1 : 0)}
    />
                                <div className="workout-title">{workout.name}</div>

                                <div className="instructions-section">
                                    <div
                                        className="instructions-title"
                                        onClick={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
                                    >
                                        <span>Instructions</span>
                                        <span>{isInstructionsExpanded ? "▼" : "▶"}</span>
                                    </div>
                                    <div className={`instructions-box ${isInstructionsExpanded ? "expanded" : "collapsed"}`}>
                                        <p className="instructions-content">
                                            {instructions[workout.id] || "Loading..."}
                                        </p>
                                    </div>
                                </div>
                                <div className="button-container">
                                    <button 
                                        onClick={() => swipe("left")} 
                                        className="action-button reject"
                                    >
                                        ✕
                                    </button>
                                    <button 
                                        onClick={handleRewind} 
                                        className="action-button rewind"
                                        disabled={alreadyRemoved.current.length === 0}
                                    >
                                        ↺
                                    </button>
                                    <button 
                                        onClick={() => swipe("right")} 
                                        className="action-button accept"
                                    >
                                        ✓
                                    </button>
                                </div>
                            </div>
                        </TinderCard>
                    )
                ))}
            </div>
            <div className="my-workout-section">
                <div className="my-workout-header">
                    <h2>My Workout</h2>
                    {dailyRoutine.length > 0 && (
                        <div className="workout-actions">
                            <button
                                onClick={saveWorkout}
                                className="save-workout-btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Save Workout
                            </button>
                            <button
                                onClick={handleReset}
                                className="reset-workout-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors ml-2"
                            >
                                Reset Workout
                            </button>
                        </div>
                    )}
                </div>

                {showResetConfirm && (
                    <div className="reset-confirm-overlay">
                        <div className="reset-confirm-dialog">
                            <p>Are you sure you want to reset your workout?</p>
                            <div className="reset-confirm-buttons">
                                <button 
                                    onClick={confirmReset}
                                    className="confirm-yes bg-red-500 hover:bg-red-600 text-white"
                                >
                                    Yes
                                </button>
                                <button 
                                    onClick={() => setShowResetConfirm(false)}
                                    className="confirm-no bg-gray-500 hover:bg-gray-600 text-white"
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {dailyRoutine.length > 0 ? (
                    <div className="my-workout-cards">
                        {dailyRoutine.map((workout, index) => (
                            <div key={index} className="my-workout-card">
                                <button 
                                    className="remove-workout-btn"
                                    onClick={() => removeWorkout(index)}
                                >
                                    ✕
                                </button>
                                <div
                                    className="my-workout-image"
                                    style={{
                                        backgroundImage: workout.image_paths && workout.image_paths[0]
                                            ? `url(${getFormattedImageUrl(workout.image_paths[0])})`
                                            : `url(${getFallbackImageUrl(workout, 0)})`,
                                    }}
                                ></div>
                                <div className="my-workout-info">
                                    <div className="my-workout-title">{workout.name}</div>
                                    <div className="my-workout-equipment">Equipment: {workout.equipment}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No workouts added yet. Swipe right to add a workout!</p>
                )}
            </div>
        </div>
    );
};

export default SwipeCard;