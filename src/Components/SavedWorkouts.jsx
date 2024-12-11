import React, { useState, useEffect } from 'react';
import { workoutsAxios } from '../utils/axiosConfig'; // Updated import
import '../styles/SavedWorkouts.css';

const SavedWorkouts = ({ currentUser }) => {
    const [savedWorkouts, setSavedWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [dateToDelete, setDateToDelete] = useState(null);
    const [workoutToDelete, setWorkoutToDelete] = useState(null);

    const fetchSavedWorkouts = async () => {
        try {
            const response = await workoutsAxios.get(`/workout-history/details/${currentUser.id}`);
            setSavedWorkouts(response.data.history || []);
        } catch (error) {
            console.error('Error fetching saved workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.id) {
            fetchSavedWorkouts();
        }
    }, [currentUser]);

    const getFallbackImageUrl = (workout, index) => {
        const workoutName = workout.name.replace(/ /g, '_');
        return `https://myexercisesbucket.s3.us-east-1.amazonaws.com/public/${workoutName}/images/${index}.jpg`;
    };

    const handleImageSwitch = (workoutId, direction) => {
        setCurrentImageIndexes((prev) => {
            const currentIndex = prev[workoutId] || 0;
            const totalImages = 2;
            if (direction === 'left') {
                return {
                    ...prev,
                    [workoutId]: currentIndex === 0 ? totalImages - 1 : currentIndex - 1,
                };
            } else {
                return {
                    ...prev,
                    [workoutId]: (currentIndex + 1) % totalImages,
                };
            }
        });
    };

    const handleDeleteSingleWorkout = async (workoutId) => {
        try {
            console.log('Deleting workout:', workoutId);
            await workoutsAxios.delete(`/workout-history/${workoutId}`);
            await fetchSavedWorkouts();
            setWorkoutToDelete(null);
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
    };

    const handleDeleteDate = async (date) => {
        try {
            const dateObj = new Date(date);
            const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            
            console.log('Deleting workouts for date:', formattedDate);
            await workoutsAxios.delete(`/workout-history/date/${formattedDate}`);
            await fetchSavedWorkouts();
            
            setShowDeleteConfirm(false);
            setDateToDelete(null);
        } catch (error) {
            console.error('Error deleting workouts:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const WorkoutCard = ({ workout }) => (
        <div className="workout-card">
            <button 
                className="delete-workout-btn"
                onClick={() => setWorkoutToDelete(workout)}
            >
                ✕
            </button>
            <div className="workout-image-container">
                <div className="image-navigation">
                    <button onClick={() => handleImageSwitch(workout.history_id, 'left')}>
                        &#8592;
                    </button>
                    <button onClick={() => handleImageSwitch(workout.history_id, 'right')}>
                        &#8594;
                    </button>
                </div>
                <div
                    className="workout-image"
                    style={{
                        backgroundImage: `url(${getFallbackImageUrl(workout, currentImageIndexes[workout.history_id] || 0)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            </div>
            <div className="workout-details">
                <h4>{workout.name}</h4>
                <p className="workout-time">{formatDate(workout.workout_date)}</p>
                <button
                    onClick={() => setSelectedWorkout(workout)}
                    className="view-details-btn"
                >
                    View Details
                </button>
            </div>
        </div>
    );

    const WorkoutGroup = ({ title, workouts, showDeleteAll = true }) => {
        const date = workouts.length > 0 
            ? new Date(workouts[0].workout_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : '';

        return (
            <div className="date-group">
                <div className="date-header-container">
                    <h4 className="date-header">{title || date}</h4>
                    {showDeleteAll && workouts.length > 0 && (
                        <button 
                            className="delete-date-btn"
                            onClick={() => {
                                setDateToDelete(date);
                                setShowDeleteConfirm(true);
                            }}
                        >
                            Delete All
                        </button>
                    )}
                </div>
                <div className="workout-grid">
                    {workouts.map((workout) => (
                        <WorkoutCard key={workout.history_id} workout={workout} />
                    ))}
                </div>
            </div>
        );
    };

    const separateWorkouts = (workouts) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            .toISOString().split('T')[0];

        const sortedWorkouts = [...workouts].sort(
            (a, b) => new Date(b.workout_date) - new Date(a.workout_date)
        );

        return {
            todayWorkouts: sortedWorkouts.filter(workout => {
                const workoutDate = new Date(workout.workout_date);
                const workoutDateString = new Date(
                    workoutDate.getFullYear(),
                    workoutDate.getMonth(),
                    workoutDate.getDate()
                ).toISOString().split('T')[0];
                return workoutDateString === today;
            }),
            previousWorkouts: sortedWorkouts.filter(workout => {
                const workoutDate = new Date(workout.workout_date);
                const workoutDateString = new Date(
                    workoutDate.getFullYear(),
                    workoutDate.getMonth(),
                    workoutDate.getDate()
                ).toISOString().split('T')[0];
                return workoutDateString !== today;
            })
        };
    };

    const groupWorkoutsByDate = (workouts) => {
        return workouts.reduce((acc, workout) => {
            const date = new Date(workout.workout_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(workout);
            return acc;
        }, {});
    };

    if (loading) return <div>Loading saved workouts...</div>;

    const { todayWorkouts, previousWorkouts } = separateWorkouts(savedWorkouts);
    const previousWorkoutsByDate = groupWorkoutsByDate(previousWorkouts);

    return (
        <div className="saved-workouts-container">
            <h2>My Workouts</h2>

            <div className="workouts-section">
                <h3 className="section-header">Today's Workout</h3>
                {todayWorkouts.length > 0 ? (
                    <WorkoutGroup 
                        title="Today" 
                        workouts={todayWorkouts} 
                        showDeleteAll={true}
                    />
                ) : (
                    <p className="no-workouts-message">No workouts saved today</p>
                )}
            </div>

            <div className="workouts-section">
                <h3 className="section-header">Previous Workouts</h3>
                {Object.entries(previousWorkoutsByDate).length > 0 ? (
                    Object.entries(previousWorkoutsByDate).map(([date, workouts]) => (
                        <WorkoutGroup 
                            key={date} 
                            title={date} 
                            workouts={workouts} 
                            showDeleteAll={true}
                        />
                    ))
                ) : (
                    <p className="no-workouts-message">No previous workouts</p>
                )}
            </div>

            {selectedWorkout && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{selectedWorkout.name}</h3>
                        <p>{selectedWorkout.instructions}</p>
                        <button onClick={() => setSelectedWorkout(null)}>Close</button>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="delete-confirm-overlay">
                    <div className="delete-confirm-dialog">
                        <p>Are you sure you want to delete all workouts from {dateToDelete}?</p>
                        <div className="delete-confirm-buttons">
                            <button 
                                onClick={() => handleDeleteDate(dateToDelete)}
                                className="confirm-yes"
                            >
                                Yes
                            </button>
                            <button 
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDateToDelete(null);
                                }}
                                className="confirm-no"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {workoutToDelete && (
                <div className="delete-confirm-overlay">
                    <div className="delete-confirm-dialog">
                        <p>Delete {workoutToDelete.name} from your history?</p>
                        <div className="delete-confirm-buttons">
                            <button 
                                onClick={() => handleDeleteSingleWorkout(workoutToDelete.history_id)}
                                className="confirm-yes"
                            >
                                Yes
                            </button>
                            <button 
                                onClick={() => setWorkoutToDelete(null)}
                                className="confirm-no"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedWorkouts;
