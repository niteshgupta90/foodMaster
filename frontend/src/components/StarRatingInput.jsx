import React from "react";
export default function StarRatingInput({ rating, onChange }) {
  return (
    <div className="star-input" role="group" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          type="button"
          key={value}
          aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
          aria-pressed={rating === value}
          onClick={() => onChange(value)}
          className={value <= rating ? "selected" : ""}
        >
          ★
        </button>
      ))}
    </div>
  );
}
