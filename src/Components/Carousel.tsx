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
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prevOffset) => prevOffset + (isHovering ? 0.5 : 1.5)); // Slower when hovering
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [isHovering]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const itemWidth = 200 + 16; // width + gap
    const totalItems = items.length;

    // If we've scrolled past the first set of items, reset without a visible rewind
    if (offset > itemWidth * totalItems) {
      setOffset(0);
    }
  }, [offset]);

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
        onMouseEnter={() => setIsHovering(true)} // Detect hover
        onMouseLeave={() => setIsHovering(false)} // Detect when hover ends
      >
        <div
          className="carousel-items"
          style={{
            transform: `translateX(-${offset}px)`,
          }}
        >
          {/* Duplicate items to create the infinite loop illusion */}
          {[...items, ...items].map((item, index) => (
            <div key={index} className="carousel-item">
              <div className="carousel-image-container">
                <img
                  src={item.image}
                  alt={item.title}
                  className="carousel-image"
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
