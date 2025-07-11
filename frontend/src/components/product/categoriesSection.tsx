import React from 'react';
import '../../styles/categorySection.css';
import CategoryCard from './categoriesCard';

interface Category {
    id: number;
    name: string;
    imageSrc: string;
    link: string;
}

interface CategorySectionProps {
  categories: Category[];
}

const CategoriesSection: React.FC<CategorySectionProps> = ({ categories }) => {
  return (
    <section className="categories-section">
      <ul className="categories-grid">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </ul>
    </section>
  );
};

export default CategoriesSection;