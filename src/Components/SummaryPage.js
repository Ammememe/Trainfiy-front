// src/Components/SummaryPage.js
import React, { useState, useRef } from 'react';
import '../styles/SummaryPage.css';

const SummaryPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const MAX_DRAG_DISTANCE = 100;

  const summarySlides = [
    { id: 1, gifUrl: "../gifs/sum1.gif", text: "Welcome to FitSwipe! Your personal workout companion" },
    { id: 2, gifUrl: "../gifs/sum2.gif", text: "Swipe right to add exercises to your routine" },
    { id: 3, gifUrl: "../gifs/sum3.gif", text: "Create your perfect workout in seconds" }
  ];

  const handleSwipeEnd = (deltaX) => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out';

      if (deltaX > MAX_DRAG_DISTANCE * 0.4 && currentIndex < summarySlides.length - 1) {
        cardRef.current.style.transform = `translateX(${MAX_DRAG_DISTANCE * 2}px) rotate(30deg)`;
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          resetCard();
        }, 300);
      } else if (deltaX < -MAX_DRAG_DISTANCE * 0.4 && currentIndex > 0) {
        cardRef.current.style.transform = `translateX(${-MAX_DRAG_DISTANCE * 2}px) rotate(-30deg)`;
        setTimeout(() => {
          setCurrentIndex((prev) => prev - 1);
          resetCard();
        }, 300);
      } else {
        resetCard();
      }
    }
  };

  const resetCard = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
    }
  };

  return (
    <div className="summary-container">
      <h1 className="text-3xl font-bold mb-8 text-center">Welcome to FitSwipe</h1>

      <div className="card-stack">
        {summarySlides.map((slide, index) => (
          <div
            key={slide.id}
            ref={index === currentIndex ? cardRef : null}
            className={`swipe-card ${index < currentIndex ? 'hidden-card' : ''}`}
            style={{
              zIndex: summarySlides.length - index,
              opacity: index === currentIndex ? 1 : 0.5,
              transform: index === currentIndex ? 'translateX(0) rotate(0deg)' : 'scale(0.95)',
            }}
            onMouseDown={(e) => {
              if (index === currentIndex) {
                startXRef.current = e.clientX;
                setIsDragging(true);
              }
            }}
            onMouseMove={(e) => {
              if (isDragging && index === currentIndex) {
                const deltaX = e.clientX - startXRef.current;
                const constrainedDeltaX = Math.max(Math.min(deltaX, MAX_DRAG_DISTANCE), -MAX_DRAG_DISTANCE);
                currentXRef.current = constrainedDeltaX;
                const rotate = (constrainedDeltaX / MAX_DRAG_DISTANCE) * 15;
                cardRef.current.style.transform = `translateX(${constrainedDeltaX}px) rotate(${rotate}deg)`;
              }
            }}
            onMouseUp={() => {
              if (index === currentIndex) {
                setIsDragging(false);
                handleSwipeEnd(currentXRef.current);
              }
            }}
            onMouseLeave={() => {
              if (isDragging && index === currentIndex) {
                setIsDragging(false);
                handleSwipeEnd(currentXRef.current);
              }
            }}
          >
            <img src={slide.gifUrl} alt={`Summary slide ${index + 1}`} className="summary-gif" draggable="false" />
            <div className="summary-text-overlay">{slide.text}</div>
          </div>
        ))}
      </div>

      <div className="button-container">
        <button onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))} disabled={currentIndex === 0}>
          👈
        </button>
        <button onClick={() => setCurrentIndex((prev) => (prev < summarySlides.length - 1 ? prev + 1 : prev))} disabled={currentIndex === summarySlides.length - 1}>
          👉
        </button>
      </div>

      <button onClick={() => (window.location.href = '/login')} className="signin-button">
        Sign In
      </button>
    </div>
  );
};

export default SummaryPage;
