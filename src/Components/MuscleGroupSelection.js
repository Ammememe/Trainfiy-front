// src/Components/MuscleGroupSelection.js
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
    const [showLevelSelection, setShowLevelSelection] = useState(true); // Control display of level section
    const [showMuscleGroupSelection, setShowMuscleGroupSelection] = useState(false); // Control display of muscle group section

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
        onSelectLevel(level); // Pass selected level to parent component

        // Start fade-out of level selection and then fade-in muscle group selection
        setShowLevelSelection(false);
        setTimeout(() => setShowMuscleGroupSelection(true), 200); // Delay to allow fade-out to complete
    };

    const handleBodyPartSelect = (bodyPart) => {
        if (!selectedLevel) {
            alert("Please select a level first!");
            return;
        }
        onSelectBodyPart(bodyPart);
        navigate("/swipe"); // Redirect to SwipeCard page after selecting body part
    };

    return (
        <div className="muscle-group-selector">
            <div className="video-background">
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

            <div className="content">
                {/* Fade-in/out Level Selection */}
                {showLevelSelection && (
                    <div className={`level-selection ${showLevelSelection ? "fade-in" : "fade-out"}`}>
                        <h1>Choose Level</h1>
                        <div className="level-buttons">
                            {levels.map((level) => (
                                <button 
                                    key={level} 
                                    onClick={() => handleLevelSelect(level)}
                                    className={`level-button ${selectedLevel === level ? "active" : ""}`}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Fade-in/out Muscle Group Selection */}
                {showMuscleGroupSelection && (
                    <div className={`muscle-group-selection ${showMuscleGroupSelection ? "fade-in" : "fade-out"}`}>
                        <h1>Choose Muscle Group</h1>
                        <div className="muscle-group-buttons">
                            {bodyParts.map((bodyPart) => (
                                <button 
                                    key={bodyPart} 
                                    onClick={() => handleBodyPartSelect(bodyPart)}
                                    className="muscle-group-button"
                                >
                                    {bodyPart === "all" ? "All Exercises" : bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MuscleGroupSelector;
