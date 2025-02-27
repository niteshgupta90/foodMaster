// src/components/DishCard.js
import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/DishCard.css';
import StarRating from './StarRating';

function DishCard({ dish }) {
  const navigate = useNavigate();
  const [localDish] = useState(dish);

  // If there is an image, use the first one; otherwise, show a placeholder.
  const firstImage =
    localDish.images && localDish.images.length > 0
      ? localDish.images[0].url
      : null;

  const renderDishImage = () => {
    if (firstImage) {
      return (
        <Card.Img
          variant="top"
          src={firstImage}
          alt={localDish.name}
          className="dish-card-img"
        />
      );
    } else {
      return (
        <div className="dish-card-img-placeholder">
          <h2>{localDish.name}</h2>
        </div>
      );
    }
  };

  return (
    <Card className="dish-card uniform-card shadow-sm">
      {renderDishImage()}
      <Card.Body className="d-flex flex-column text-center">
        <Card.Title className="dish-card-title">{localDish.name}</Card.Title>
        <Card.Text className="dish-card-text">
          <strong>Vegetarian:</strong> {localDish.isVegetarian ? 'Yes' : 'No'} <br />
          <strong>Price:</strong> {localDish.price} <br />
          <strong>Rating:</strong>{' '}
          {localDish.averageRating ? (
            <StarRating rating={Math.round(localDish.averageRating)} />
          ) : (
            'N/A'
          )}
        </Card.Text>
        <Button
          variant="primary"
          onClick={() => navigate(`/dish-reviews?dishId=${localDish._id}`)}
          className="view-button mt-auto"
        >
          View
        </Button>
      </Card.Body>
    </Card>
  );
}

export default DishCard;
