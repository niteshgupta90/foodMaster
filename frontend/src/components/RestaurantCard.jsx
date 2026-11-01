import React from "react";
import { Link } from "react-router-dom";
export default function RestaurantCard({ restaurant }) {
  return (
    <article className="restaurant-tile">
      <span className="eyebrow">A LOCAL TABLE</span>
      <h2>
        <Link to={`/restaurants/${restaurant._id}`}>{restaurant.name}</Link>
      </h2>
      <p>{restaurant.address || "Address unavailable"}</p>
      <Link
        className="btn btn-outline-primary"
        to={`/dishes?restaurantId=${restaurant._id}&restaurantName=${encodeURIComponent(restaurant.name)}`}
      >
        Explore dishes ↗
      </Link>
    </article>
  );
}
