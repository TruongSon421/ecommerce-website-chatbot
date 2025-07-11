import React, { useState, useEffect } from 'react';
import '../styles/slideImages.css'

interface SlideItem {
  id: number;
  image: string;
  title: string;
  link: string;
}

interface SlideProps {
  slides: SlideItem[];
  isHome: Boolean;
}

const CustomSlider: React.FC<SlideProps> = ({slides,isHome}) => {

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

  return isHome ? (
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
  ) : (
    <div className="relative mb-8 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-lg" style={{ height: '200px' }}>
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div className="flex-none w-full h-full" key={slide.id}>
              <a href={slide.link} className="block w-full h-full">
                <img 
                  className='w-full h-full object-cover' 
                  src={slide.image} 
                  alt={slide.title} 
                />
              </a>
            </div>
          ))}
        </div>
        
        <button className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-60 text-white border-none w-8 h-8 rounded-full cursor-pointer text-sm flex items-center justify-center transition-all duration-300 hover:bg-opacity-80 z-10" onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-60 text-white border-none w-8 h-8 rounded-full cursor-pointer text-sm flex items-center justify-center transition-all duration-300 hover:bg-opacity-80 z-10" onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button 
              key={index}
              className={`w-2 h-2 rounded-full border-2 cursor-pointer transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white border-white' 
                  : 'bg-transparent border-white border-opacity-60 hover:border-opacity-90'
              }`}
              onClick={() => goToSlide(index)}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomSlider;