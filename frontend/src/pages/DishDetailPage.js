// src/pages/DishDetailPage.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Button, Form, Row, Col } from 'react-bootstrap';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';

function DishDetailPage() {
  const { dishId } = useParams();
  const [dish, setDish] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchDish();
  }, [dishId]);

  const fetchDish = async () => {
    try {
      // Suppose the backend returns dish details including `reviews: [{ rating, comment, user }, ...]`
      const res = await axios.get(`/dishes/${dishId}`);
      setDish(res.data);
      // If your backend doesn't return reviews in the same response,
      // you'd fetch them separately from /api/reviews?dishId=...
      if (res.data.reviews) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST /api/reviews
      await axios.post('/reviews', {
        dish: dishId,
        rating,
        comment
      });
      // Clear form
      setRating(5);
      setComment('');
      // Re-fetch dish to update reviews
      fetchDish();
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
  };


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('No file selected');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`/dishes/${dishId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDish(res.data);
      alert('Upload successful');
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  if (!dish) {
    return (
      <Container className="mt-4">
        <p>Loading dish details...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{dish.name}</Card.Title>
          <Card.Text>
            <strong>Vegetarian:</strong> {dish.isVegetarian ? 'Yes' : 'No'} <br/>
            <strong>Price:</strong> {dish.price} <br/>
            <strong>Average Rating:</strong> {dish.averageRating || 'N/A'}
          </Card.Text>
          <h2>{dish.name}</h2>
            {/* Existing images */}
            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
                {dish.images && dish.images.map((img) => (
                <img
                    key={img._id}
                    src={img.url}
                    alt="Dish"
                    style={{ width: '150px', height: 'auto' }}
                />
                ))}
            </div>

            {/* File upload */}
            <div>
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload Photo</button>
            </div>
        </Card.Body>
      </Card>

      <h4>Reviews</h4>
      {reviews.length > 0 ? (
        reviews.map((r, index) => (
          <Card key={index} className="mb-2">
            <Card.Body>
              <Card.Text>
                <strong>Rating:</strong> {r.rating} <br/>
                <strong>Comment:</strong> {r.comment}
              </Card.Text>
              <small className="text-muted">By user {r.user?.username || 'Anonymous'}</small>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}

      {token ? (
        <Form onSubmit={handleReviewSubmit} className="mt-4">
          <h5>Add a Review</h5>
          <Row>
            <Col md={2}>
              <Form.Group controlId="ratingSelect">
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={10}>
              <Form.Group controlId="commentTextarea">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Button variant="primary" type="submit" className="mt-3">
            Submit Review
          </Button>
        </Form>
      ) : (
        <p className="mt-3">You must be logged in to add a review.</p>
      )}
    </Container>
  );
}

export default DishDetailPage;
