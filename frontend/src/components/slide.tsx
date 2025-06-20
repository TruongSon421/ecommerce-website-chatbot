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
  aspectRatio?: 'standard' | 'wide' | 'square' | 'banner'; // Tùy chọn tỉ lệ
  autoSlide?: boolean; // Tùy chọn tự động chuyển slide
  slideInterval?: number; // Thời gian chuyển slide (ms)
}

const Slider: React.FC<SlideProps> = ({
  slides,
  aspectRatio = 'banner',
  autoSlide = true,
  slideInterval = 5000
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Auto slide
  useEffect(() => {
    if (!autoSlide) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, slideInterval);
    
    return () => clearInterval(interval);
  }, [slides.length, autoSlide, slideInterval]);

  // Preload images for better performance
  useEffect(() => {
    slides.forEach((slide, index) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(index));
      };
      img.src = slide.image;
    });
  }, [slides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      prevSlide();
    } else if (event.key === 'ArrowRight') {
      nextSlide();
    }
  };

  return (
    <div 
      className={`slider ${aspectRatio}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
    >
      <div className="slider-container">
        <div 
          className="slides" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div className="slide" key={slide.id}>
              <a 
                href={slide.link}
                aria-label={slide.title}
              >
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className={loadedImages.has(index) ? 'loaded' : ''}
                  loading={index < 2 ? 'eager' : 'lazy'} // Load first 2 images immediately
                  onLoad={() => {
                    setLoadedImages(prev => new Set(prev).add(index));
                  }}
                  onError={(e) => {
                    // Fallback image on error
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-slide.jpg';
                  }}
                />
              </a>
            </div>
          ))}
        </div>
        
        {/* Navigation buttons */}
        <button 
          className="slider-btn prev" 
          onClick={prevSlide}
          aria-label="Previous slide"
          type="button"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button 
          className="slider-btn next" 
          onClick={nextSlide}
          aria-label="Next slide"
          type="button"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
        
        {/* Dots navigation */}
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button 
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;