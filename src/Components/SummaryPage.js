import React, { useState, useRef, useMemo, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { ArrowRight, Dumbbell, Heart, Brain } from 'lucide-react';
import '../styles/SummaryPage.css';
import { Check, X, RotateCcw } from 'lucide-react';
import TimerAnimation from './TimerAnimation.tsx';
import Carousel from './Carousel.tsx';

const SummaryPage = () => {
  // Define slides first
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
  
  // Initialize state with the last index to show first slide on top
  const [currentIndex, setCurrentIndex] = useState(summarySlides.length - 1);
  const currentIndexRef = useRef(currentIndex);
  const [api, setApi] = React.useState();

  const childRefs = useMemo(
    () =>
      Array(summarySlides.length)
        .fill(0)
        .map(() => React.createRef()),
    [summarySlides.length]
  );

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < summarySlides.length - 1;
  const canSwipe = currentIndex >= 0;

  const swiped = (direction, index) => {
    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (idx) => {
    currentIndexRef.current >= idx && updateCurrentIndex(idx - 1);
  };

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < summarySlides.length) {
      const ref = childRefs[currentIndex].current;
      if (ref) {
        await ref.swipe(dir);
      }
    }
  };

  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    const ref = childRefs[newIndex].current;
    if (ref) {
      await ref.restoreCard();
    }
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="summary-container">
      <div className="hero-section">
        <div className="logo-container">
          <h1 className="app-title">Welcome To SwipeToFit</h1>
          <p className="app-subtitle">Working out made simple and easy</p>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">
            <Dumbbell className="icon" />
          </div>
          <h3>Personalized Workouts</h3>
          <p>Hundreds of different exercises to choose from by just swiping</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <Heart className="icon" />
          </div>
          <h3>Saved Workouts</h3>
          <p>Did you like your previous workout session? Great because they're saved in your account</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <Brain className="icon" />
          </div>
          <h3>Choose your level</h3>
          <p>Doesn't matter if you're a beginner or intermediate, it's for everyone.</p>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="demo-title">How It Works</h2>
        <div className="demo-content">
          <div className="swipe-section">
            <div className="card-stack">
              {summarySlides.map((slide, index) => (
                <TinderCard
                  ref={childRefs[index]}
                  key={slide.id}
                  onSwipe={(dir) => swiped(dir, index)}
                  onCardLeftScreen={() => outOfFrame(index)}
                  preventSwipe={['up', 'down']}
                  className="swipe-card"
                >
                  <img
                    src={slide.gifUrl}
                    alt={`Summary slide ${index + 1}`}
                    className="card-image"
                    draggable="false"
                    onDragStart={handleDragStart}
                  />
                  <div className="summary-text-overlay">
                    {slide.text}
                  </div>
                </TinderCard>
              ))}
            </div>
            
            <div className="button-container-SP">
              <button 
                onClick={() => swipe('left')} 
                disabled={!canSwipe}
                className="action-button reject"
              >
                <X size={24} />
              </button>
              <button 
                onClick={() => goBack()} 
                disabled={!canGoBack}
                className="action-button rewind"
              >
                <RotateCcw size={24} />
              </button>
              <button 
                onClick={() => swipe('right')} 
                disabled={!canSwipe}
                className="action-button accept"
              >
                <Check size={24} />
              </button>
            </div>
          </div>

          <div className="demo-info">
            <h3>Customize Your Workout Time</h3>
            <p>Choose how long you want to work out and get personalized recommendations</p>
            <TimerAnimation />
          </div>
        </div>
      </div>

      <div className="cta-section" style={{ backgroundColor: '#f3f3f3' }}>
        <h2>Ready to start your fitness journey?</h2>
        <Carousel />
      </div>
    </div>
  );
};

export default SummaryPage;