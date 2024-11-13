import React, { useState, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import '../styles/SwipeCard.css';

const SwipeCard = ({ workouts }) => {
    const [currentIndex, setCurrentIndex] = useState(workouts ? workouts.length - 1 : 0);
    const [dailyRoutine, setDailyRoutine] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const alreadyRemoved = useRef([]);
    const currentCardRef = useRef();

    // Conditional rendering if workouts prop is undefined or empty
    if (!workouts || workouts.length === 0) {
        console.error('workouts prop is undefined or empty');
        return <div>No workouts available. Please try again later.</div>;
    }

    const handleSwipe = (direction, workout) => {
        if (direction === 'right') {
            setDailyRoutine((prevRoutine) => [...prevRoutine, workout]);
        }
        setCurrentImageIndex(0);
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
                                        backgroundSize: 'cover',
                                        height: '290px',
                                        width: '290px',
                                    }}
                                ></div>
                                <div className="workout-title">{workout.name}</div>
                                <div className="workout-description">Target: {workout.target}</div>
                                <div className="workout-equipment">Equipment: {workout.equipment}</div>
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
