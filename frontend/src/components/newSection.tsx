import React from 'react';
import '../styles/newSection.css';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  imageSrc: string;
  date: string;
  link: string;
}

const NewsSection: React.FC = () => {
  const newsItems: NewsItem[] = [
    {
      id: 1,
      title: 'iPhone 15 có những tính năng gì mới?',
      summary: 'Khám phá những tính năng nổi bật nhất trên iPhone 15 vừa ra mắt',
      imageSrc: '/images/news/iphone-15-features.jpg',
      date: '15/02/2025',
      link: '/news/iphone-15-features'
    },
    {
      id: 2,
      title: 'Cách kết nối AirPods với các thiết bị Android',
      summary: 'Hướng dẫn chi tiết cách kết nối tai nghe AirPods với điện thoại Android',
      imageSrc: '/images/news/airpods-android.jpg',
      date: '10/02/2025',
      link: '/news/airpods-android'
    },
    {
      id: 3,
      title: 'Mẹo tiết kiệm pin cho MacBook',
      summary: 'Những mẹo hữu ích giúp kéo dài thời lượng pin cho MacBook',
      imageSrc: '/images/news/macbook-battery.jpg',
      date: '05/02/2025',
      link: '/news/macbook-battery-tips'
    }
  ];

  return (
    <section className="news-section">
      <div className="section-header">
        <h2>Tin tức</h2>
        <a href="/news" className="view-all">
          Xem tất cả <i className="fas fa-arrow-right"></i>
        </a>
      </div>
      
      <div className="news-grid">
        {newsItems.map((item) => (
          <div className="news-card" key={item.id}>
            <div className="news-image">
              <a href={item.link}>
                <img src={item.imageSrc} alt={item.title} />
              </a>
            </div>
            <div className="news-content">
              <span className="news-date">{item.date}</span>
              <h3 className="news-title">
                <a href={item.link}>{item.title}</a>
              </h3>
              <p className="news-summary">{item.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;