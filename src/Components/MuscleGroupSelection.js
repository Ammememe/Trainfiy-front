// src/Components/MuscleGroupSelection.js
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MuscleGroupSelection.css';

const bodyParts = ["all", "chest", "arms", "back", "legs", "shoulders"];
const videos = [
    "/video/workout1.mp4",
    "/video/workout2.mp4",
    "/video/workout3.mp4",
    "/video/workout4.mp4"
];

const MuscleGroupSelector = ({ onSelectBodyPart }) => {
    const videoRefs = useRef([]);
    const navigate = useNavigate();

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

    const handleBodyPartSelect = (bodyPart) => {
        onSelectBodyPart(bodyPart);  // Trigger workout fetch
        navigate("/workouts");       // Navigate to the SwipeCard component
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
                <h1>Choose Muscle Group</h1>
                <h2>And create your own workout session</h2>
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
        </div>
    );
};

export default MuscleGroupSelector;
