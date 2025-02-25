// src/pages/AdminPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Form, Card, FloatingLabel } from 'react-bootstrap';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/AdminPage.css';

function AdminPage() {
  const { user, isAdmin } = useContext(AuthContext);
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [newDish, setNewDish] = useState({ name: '', description: '', restaurant: '' });
  const [newRestaurant, setNewRestaurant] = useState({ name: '', address: '' });

  useEffect(() => {
    fetchDishes();
    fetchRestaurants();
  }, []);

  const fetchDishes = async () => {
    try {
      const res = await axios.get('/dishes');
      setDishes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('/restaurants');
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDish = async () => {
    try {
      const res = await axios.post('/dishes', newDish);
      setDishes([...dishes, res.data]);
      setNewDish({ name: '', description: '', restaurant: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDish = async (id) => {
    try {
      await axios.delete(`/dishes/${id}`);
      setDishes(dishes.filter(dish => dish._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRestaurant = async () => {
    try {
      const res = await axios.post('/restaurants', newRestaurant);
      setRestaurants([...restaurants, res.data]);
      setNewRestaurant({ name: '', address: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRestaurant = async (id) => {
    try {
      await axios.delete(`/restaurants/${id}`);
      setRestaurants(restaurants.filter(restaurant => restaurant._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin()) {
    return <p className="access-denied">Access denied. Admins only.</p>;
  }

  return (
    <Container className="admin-page">
      <header className="admin-header text-center mb-5">
        <h1>Admin Dashboard</h1>
        <p>Manage Dishes and Restaurants for FoodMaster. Use the forms below to add or remove entries.</p>
      </header>
      <Row>
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">Manage Dishes</Card.Header>
            <Card.Body>
              <Form>
                <FloatingLabel controlId="dishName" label="Dish Name" className="mb-3">
                  <Form.Control
                    type="text"
                    value={newDish.name}
                    onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="dishDescription" label="Description" className="mb-3">
                  <Form.Control
                    type="text"
                    value={newDish.description}
                    onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="dishRestaurant" label="Restaurant" className="mb-3">
                  <Form.Control
                    type="text"
                    value={newDish.restaurant}
                    onChange={(e) => setNewDish({ ...newDish, restaurant: e.target.value })}
                  />
                </FloatingLabel>
                <div className="d-grid">
                  <Button variant="success" onClick={handleAddDish}>
                    Add Dish
                  </Button>
                </div>
              </Form>
              <hr />
              <h5 className="mb-3">Existing Dishes</h5>
              {dishes.length > 0 ? (
                <ul className="list-group">
                  {dishes.map(dish => (
                    <li key={dish._id} className="list-group-item d-flex justify-content-between align-items-center">
                      {dish.name}
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteDish(dish._id)}>
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No dishes available.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">Manage Restaurants</Card.Header>
            <Card.Body>
              <Form>
                <FloatingLabel controlId="restaurantName" label="Restaurant Name" className="mb-3">
                  <Form.Control
                    type="text"
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="restaurantAddress" label="Address" className="mb-3">
                  <Form.Control
                    type="text"
                    value={newRestaurant.address}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                  />
                </FloatingLabel>
                <div className="d-grid">
                  <Button variant="success" onClick={handleAddRestaurant}>
                    Add Restaurant
                  </Button>
                </div>
              </Form>
              <hr />
              <h5 className="mb-3">Existing Restaurants</h5>
              {restaurants.length > 0 ? (
                <ul className="list-group">
                  {restaurants.map(restaurant => (
                    <li key={restaurant._id} className="list-group-item d-flex justify-content-between align-items-center">
                      {restaurant.name}
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRestaurant(restaurant._id)}>
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No restaurants available.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <footer className="admin-footer text-center mt-5 pt-3 border-top">
        <p>&copy; {new Date().getFullYear()} FoodMaster Admin. All Rights Reserved.</p>
        <p>Contact: admin@foodmaster.com</p>
      </footer>
    </Container>
  );
}

export default AdminPage;
