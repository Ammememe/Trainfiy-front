import React, { useState, useRef, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import axios from 'axios';
import '../styles/SwipeCard.css';

const SwipeCard = ({ workouts, currentUser }) => {
    const [currentIndex, setCurrentIndex] = useState(workouts ? workouts.length - 1 : 0);
    const [dailyRoutine, setDailyRoutine] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [instructions, setInstructions] = useState({}); // Store instructions for workouts
    const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false); // Add this new state for instructions expansion
    const alreadyRemoved = useRef([]);
    const currentCardRef = useRef();
    
    useEffect(() => {
        // Pre-fetch instructions for all workouts on mount
        workouts.forEach((workout) => {
            fetchInstructions(workout.id);
        });
    }, [workouts]);
    
    if (!workouts || workouts.length === 0) {
        console.error('workouts prop is undefined or empty');
        return <div>No workouts available. Please try again later.</div>;
    }

    const handleSwipe = async (direction, workout) => {
        if (direction === 'right') {
            // Add to the daily routine in the frontend
            setDailyRoutine((prevRoutine) => [...prevRoutine, workout]);

            // Send workout to the backend
            try {
                await axios.post('http://localhost:8001/workout-history', {
                    user_id: currentUser.id, // Replace `currentUser.id` with your actual user ID variable
                    workout_id: workout.id, // The workout ID
                    workout_date: new Date().toISOString(), // Current date and time in ISO format
                });
            } catch (error) {
                console.error('Error saving workout history:', error);
            }
        }

        // Reset UI elements after swipe
        setCurrentImageIndex(0);
        setIsInstructionsExpanded(false); // Reset instructions expansion state after swipe
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
        return path.replace(/\\/g, '/').toLowerCase().replace(/ /g, '_');
    };

    const getFallbackImageUrl = (workout, index) => {
        const workoutName = workout.name.replace(/ /g, '_');
        return `http://localhost:8080/images/${workoutName}/images/${index}.jpg`;
    };

    const handleImageSwitch = (direction) => {
        setCurrentImageIndex((prevIndex) => {
            const totalImages = workouts[currentIndex]?.image_paths?.length || 2; // Default to 2 images
            if (direction === 'left') {
                return prevIndex === 0 ? totalImages - 1 : prevIndex - 1;
            } else {
                return (prevIndex + 1) % totalImages;
            }
        });
    };

    const fetchInstructions = async (workoutId) => {
        try {
            if (instructions[workoutId]) return; // Skip if instructions are already fetched
            const response = await axios.get(`http://localhost:8080/instructions/${workoutId}`);
            const fetchedInstructions = response.data.instructions;
            setInstructions((prev) => ({
                ...prev,
                [workoutId]: fetchedInstructions || 'No instructions available.',
            }));
        } catch (error) {
            console.error('Error fetching instructions:', error);
            setInstructions((prev) => ({
                ...prev,
                [workoutId]: 'Failed to load instructions.',
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
                            preventSwipe={['up', 'down']}
                            ref={currentCardRef}
                        >
                            <div className="card-content">
                                <div className="image-navigation">
                                    <button onClick={() => handleImageSwitch('left')}>&#8592;</button>
                                    <button onClick={() => handleImageSwitch('right')}>&#8594;</button>
                                </div>
                                <div
                                    className="workout-image"
                                    style={{
                                        backgroundImage: workout.image_paths && workout.image_paths[currentImageIndex]
                                            ? `url(${getFormattedImageUrl(workout.image_paths[currentImageIndex])})`
                                            : `url(${getFallbackImageUrl(workout, currentImageIndex)})`,
                                    }}
                                />
                                <div className="workout-title">{workout.name}</div>
                                <div className="workout-description">Target: {workout.target}</div>
                                <div className="workout-equipment">Equipment: {workout.equipment}</div>
                                <div className="instructions-section">
                                    <div 
                                        className="instructions-title"
                                        onClick={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
                                    >
                                        <span>Instructions</span>
                                        <span>{isInstructionsExpanded ? '▼' : '▶'}</span>
                                    </div>
                                    <div className={`instructions-box ${isInstructionsExpanded ? 'expanded' : 'collapsed'}`}>
                                        <p className="instructions-content">
                                            {instructions[workout.id] || 'Loading...'}
                                        </p>
                                    </div>
                                </div>
                                <div className="button-container">
                                    <button onClick={() => swipe('left')}>👎</button>
                                    <button onClick={() => swipe('right')}>👍</button>
                                </div>
                            </div>
                        </TinderCard>
                    )
                ))}
            </div>
            <div className="my-workout-section">
                <h2>My Workout</h2>
                {dailyRoutine.length > 0 ? (
                    <div className="my-workout-cards">
                        {dailyRoutine.map((workout, index) => (
                            <div key={index} className="my-workout-card">
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
