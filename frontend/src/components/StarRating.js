// src/components/StarRating.js
import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

function StarRating({ rating }) {
  // rating is a number from 1 to 5
  // We'll display 5 stars. If i <= rating, it's "filled", else "unfilled."
  
  // Optional color scheme:
  const filledColor = '#ffc107';  // gold
  const unfilledColor = '#e4e5e9';  // light gray

  return (
    <div style={{ display: 'inline-block' }}>
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 0.5;  // midpoints
        if (rating >= i + 1) {
          return <FaStar key={i} color={filledColor} />;
        } else if (rating >= starValue) {
          // half star
          return <FaStarHalfAlt key={i} color={filledColor} />;
        } else {
          return <FaStar key={i} color={unfilledColor} />;
        }
      })}
    </div>
  );
}

export default StarRating;
