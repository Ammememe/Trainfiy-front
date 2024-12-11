import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAxios, workoutsAxios } from '../utils/axiosConfig'; // Updated import
import videos from '../config/videos';
import '../styles/MuscleGroupSelection.css';

const levels = ["beginner", "intermediate", "advanced"];
const bodyParts = ["all", "chest", "arms", "back", "legs", "shoulders"];

const MuscleGroupSelector = ({ onSelectBodyPart, onSelectLevel }) => {
    const videoRefs = useRef([]);
    const navigate = useNavigate();
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedBodyPart, setSelectedBodyPart] = useState(null);
    const [showTimer, setShowTimer] = useState(false);
    const [workoutDuration, setWorkoutDuration] = useState(30);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await loginAxios.get('/private/refreshtoken');  // Make sure this matches your backend endpoint
            } catch (error) {
                if (error.message !== 'Session expired') {
                    console.error('Authentication error:', error);
                    navigate('/login');  // Redirect to login on auth failure
                }
            }
        };

        verifyAuth();
    }, []);

    useEffect(() => {
        const loadVideos = async () => {
            // Pre-load all videos
            videoRefs.current.forEach((video, index) => {
                if (video) {
                    video.load();
                }
            });

            // Start playing the first video
            if (videoRefs.current[0]) {
                try {
                    videoRefs.current[0].style.opacity = "1";
                    await videoRefs.current[0].play();
                } catch (error) {
                    console.error('Error playing first video:', error);
                }
            }
        };

        loadVideos();

        // Cleanup
        return () => {
            videoRefs.current.forEach(video => {
                if (video) {
                    video.pause();
                    video.removeAttribute('src');
                    video.load();
                }
            });
        };
    }, []);

    useEffect(() => {
        const handleVideoEnd = async (index) => {
            const currentVideo = videoRefs.current[index];
            const nextIndex = (index + 1) % videos.length;
            const nextVideo = videoRefs.current[nextIndex];

            if (currentVideo && nextVideo) {
                currentVideo.style.opacity = "0";
                await new Promise(resolve => setTimeout(resolve, 500));
                nextVideo.style.opacity = "1";
                try {
                    await nextVideo.play();
                } catch (error) {
                    console.error('Error playing next video:', error);
                }
            }
        };

        // Add ended event listeners to all videos
        videoRefs.current.forEach((video, index) => {
            if (video) {
                video.addEventListener('ended', () => handleVideoEnd(index));
            }
        });

        // Cleanup
        return () => {
            videoRefs.current.forEach((video, index) => {
                if (video) {
                    video.removeEventListener('ended', () => handleVideoEnd(index));
                }
            });
        };
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

    const handleSeeWorkouts = async () => {
        try {
            await loginAxios.get('/private/refreshtoken'); // Use `loginAxios` for auth
            navigate("/swipe");
        } catch (error) {
            if (error.message !== 'Session expired') {
                console.error('Navigation error:', error);
            }
        }
    };

    const handleMyWorkouts = async () => {
        try {
            await loginAxios.get('/private/refreshtoken'); // Use `loginAxios` for auth
            navigate("/my-workouts");
        } catch (error) {
            if (error.message !== 'Session expired') {
                console.error('Navigation error:', error);
            }
        }
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
                            playsInline
                            preload="auto"
                        >
                            <source src={src} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
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

                <div className="my-workouts-container">
                    <button
                        onClick={handleMyWorkouts}
                        className="my-workouts-button"
                    >
                        My Workouts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MuscleGroupSelector;
