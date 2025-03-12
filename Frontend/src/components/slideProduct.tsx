import React, { useState, useEffect } from 'react';

interface SlideItem {
  id: number;
  image: string;
  title: string;
  link: string;
}

const Slider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides: SlideItem[] = [
    {
      id: 1,
      image: '/images/slider/slide1.png',
      title: 'iPhone 15 mới - Siêu phẩm từ Apple',
      link: '/iphone-15'
    },
    {
      id: 2,
      image: '/images/slider/slide2.png',
      title: 'MacBook Air M2 - Mỏng nhẹ, mạnh mẽ',
      link: '/macbook-air'
    },
    {
      id: 3,
      image: '/images/slider/slide3.png',
      title: 'Apple Watch Series 9 - Đo nhịp tim, SpO2',
      link: '/apple-watch-series-9'
    },
    {
        id: 4,
        image: '/images/slider/slide4.png',
        title: 'AirPods 3 - Chống ồn, chống nước',
        link: '/airpods-3'
    },
    {
        id: 5,
        image: '/images/slider/slide5.png',
        title: 'iPad Pro 2022 - Màn hình ProMotion',
        link: '/ipad-pro-2022'
    }
  ];

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