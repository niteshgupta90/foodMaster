// src/pages/DishListPage.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, FloatingLabel, Pagination } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from '../services/api';
import DishCard from '../components/DishCard';

function DishListPage() {
  const [dishes, setDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Parse query parameters (if any) for filtering by restaurant
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('restaurantId');
  const restaurantName = searchParams.get('restaurantName') || 'Unknown';

  useEffect(() => {
    fetchDishes();
  }, [page, restaurantId]);

  const fetchDishes = async () => {
    try {
      let endpoint = '/dishes';
      const params = { page, limit: 20 };
      if (restaurantId) {
        params.restaurantId = restaurantId;
      }
      const res = await axios.get(endpoint, { params });
      setDishes(res.data.dishes);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  // Filter dishes locally by search term
  const filteredDishes = (dishes || []).filter((dish) =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dish.restaurant?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Build pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === page}
        onClick={() => setPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Container className="mt-4 content-container">
      {restaurantId ? (
        <h2 className="text-center mb-4">
          Dishes for <span className="fw-bold text-warning">{restaurantName}</span>
        </h2>
      ) : (
        <h2 className="text-center mb-4">All Dishes</h2>
      )}

      {/* Centered Search Input using FloatingLabel */}
      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <FloatingLabel controlId="searchDishes" label="Search by dish name...">
            <Form.Control
              type="text"
              placeholder="Search by dish or restaurant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FloatingLabel>
        </Col>
      </Row>

      {/* Dish Cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredDishes.map((dish) => (
          <Col key={dish._id}>
            <DishCard dish={dish} />
          </Col>
        ))}
      </Row>

      {/* Pagination Controls */}
      <Row className="justify-content-center mt-4">
        <Col md="auto">
          <Pagination>
            <Pagination.Prev
              onClick={() => setPage(prev => (prev > 1 ? prev - 1 : 1))}
              disabled={page === 1}
            />
            {paginationItems}
            <Pagination.Next
              onClick={() => setPage(prev => (prev < totalPages ? prev + 1 : totalPages))}
              disabled={page === totalPages}
            />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
}

export default DishListPage;
