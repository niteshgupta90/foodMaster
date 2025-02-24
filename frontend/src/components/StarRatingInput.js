// src/components/StarRatingInput.js
import React from 'react';
import { FaStar } from 'react-icons/fa';

function StarRatingInput({ rating, onChange }) {
  // rating: current numeric rating (1..5)
  // onChange: callback to set the new rating

  const filledColor = '#ffc107'; // gold
  const unfilledColor = '#e4e5e9'; // light gray

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <FaStar
            key={index}
            color={starValue <= rating ? filledColor : unfilledColor}
            style={{ cursor: 'pointer' }}
            onClick={() => onChange(starValue)}
          />
        );
      })}
    </div>
  );
}

export default StarRatingInput;
