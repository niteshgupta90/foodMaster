// src/components/DishCard.js
import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Modal, Form, Row, Col, FloatingLabel } from 'react-bootstrap';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/cards.css';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import StarRatingInput from './StarRatingInput';

function DishCard({ dish }) {
  const { token } = useContext(AuthContext);

  // Existing states
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // New states for review submission form
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [restaurantOptions, setRestaurantOptions] = useState([]);
  const [reviewFile, setReviewFile] = useState(null);
  const [reviewFilter, setReviewFilter] = useState(''); // NEW: filter input for reviews

  // Existing states for dish image upload
  const [showImageModal, setShowImageModal] = useState(false);
  const [file, setFile] = useState(null);
  const [localDish, setLocalDish] = useState(dish);
  const { user, isAdmin } = useContext(AuthContext); // Get user and isAdmin from context

  console.log('isAdmin:', isAdmin());
  // Handlers for review modal
  const handleClose = () => setShowModal(false);
  const handleShow = () => {
    fetchReviews();
    fetchRestaurantOptions();
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

  // New: Fetch list of restaurants for dropdown selection
  const fetchRestaurantOptions = async () => {
    try {
      const res = await axios.get('/restaurants');
      setRestaurantOptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Basic validation for review submission
  const validateReview = () => {
    if (rating < 1) {
      alert('Please select at least 1 star for your rating.');
      return false;
    }
    if (!comment.trim()) {
      alert('Comment cannot be empty.');
      return false;
    }
    if (!selectedRestaurant) {
      alert('Please select a restaurant source for this review.');
      return false;
    }
    return true;
  };

  // Submit review (including optional review photo)
  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to add a review!');
      return;
    }
    if (!validateReview()) return;

    try {
      const formData = new FormData();
      formData.append('dish', localDish._id);
      formData.append('rating', rating);
      formData.append('comment', comment);
      formData.append('restaurant', selectedRestaurant); // selected restaurant source

      if (reviewFile) {
        formData.append('photo', reviewFile);
      }

      // Using existing reviews endpoint to handle multipart/form-data submission.
      await axios.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchReviews();
      setRating(5);
      setComment('');
      setSelectedRestaurant('');
      setReviewFile(null);
      alert('Review added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
  };

  // Existing dish image upload logic
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

      const storedToken = localStorage.getItem('token');
      const res = await axios.post(`/dishes/${localDish._id}/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${storedToken}`
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

  // New: Handler for review photo file change
  const handleReviewFileChange = (e) => {
    setReviewFile(e.target.files[0]);
  };

  // Filter reviews based on restaurant name if filter text is provided.
  const filteredReviews = reviews.filter(r => 
    !reviewFilter || ((r.restaurant?.name || '').toLowerCase().includes(reviewFilter.toLowerCase()))
  );

  return (
    <>
      <Card className="my-card uniform-card">
      <Card.Img
          variant="top"
          src={firstImage}
          alt={localDish.name}
          className="dish-photo"
        />
        <Card.Body>
          <Card.Title className="card-title-custom">{localDish.name}</Card.Title>
          <Card.Text className="card-text-custom">
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
          {token && isAdmin() && (
            <Button variant="secondary" onClick={handleImageModalShow}>
              Upload Dish Photo
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* REVIEW MODAL */}
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
          {/* Section: Dish Photos */}
          <h5 className="mb-3 text-secondary">Dish Photos</h5>
          {localDish.images && localDish.images.length > 0 ? (
            <Row className="g-2 mb-4">
              {localDish.images.map((img, index) => (
                <Col key={index} xs={4} md={3}>
                  <img
                    src={img.url}
                    alt={`Dish Photo ${index + 1}`}
                    className="img-thumbnail uniform-review-photo"
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-muted">No photos available for this dish.</p>
          )}

          {/* Section: Filter Reviews by Restaurant */}
          <FloatingLabel
            controlId="reviewFilter"
            label="Filter reviews by restaurant..."
            className="mb-3"
          >
            <Form.Control
              type="text"
              placeholder="Filter reviews by restaurant..."
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
            />
          </FloatingLabel>

          {/* Section: Existing Reviews */}
          <h5 className="mb-3 text-secondary">User Reviews</h5>
          {filteredReviews.length > 0 ? (
            filteredReviews.map((r) => (
              <div key={r._id} className="mb-4 p-3 border rounded">
                <div className="mb-1">
                  <strong>Rating:</strong>{' '}
                  <StarRating rating={r.rating} />
                </div>
                <div className="mb-1">
                  <strong>Comment:</strong> {r.comment}
                </div>
                <small className="text-muted">
                  By: {r.user?.username || 'Anonymous'} | Restaurant: {r.restaurant?.name || 'Unknown'}
                </small>
              </div>
            ))
          ) : (
            <p className="text-muted">No reviews yet.</p>
          )}

          <hr className="my-4" />

        {/* Add a New Review Section */}
        <h5 className="mb-3 text-primary">Add a Review</h5>
        {token ? (
          <Form onSubmit={submitReview}>
            <Form.Group controlId="ratingStarInput" className="mb-3">
              <Form.Label className="fw-semibold">Your Rating</Form.Label>
              <StarRatingInput
                rating={rating}
                onChange={(val) => setRating(val)}
              />
            </Form.Group>
            <Form.Group controlId="floatingComment" className="mb-3">
              <FloatingLabel label="Your Comment">
                <Form.Control
                  as="textarea"
                  style={{ height: '100px' }}
                  placeholder="Share your thoughts on this dish..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </FloatingLabel>
            </Form.Group>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="restaurantSelect">
                  <Form.Label className="fw-semibold">Select Restaurant </Form.Label>
                  <Form.Select
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
                    required
                  >
                    <option value="">Select a restaurant</option>
                    {restaurantOptions.map((rest) => (
                      <option key={rest._id} value={rest._id}>
                        {rest.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="reviewFile">
                  <Form.Label className="fw-semibold">Attach Photo (Optional)</Form.Label>
                  <Form.Control type="file" onChange={handleReviewFileChange} />
                </Form.Group>
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

      {/* PHOTO UPLOAD MODAL for Dish Images */}
      <Modal show={showImageModal} onHide={handleImageModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Dish Photo for {localDish.name}</Modal.Title>
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
