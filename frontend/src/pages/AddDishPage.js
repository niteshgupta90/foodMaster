// src/pages/AddDishPage.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';

function AddDishPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [name, setName] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [price, setPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('/restaurants');
      setRestaurants(res.data);
      // If you want to pre-select the first restaurant:
      // setSelectedRestaurant(res.data[0]?._id || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/dishes', {
        restaurant: selectedRestaurant,
        name,
        isVegetarian,
        price,
      });
      alert('Dish added successfully!');
      navigate('/dishes');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to add dish');
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '600px' }}>
      <h2>Add New Dish</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Restaurant</Form.Label>
          <Form.Select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            required
          >
            <option value="">Select a Restaurant</option>
            {restaurants.map((rest) => (
              <option key={rest._id} value={rest._id}>
                {rest.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Dish Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. Paneer Tikka"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Is Vegetarian?"
            checked={isVegetarian}
            onChange={(e) => setIsVegetarian(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            placeholder="Dish price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Add Dish
        </Button>
      </Form>
    </Container>
  );
}

export default AddDishPage;
