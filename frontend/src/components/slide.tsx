import React, { useState, useEffect } from 'react';
import '../styles/slideImages.css';

interface SlideItem {
  id: number;
  image: string;
  title: string;
  link: string;
}

interface SlideProps {
  slides: SlideItem[];
}

const Slider: React.FC<SlideProps> = ({slides}) => {

  const [currentSlide, setCurrentSlide] = useState(0);
  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="slider">
      <div className="slider-container">
        <div 
          className="slides" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div className="slide" key={slide.id}>
              <a href={slide.link}>
                <img src={slide.image} alt={slide.title} />
              </a>
            </div>
          ))}
        </div>
        
        <button className="slider-btn prev" onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="slider-btn next" onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
        
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button 
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;