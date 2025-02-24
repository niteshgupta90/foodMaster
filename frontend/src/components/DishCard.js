// src/components/DishCard.js

import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Modal, Form, Row, Col, FloatingLabel } from 'react-bootstrap'; // UPDATED: import FloatingLabel
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/cards.css';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import StarRatingInput from './StarRatingInput';

function DishCard({ dish }) {
  const { token } = useContext(AuthContext);

  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [file, setFile] = useState(null);
  const [localDish, setLocalDish] = useState(dish);

  const handleClose = () => setShowModal(false);
  const handleShow = () => {
    fetchReviews();
    setShowModal(true);
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/dishes/${localDish._id}`);
      if (res.data.reviews) {
        setReviews(res.data.reviews);
      }
      setLocalDish(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ADDED: Basic validation function
  const validateReview = () => {
    if (rating < 1) {
      alert('Please select at least 1 star for your rating.');
      return false;
    }
    if (!comment.trim()) {
      alert('Comment cannot be empty.');
      return false;
    }
    return true;
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to add a review!');
      return;
    }

    // Check validation
    if (!validateReview()) return; // STOP if invalid

    try {
      await axios.post('/reviews', {
        dish: localDish._id,
        rating,
        comment,
      });
      fetchReviews();
      setRating(5);
      setComment('');
      alert('Review added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
  };

  // Photo Upload Logic...
  const firstImage =
    localDish.images && localDish.images.length > 0
      ? localDish.images[0].url
      : 'https://picsum.photos/200';

  const handleImageModalShow = () => setShowImageModal(true);
  const handleImageModalClose = () => {
    setShowImageModal(false);
    setFile(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('No file selected.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      const res = await axios.post(`/dishes/${localDish._id}/upload`, formData, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` // Include the token in the headers
         },
      });
      setLocalDish(res.data);
      handleImageModalClose();
      alert('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    }
  };

  return (
    <>
      <Card className="my-card">
        <Card.Img
          variant="top"
          src={firstImage}
          alt={localDish.name}
          className="dish-photo"
        />
        <Card.Body>
          <Card.Title className="card-title-custom">{localDish.name}</Card.Title>
          <Card.Text className="card-text-custom">
            {/* <strong>Restaurant:</strong>{' '}
            {dish.restaurant ? (
              <Button
                variant="link"
                as={Link}
                to={`/restaurants/${dish.restaurant._id}`}
                className="p-0 align-baseline"
              >
                {dish.restaurant.name}
              </Button>
            ) : (
              'Unknown'
            )}
            <br /> */}
            <strong>Recommended Restaurant:</strong>{' '}
            {dish.recommendedRestaurant ? (
              <Button
                variant="link"
                as={Link}
                to={`/restaurants/${dish.recommendedRestaurant._id}`}
                className="p-0 align-baseline"
              >
                {dish.recommendedRestaurant.name}
              </Button>
            ) : (
              'Unknown'
            )}
            <br />
            <strong>Vegetarian:</strong> {localDish.isVegetarian ? 'Yes' : 'No'} <br />
            <strong>Price:</strong> {localDish.price} <br />
            <strong>Average Rating:</strong>{' '}
            {dish.averageRating ? (
              <StarRating rating={Math.round(localDish.averageRating)} />
            ) : (
              'N/A'
            )}
          </Card.Text>

          <Button variant="primary" onClick={handleShow} className="me-2">
            View / Add Reviews
          </Button>
          {token && (
            <Button variant="secondary" onClick={handleImageModalShow}>
              Upload Photo
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* REVIEW MODAL */}
      {/* ADDED: dialogClassName="review-modal" for custom sizing */}
      <Modal
        show={showModal}
        onHide={handleClose}
        size="lg"
        centered
        dialogClassName="review-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {localDish.name} - Reviews
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Existing Reviews */}
          <h5 className="mb-3 text-secondary">User Reviews</h5>
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="mb-4 p-3 border rounded">
                <div className="mb-1">
                  <strong>Rating:</strong>{' '}
                  <StarRating rating={r.rating} />
                </div>
                <div className="mb-1">
                  <strong>Comment:</strong> {r.comment}
                </div>
                <small className="text-muted">
                  By: {r.user?.username || 'Anonymous'}
                </small>
              </div>
            ))
          ) : (
            <p className="text-muted">No reviews yet.</p>
          )}

          <hr className="my-4" />

          {/* Add a New Review */}
          <h5 className="mb-3 text-primary">Add a Review</h5>
          {token ? (
            <Form onSubmit={submitReview}>
              <Row>
                <Col md={3}>
                  <Form.Group controlId="ratingStarInput" className="mb-3">
                    <Form.Label className="fw-semibold">Your Rating</Form.Label>
                    <StarRatingInput
                      rating={rating}
                      onChange={(val) => setRating(val)}
                    />
                  </Form.Group>
                </Col>
                <Col md={9}>
                  {/* UPDATED: Using FloatingLabel */}
                  <FloatingLabel
                    controlId="floatingComment"
                    label="Your Comment"
                    className="mb-3"
                  >
                    <Form.Control
                      as="textarea"
                      style={{ height: '100px' }}
                      placeholder="Share your thoughts on this dish..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </FloatingLabel>
                </Col>
              </Row>

              <div className="d-flex justify-content-end">
                <Button variant="success" type="submit">
                  Submit Review
                </Button>
              </div>
            </Form>
          ) : (
            <p className="text-muted">You must be logged in to add a review.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* PHOTO UPLOAD MODAL */}
      <Modal show={showImageModal} onHide={handleImageModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Photo for {localDish.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Image</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleImageModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DishCard;
