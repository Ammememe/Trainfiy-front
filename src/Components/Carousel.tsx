import { useEffect, useState, useRef } from "react";
import "../styles/Carousel.css";
import React from "react";

interface CarouselItem {
  title: string;
  image: string;
}

const items: CarouselItem[] = [
  { title: "Back", image: "../pictures/back.jpg" },
  { title: "Chest", image: "../pictures/chest.jpg" },
  { title: "Biceps", image: "../pictures/biceps.jpg" },
  { title: "Shoulders", image: "../pictures/shoulder.jpg" },
  { title: "Triceps", image: "../pictures/triceps.jpg" },
  { title: "Legs", image: "../pictures/legs.jpg" },
];

const Carousel = () => {
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Optimize animation using requestAnimationFrame
  const animate = (currentTime: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = currentTime;
    const deltaTime = currentTime - lastTimeRef.current;
    
    if (deltaTime >= 16) { // Limit to ~60fps
      setOffset(prevOffset => {
        const itemWidth = 200 + 16; // width + gap
        const totalWidth = itemWidth * items.length;
        const newOffset = prevOffset + (isPaused ? 0.5 : 1);
        
        // Reset when reaching the end
        return newOffset > totalWidth ? 0 : newOffset;
      });
      lastTimeRef.current = currentTime;
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  // Use transform3d for hardware acceleration
  const getTransform = () => `translate3d(-${offset}px, 0, 0)`;

  return (
    <div className="carousel-container">
      <p>
        <strong>Select your fitness level</strong> and get customized workouts
        designed to match your experience, whether you're a beginner taking the
        first steps or an intermediate looking to progress further. Choose the
        duration that fits your schedule, and we'll provide a personalized
        workout plan to help you stay active and achieve your fitness goals on
        the go.
      </p>
      <button
        className="signin-button"
        onClick={() => (window.location.href = "/login")}
      >
        Get Started
      </button>
      <div
        className="carousel-row"
        ref={containerRef}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="carousel-items"
          style={{
            transform: getTransform(),
            willChange: 'transform'
          }}
        >
          {[...items, ...items].map((item, index) => (
            <div 
              key={index} 
              className="carousel-item"
              style={{ willChange: 'transform' }}
            >
              <div className="carousel-image-container">
                <img
                  src={item.image}
                  alt={item.title}
                  className="carousel-image"
                  loading="lazy"
                />
              </div>
              <h3 className="carousel-item-title">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;