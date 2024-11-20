import React, { useEffect, useState } from 'react';
import '../styles/timer.css';

const TimerAnimation = () => {
    const [dots, setDots] = useState(1);
    const [minutes, setMinutes] = useState(5);
    const [isAnimating, setIsAnimating] = useState(true);
  
    useEffect(() => {
      if (!isAnimating) return;
  
      const sequence = [
        { dots: 1, minutes: 5 },    // Large dot (12 o'clock)
        { dots: 2, minutes: 5 },    // Small dot
        { dots: 3, minutes: 5 },    // Large dot
        { dots: 4, minutes: 5 },    // Small dot
        { dots: 5, minutes: 15 },   // Large dot (3 o'clock)
        { dots: 6, minutes: 15 },   // Small dot
        { dots: 7, minutes: 15 },   // Large dot
        { dots: 8, minutes: 15 },   // Small dot
        { dots: 9, minutes: 30 },   // Large dot (6 o'clock)
        { dots: 10, minutes: 30 },  // Small dot
        { dots: 11, minutes: 30 },  // Large dot
        { dots: 12, minutes: 30 },  // Small dot
        { dots: 13, minutes: 45 },  // Large dot (9 o'clock)
        { dots: 14, minutes: 45 },  // Small dot
        { dots: 15, minutes: 45 },  // Large dot
        { dots: 16, minutes: 45 }   // Small dot
      ];
  
      let currentIndex = 0;
  
      const intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % sequence.length;
        const current = sequence[currentIndex];
        setDots(current.dots);
        setMinutes(current.minutes);
      }, 320);
  
      return () => clearInterval(intervalId);
    }, [isAnimating]);
  
    return (
      <div className="timer-container">
        <div className="timer-dots">
          {Array.from({ length: 16 }).map((_, index) => (
            <div 
              key={index} 
              className={`timer-dot ${index < dots ? 'timer-dot-visible' : 'timer-dot-hidden'} ${index % 2 === 1 ? 'timer-dot-small' : ''}`}
              style={{
                transform: `rotate(${index * 22.5}deg) translateY(-190px)`  // 360/16 = 22.5 degrees per dot
              }}
            />
          ))}
        </div>
        <div className="timer-text">
          <span className="timer-number">{minutes}</span>
          <span className="timer-unit">MIN</span>
        </div>
      </div>
    );
  };
  
  export default TimerAnimation;