import React, { useState } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';
import '../styles/cards.css';
import { Link } from 'react-router-dom';

function RestaurantCard({ restaurant }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="my-card uniform-card">
        <div className="restaurant-photo">
          <h2>{restaurant.name}</h2>
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Text className="card-text-custom text-center">
            <strong>Address:</strong> {restaurant.address}
          </Card.Text>
          <div className="mt-auto d-flex gap-2">
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)} 
              className="flex-fill custom-btn-fixed"
            >
              Info
            </Button>
            <Button 
              variant="secondary"
              as={Link}
              to={`/dishes?restaurantId=${restaurant._id}&restaurantName=${encodeURIComponent(restaurant.name)}`}
              className="flex-fill custom-btn-fixed"
            >
              View Dishes
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Info Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Restaurant Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="text-primary">{restaurant.name}</h5>
          <p><strong>Address:</strong> {restaurant.address}</p>
          {/* Add more fields if needed */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RestaurantCard;
