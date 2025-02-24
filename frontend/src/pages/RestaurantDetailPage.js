// src/pages/RestaurantDetailPage.js
import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from '../services/api';
import '../styles/App.css'; // Ensure this file includes .content-container

function RestaurantDetailPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      // e.g. GET /api/restaurants/:id
      const res = await axios.get(`/restaurants/${id}`);
      setRestaurant(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="mt-4 content-container">
        <div style={{ margin: '1rem' }}>
        <h2>{restaurant.name}</h2>
        <p><strong>Address:</strong> {restaurant.address}</p>
        {/* Add more restaurant details or a list of dishes, etc. */}
        </div>
    </Container>
  );
}

export default RestaurantDetailPage;
