// src/pages/RestaurantListPage.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, FloatingLabel, Pagination } from 'react-bootstrap';
import axios from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import '../styles/App.css';

function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch restaurants when page or searchTerm changes.
  useEffect(() => {
    fetchRestaurants();
  }, [page]);

  const fetchRestaurants = async () => {
    try {
      // We'll assume our backend supports ?page and ?limit
      const res = await axios.get('/restaurants', {
        params: { page, limit: 20 }
      });
      setRestaurants(res.data.restaurants);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter restaurants locally by search term
  const filteredRestaurants = (restaurants || []).filter((rest) =>
    rest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rest.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Container className="mt-4 content-container">
      <h2 className="text-center mb-4">Nearby Restaurants</h2>
      
      {/* Search Input */}
      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <FloatingLabel controlId="searchRestaurants" label="Search by name or address...">
            <Form.Control
              type="text"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FloatingLabel>
        </Col>
      </Row>

      {/* Restaurant Cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredRestaurants.map((rest) => (
          <Col key={rest._id}>
            <RestaurantCard restaurant={rest} />
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

export default RestaurantListPage;
