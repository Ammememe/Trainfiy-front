import React, { useState, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import '../styles/SwipeCard.css';

const SwipeCard = ({ workouts }) => {
    const [currentIndex, setCurrentIndex] = useState(workouts.length - 1);
    const [dailyRoutine, setDailyRoutine] = useState([]);
    const alreadyRemoved = useRef([]);
    const currentCardRef = useRef(); // Ref for the current Tinder card

    const handleSwipe = (direction, workout) => {
        if (direction === 'right') {
            setDailyRoutine((prevRoutine) => [...prevRoutine, workout]); // Add to routine if swiped right
        }
    };

    const handleCardLeftScreen = (index) => {
        alreadyRemoved.current.push(workouts[index]);
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : workouts.length - 1));
    };

    // Trigger programmatic swipe
    const swipe = (direction) => {
        if (currentCardRef.current) {
            currentCardRef.current.swipe(direction); // Swipe left or right
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
                            ref={currentCardRef} // Set ref on the current card
                        >
                            <div className="card-content">
                                <div
                                    className="workout-image"
                                    style={{
                                        backgroundImage: `url(${workout.gifUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        height: '250px',
                                        width: '100%',
                                        borderRadius: '10px'
                                    }}
                                ></div>
                                <div className="workout-title">{workout.name}</div>
                                <div className="workout-description">Target: {workout.target}</div>
                                <div className="workout-equipment">Equipment: {workout.equipment}</div>
                                <div className="button-container">
                                    <button onClick={() => swipe('left')}>👎</button> {/* Simulate left swipe */}
                                    <button onClick={() => swipe('right')}>👍</button> {/* Simulate right swipe */}
                                </div>
                            </div>
                        </TinderCard>
                    )
                ))}
            </div>
            
            {/* "My Workout" Section */}
            <div className="my-workout-section">
                <h2>My Workout</h2>
                {dailyRoutine.length > 0 ? (
                    <div className="my-workout-cards">
                        {dailyRoutine.map((workout, index) => (
                            <div key={index} className="my-workout-card">
                                <div
                                    className="my-workout-image"
                                    style={{
                                        backgroundImage: `url(${workout.gifUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        height: '100px',
                                        width: '100%',
                                        borderRadius: '10px'
                                    }}
                                ></div>
                                <div className="my-workout-info">
                                    <div className="my-workout-title">{workout.name}</div>
                                    <div className="my-workout-target">Target: {workout.target}</div>
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
