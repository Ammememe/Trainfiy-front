import React, { useState, useRef } from 'react';
import '../styles/SummaryPage.css';

const SummaryPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const SWIPE_THRESHOLD = 150;
  const summarySlides = [
    {
      id: 1,
      gifUrl: "../gifs/sum1.gif",
      text: "Welcome to FitSwipe! Your personal workout companion"
    },
    {
      id: 2,
      gifUrl: "../gifs/sum2.gif",
      text: "Swipe right to add exercises to your routine"
    },
    {
      id: 3,
      gifUrl: "../gifs/sum3.gif",
      text: "Create your perfect workout in seconds"
    }
  ];

  const handleSwipeEnd = (direction) => {
    const newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < summarySlides.length) {
      setCurrentIndex(newIndex);
      resetCardPosition();
    }
  };

  const resetCardPosition = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out';
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
    }
  };

  const simulateSwipe = (direction) => {
    // Prevent right swipe on the last slide
    if (direction === 'right' && currentIndex === summarySlides.length - 1) {
      return;
    }
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.5s ease-out';
      const distance = direction === 'right' ? 500 : -500;
      cardRef.current.style.transform = `translateX(${distance}px) rotate(${direction === 'right' ? 30 : -30}deg)`;

      setTimeout(() => handleSwipeEnd(direction), 500);
    }
  };

  const onMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startXRef.current;
    if (cardRef.current) {
      const constrainedDeltaX = Math.max(Math.min(deltaX, SWIPE_THRESHOLD), -SWIPE_THRESHOLD);
      cardRef.current.style.transform = `translateX(${constrainedDeltaX}px) rotate(${constrainedDeltaX / 10}deg)`;
    }
  };

  const onMouseUp = (e) => {
    if (e && typeof e.clientX === 'number') {
      setIsDragging(false);
      const deltaX = e.clientX - startXRef.current;

      // Prevent right swipe on the last slide
      if (deltaX > 0 && currentIndex === summarySlides.length - 1) {
        resetCardPosition();
        return;
      }

      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        const direction = deltaX > 0 ? 'right' : 'left';
        simulateSwipe(direction);
      } else {
        resetCardPosition();
      }
    } else {
      resetCardPosition();
    }
  };

  const onMouseLeave = (e) => {
    if (isDragging) onMouseUp(e);
  };

  return (
    <div className="summary-container">
      <h1 className="summary-title">Welcome to FitSwipe</h1>

      <div className="card-stack">
        <div
          ref={cardRef}
          className="swipe-card"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <img
            src={summarySlides[currentIndex].gifUrl}
            alt={`Summary slide ${currentIndex + 1}`}
            className="card-image"
            draggable="false"
          />
          <div className="summary-text-overlay">
            {summarySlides[currentIndex].text}
          </div>
        </div>
      </div>

      <div className="button-container">
        <button onClick={() => simulateSwipe('left')} disabled={currentIndex === 0}>
          👈
        </button>
        <button onClick={() => simulateSwipe('right')} disabled={currentIndex === summarySlides.length - 1}>
          👉
        </button>
      </div>

      <button className="signin-button" onClick={() => (window.location.href = '/login')}>
        Sign In
      </button>
    </div>
  );
};

export default SummaryPage;
