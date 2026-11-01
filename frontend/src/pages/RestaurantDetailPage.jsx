import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Alert } from "react-bootstrap";
import api from "../services/api";
export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    setRestaurant(null);
    setError("");
    api
      .get(`/restaurants/${id}`, { signal: abort.signal })
      .then((res) => setRestaurant(res.data))
      .catch((err) => {
        if (!abort.signal.aborted)
          setError(err.response?.data?.msg || "Unable to load restaurant");
      });
    return () => abort.abort();
  }, [id]);
  return (
    <Container className="discovery-page">
      <Link to="/restaurants">← All restaurants</Link>
      {error ? (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      ) : restaurant ? (
        <section className="restaurant-panel mt-4">
          <p className="eyebrow">FIND YOUR TABLE</p>
          <h1>{restaurant.name}</h1>
          <p className="lead">{restaurant.address || "Address unavailable"}</p>
          <Link
            className="btn btn-primary"
            to={`/dishes?restaurantId=${restaurant._id}&restaurantName=${encodeURIComponent(restaurant.name)}`}
          >
            Explore dishes here ↗
          </Link>
        </section>
      ) : (
        <p role="status" className="empty-state">
          Loading restaurant…
        </p>
      )}
    </Container>
  );
}
