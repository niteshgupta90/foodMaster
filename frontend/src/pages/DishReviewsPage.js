// src/pages/DishReviewsPage.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, FloatingLabel } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../services/api';
import StarRating from '../components/StarRating';
import StarRatingInput from '../components/StarRatingInput';
import '../styles/DishReviewsPage.css';

function DishReviewsPage() {
  const [dish, setDish] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  // States for new review form
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewFile, setReviewFile] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dishId = searchParams.get('dishId');

  useEffect(() => {
    if (dishId) {
      fetchDish();
    }
  }, [dishId]);

  const fetchDish = async () => {
    try {
      // Ensure backend populates recommendedRestaurants (with at least _id and name)
      const res = await axios.get(`/dishes/${dishId}`);
      setDish(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openReviewModal = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    try {
      const res = await axios.get('/dish-reviews', {
        params: { dishId: dish._id, restaurantId: restaurant._id }
      });
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
    setShowReviewModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    try {
      const formData = new FormData();
      formData.append('dish', dish._id);
      formData.append('rating', newReviewRating);
      formData.append('comment', newReviewComment);
      formData.append('restaurant', selectedRestaurant._id);
      if (reviewFile) {
        formData.append('photo', reviewFile);
      }
      await axios.post('/dish-reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Refresh reviews
      const res = await axios.get('/dish-reviews', {
        params: { dishId: dish._id, restaurantId: selectedRestaurant._id }
      });
      setReviews(res.data);
      setNewReviewRating(5);
      setNewReviewComment('');
      setReviewFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewFileChange = (e) => {
    setReviewFile(e.target.files[0]);
  };

  if (!dish) return <p>Loading...</p>;

  return (
    <Container className="mt-5 dish-reviews-page">
      <h2 className="text-center mb-4">Top Recommended Restaurants for {dish.name}</h2>
      <Row className="justify-content-center">
        {dish.recommendedRestaurants && dish.recommendedRestaurants.length > 0 ? (
          dish.recommendedRestaurants.slice(0, 3).map((rest, index) => (
            <Col key={rest._id} xs={12} md={4} className="mb-3">
              <Card className="recommended-card">
                <div className="restaurant-photo">
                  <h2>{rest.name}</h2>
                </div>
                <Card.Body className="text-center">
                  <Card.Title>{rest.name}</Card.Title>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openReviewModal(rest)}
                  >
                    View Reviews
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-muted text-center">No recommended restaurants available for this dish.</p>
        )}
      </Row>
      <Row className="justify-content-center mt-4">
        <Col md="auto">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back to Dish List
          </Button>
        </Col>
      </Row>

      {/* Review Modal for Selected Restaurant */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {dish.name} Reviews for {selectedRestaurant && selectedRestaurant.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="mb-3 text-secondary">User Reviews</h5>
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="mb-4 p-3 border rounded">
                <div className="mb-1">
                  <strong>Rating:</strong> <StarRating rating={r.rating} />
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
          <h5 className="mb-3 text-primary">Add a Review</h5>
          <Form onSubmit={submitReview}>
            <Form.Group controlId="modalRating" className="mb-3">
              <Form.Label className="fw-semibold">Your Rating</Form.Label>
              <StarRatingInput rating={newReviewRating} onChange={(val) => setNewReviewRating(val)} />
            </Form.Group>
            <Form.Group controlId="modalComment" className="mb-3">
              <FloatingLabel label="Your Comment">
                <Form.Control
                  as="textarea"
                  style={{ height: '100px' }}
                  placeholder="Share your thoughts..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  required
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="modalReviewFile" className="mb-3">
              <Form.Label className="fw-semibold">Attach Photo (Optional)</Form.Label>
              <Form.Control type="file" onChange={handleReviewFileChange} />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="success" type="submit">
                Submit Review
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default DishReviewsPage;
