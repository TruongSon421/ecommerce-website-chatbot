import React from 'react';

interface SearchScoreIndicatorProps {
  score?: number;
  showScore?: boolean; // For development/debug purposes
}

const SearchScoreIndicator: React.FC<SearchScoreIndicatorProps> = ({ 
  score, 
  showScore = false // Set to true in development to see scores
}) => {
  if (!showScore || !score || score === 0) {
    return null;
  }

  return (
    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-75">
      {score.toFixed(2)}
    </div>
  );
};

export default SearchScoreIndicator; 