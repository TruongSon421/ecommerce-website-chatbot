import React from 'react';
import '../styles/categoryCard.css';
// Define the Category interface 
interface Category {
    id: number;
    name: string;
    imageSrc: string;
    link: string;
}
// Define the CategoryCardProps interface
interface CategoryCardProps {
    category: Category;
}
// Define the CategoryCard component
const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { name, imageSrc, link} = category;
    return (
        <li className="category-card">
            <a href={link}> 
                <div className="category-image">
                    <img src={imageSrc} alt={name} />
                </div>
                <span className="category-name">{name}</span>
            </a>
        </li>
    );
};

export default CategoryCard;