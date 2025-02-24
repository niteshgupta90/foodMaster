import React, { useState } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';
import '../styles/cards.css';

function RestaurantCard({ restaurant }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="h-100 my-card">
        {/* Placeholder image (or real one if you have it) */}
        <Card.Img
          variant="top"
          src="https://picsum.photos/200"
          alt={restaurant.name}
        />
        <Card.Body className="d-flex flex-column">
          <Card.Title>{restaurant.name}</Card.Title>
          <Card.Text className="text-muted">
            <strong>Address:</strong> {restaurant.address}
          </Card.Text>

          <div className="mt-auto">
            <Button variant="primary" onClick={() => setShowModal(true)} className="me-2">
              Info
            </Button>
            <Button
              variant="secondary"
              href={`/dishes?restaurantId=${restaurant._id}&restaurantName=${encodeURIComponent(
                restaurant.name
              )}`}
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
