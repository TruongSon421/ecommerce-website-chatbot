import React from 'react';
import '../../styles/bannerSection.css';

interface BannerSectionProps {
  imageSrc: string;
  altText: string;
  link?: string;
}

const BannerSection: React.FC<BannerSectionProps> = ({ 
  imageSrc, 
  altText, 
  link = '/' 
}) => {
  return (
    <div className="banner-section">
      <a href={link}>
        <img src={imageSrc} alt={altText} />
      </a>
    </div>
  );
};

export default BannerSection;