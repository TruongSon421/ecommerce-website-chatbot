import { useState } from "react";

interface ProductImageGalleryProps {
  thumbnails: string[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ thumbnails }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const handlePrev = () => {
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : thumbnails.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prevIndex) => (prevIndex < thumbnails.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <div className="w-full md:w-1/2">
      <div className="relative">
        <button className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center z-50 left-3" onClick={handlePrev}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <img 
          src={thumbnails[selectedIndex]} 
          alt={`big_image_${selectedIndex+1}`} 
          className="w-full h-auto transition-opacity duration-500 ease-in-out opacity-100 animate-fadeIn"
        />
        <button className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center z-50 right-3" onClick={handleNext}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="flex space-x-2 mt-4 justify-center">
        {thumbnails.map((thumb, index) => (
          <img
            key={index}
            src={thumb}
            alt={`slide_image_${index + 1}`}
            className={`w-16 h-16 object-cover rounded cursor-pointer transition-transform transform hover:scale-110 ${
              selectedIndex === index ? "border-2 border-blue-500 scale-125 transition duration-300" : ""
            }`}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;