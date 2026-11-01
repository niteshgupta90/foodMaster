import React, { useState } from "react";
import { Link } from "react-router-dom";
import { imageUrl } from "../services/api";
export default function DishCard({ dish }) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl(dish.images?.[0]?.url);
  return (
    <Link to={`/dishes/${dish._id}`} className="food-card">
      <div className="food-card-photo">
        {src && !failed ? (
          <img
            loading="lazy"
            src={src}
            alt={dish.name}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="food-placeholder">
            <span>✳</span>
            <span>{dish.cuisineType || "A new discovery"}</span>
          </div>
        )}
        <span className="cuisine-badge">{dish.cuisineType || "Explore"}</span>
      </div>
      <div className="food-card-body">
        <div className="d-flex justify-content-between gap-2">
          <h2>{dish.name}</h2>
          <span className="dish-price">
            {dish.price != null
              ? `$${Number(dish.price).toFixed(2)}`
              : dish.priceTier || "—"}
          </span>
        </div>
        <p>
          {dish.description ||
            "Discover the flavors and find your favorite place to try it."}
        </p>
        <div className="food-card-meta">
          <span className="rating">
            ★{" "}
            {dish.averageRating > 0
              ? Number(dish.averageRating).toFixed(1)
              : "Not rated"}
          </span>
          <span>
            {dish.dietary?.isVegetarian === true ? "Vegetarian" : "View dish"}{" "}
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
