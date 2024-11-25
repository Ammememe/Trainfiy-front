import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MuscleGroupSelection.css';

const levels = ["beginner", "intermediate", "advanced"];
const bodyParts = ["all", "chest", "arms", "back", "legs", "shoulders"];
const videos = [
    "/video/workout1.mp4",
    "/video/workout2.mp4",
    "/video/workout3.mp4",
    "/video/workout4.mp4"
];

const MuscleGroupSelector = ({ onSelectBodyPart, onSelectLevel }) => {
    const videoRefs = useRef([]);
    const navigate = useNavigate();
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedBodyPart, setSelectedBodyPart] = useState(null);
    const [showTimer, setShowTimer] = useState(false);
    const [workoutDuration, setWorkoutDuration] = useState(30);

    useEffect(() => {
        let currentIndex = 0;

        const playNextVideo = () => {
            videoRefs.current.forEach((video, index) => {
                video.style.opacity = index === currentIndex ? "1" : "0";
            });
            videoRefs.current[currentIndex].play();
            videoRefs.current[currentIndex].onended = () => {
                currentIndex = (currentIndex + 1) % videos.length;
                playNextVideo();
            };
        };

        playNextVideo();
    }, []);

    const handleLevelSelect = (level) => {
        setSelectedLevel(level);
        onSelectLevel(level);
    };

    const handleBodyPartSelect = (bodyPart) => {
        if (!selectedLevel) {
            alert("Please select a level first!");
            return;
        }
        setSelectedBodyPart(bodyPart);
        onSelectBodyPart(bodyPart);
        setShowTimer(true);
    };

    const handleSeeWorkouts = () => {
        navigate("/swipe");
    };

    return (
        <div>
            <div className="video-banner">
                <div className="video-background">
                    <div className="video-overlay"></div>
                    {videos.map((src, index) => (
                        <video
                            key={index}
                            ref={(el) => (videoRefs.current[index] = el)}
                            src={src}
                            className="background-video"
                            muted
                            loop={false}
                            playsInline
                        />
                    ))}
                </div>
            </div>

            <div className="selection-container">
                <div className="selection-section">
                    <h2>Choose Your Level</h2>
                    <div className="button-grid">
                        {levels.map((level) => (
                            <button
                                key={level}
                                onClick={() => handleLevelSelect(level)}
                                className={`selection-button ${selectedLevel === level ? 'active' : ''}`}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="selection-section">
                    <h2>Choose Muscle Group</h2>
                    <div className="button-grid">
                        {bodyParts.map((bodyPart) => (
                            <button
                                key={bodyPart}
                                onClick={() => handleBodyPartSelect(bodyPart)}
                                className={`selection-button ${selectedBodyPart === bodyPart ? 'active' : ''}`}
                            >
                                {bodyPart === "all" ? "All Exercises" : bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`timer-section ${showTimer ? 'show' : ''}`}>
                    <h2>Choose Workout Length</h2>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="5"
                            max="120"
                            step="5"
                            value={workoutDuration}
                            onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                            className="slider"
                        />
                        <p>Workout Duration: {workoutDuration} minutes</p>
                    </div>
                </div>

                {showTimer && (
                    <div className="see-workouts-container">
                        <button
                            onClick={handleSeeWorkouts}
                            className="see-workouts-button"
                        >
                            See Workouts
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MuscleGroupSelector;
