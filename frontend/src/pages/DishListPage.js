// src/pages/DishListPage.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, FloatingLabel } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from '../services/api';
import DishCard from '../components/DishCard';
import '../styles/App.css'; // Ensure this file includes .content-container

function DishListPage() {
  const [dishes, setDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Parse the "restaurantId" from the query string ?restaurantId=xxxx
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId'); // might be null if not present
  const restaurantName = searchParams.get('restaurantName') || 'Unknown';

  useEffect(() => {
    fetchDishes();
    // re-fetch dishes if restaurantId changes
    // eslint-disable-next-line
  }, [restaurantId]);

  const fetchDishes = async () => {
    try {
      // 2. Construct the endpoint conditionally
      let endpoint = '/dishes';
      if (restaurantId) {
        endpoint += `?restaurantId=${restaurantId}`;
      }

      // 3. Call the backend
      const res = await axios.get(endpoint);
      setDishes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dish.restaurant?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="mt-4 content-container">
      {/* Centered Heading */}
      {restaurantId ? (
        <h2 className="text-center">
          Dishes for <span className="fw-bold text-warning">{restaurantName}</span>
        </h2>
      ) : (
        <h2 className="text-center">All Dishes</h2>
      )}

      {/* Centered Search Input using FloatingLabel */}
      <Row className="justify-content-center">
        <Col md={6}>
          <FloatingLabel 
            controlId="searchRestaurants" 
            label="Search by dish or restaurant name..." 
            className="mb-3"
          >
            <Form.Control
              type="text"
              placeholder="Search by dish or restaurant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FloatingLabel>
        </Col>
      </Row>

      {/* Responsive Grid for Dish Cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredDishes.map((dish) => (
          <Col key={dish._id}>
            <DishCard dish={dish} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default DishListPage;
