import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
export default function DishReviewsPage() {
  const id = new URLSearchParams(useLocation().search).get("dishId");
  return id ? (
    <Navigate to={`/dishes/${id}`} replace />
  ) : (
    <div className="container empty-state">
      <h1>Find reviews for a dish</h1>
      <Link to="/dishes">Explore dishes</Link>
    </div>
  );
}
