import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import api, { imageUrl } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import StarRatingInput from "../components/StarRatingInput";
export default function DishDetailPage() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [dish, setDish] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    setDish(null);
    setError("");
    setImageFailed(false);
    api
      .get(`/dishes/${id}`, { signal: abort.signal })
      .then((res) => setDish(res.data))
      .catch((err) => {
        if (!abort.signal.aborted)
          setError(err.response?.data?.msg || "Unable to load this dish.");
      });
    return () => abort.abort();
  }, [id]);
  useEffect(() => {
    if (!selected) return;
    const abort = new AbortController();
    setReviews([]);
    setReviewError("");
    setReviewLoading(true);
    setSuccess(false);
    setComment("");
    setFile(null);
    setRating(5);
    api
      .get("/dish-reviews", {
        params: { dishId: id, restaurantId: selected._id },
        signal: abort.signal,
      })
      .then((res) => setReviews(res.data))
      .catch((err) => {
        if (!abort.signal.aborted)
          setReviewError(
            "Unable to load reviews. Close this dialog and try again.",
          );
      })
      .finally(() => {
        if (!abort.signal.aborted) setReviewLoading(false);
      });
    return () => abort.abort();
  }, [selected, id]);
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setReviewError("");
    setSuccess(false);
    try {
      const body = new FormData();
      body.append("dish", id);
      body.append("restaurant", selected._id);
      body.append("rating", rating);
      body.append("comment", comment);
      if (file) body.append("photo", file);
      const res = await api.post("/dish-reviews", body);
      setReviews((items) => [
        ...items,
        { ...res.data, user: { username: "You" } },
      ]);
      setComment("");
      setFile(null);
      setSuccess(true);
      const updated = await api.get(`/dishes/${id}`);
      setDish(updated.data);
    } catch (err) {
      setReviewError(
        err.response?.data?.msg ||
          "Could not complete the request. Check the reviews before retrying.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (error)
    return (
      <Container className="empty-state">
        <Alert variant="danger">{error}</Alert>
        <Link to="/dishes">Back to dishes</Link>
      </Container>
    );
  if (!dish)
    return (
      <div className="empty-state" role="status">
        <Spinner animation="border" />
        <p>Loading dish…</p>
      </div>
    );
  const restaurants = Array.from(
    new Map(
      [
        ...(dish.recommendedRestaurants || []),
        ...(dish.restaurants || []),
        dish.restaurant,
      ]
        .filter((x) => x?._id)
        .map((x) => [x._id, x]),
    ).values(),
  );
  return (
    <Container className="detail-page">
      <Link to="/dishes" className="back-link">
        ← Back to discoveries
      </Link>
      <Row className="g-5 mt-1">
        <Col lg={7}>
          <div className="detail-photo">
            {dish.images?.length && !imageFailed ? (
              <img
                src={imageUrl(dish.images[0].url)}
                alt={dish.name}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="food-placeholder">
                <span>✳</span>
                <span>{dish.name}</span>
              </div>
            )}
          </div>
          <p className="eyebrow mt-4">
            {dish.cuisineType || "DISH DISCOVERY"} ·{" "}
            {dish.priceTier || "EXPLORE"}
          </p>
          <h1>{dish.name}</h1>
          <div className="detail-meta">
            <span>
              ★{" "}
              {dish.averageRating > 0
                ? Number(dish.averageRating).toFixed(1)
                : "Not rated yet"}
            </span>
            <span>{dish.reviewCount || 0} reviews</span>
            <span>
              {dish.price != null
                ? `$${Number(dish.price).toFixed(2)}`
                : "Price unavailable"}
            </span>
          </div>
          <p className="lead mt-4">
            {dish.description ||
              "Find a place to try this dish and share your experience."}
          </p>
          {dish.origin && (
            <p>
              <strong>Origin</strong>
              <br />
              {dish.origin}
            </p>
          )}
          {dish.calories != null && (
            <p>
              <strong>Calories</strong>
              <br />
              {dish.calories} kcal
            </p>
          )}
          {dish.recipe && (
            <section className="recipe-section">
              <h2>Inside the dish</h2>
              <p>{dish.recipe}</p>
            </section>
          )}
        </Col>
        <Col lg={5}>
          <div className="restaurant-panel">
            <p className="eyebrow">FIND YOUR TABLE</p>
            <h2>Where to try it</h2>
            <p className="text-muted">
              Explore restaurants and reviews for this dish.
            </p>
            {restaurants.length ? (
              restaurants.map((rest, index) => (
                <Card key={rest._id} className="place-card">
                  <Card.Body>
                    <span className="place-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>
                      <Link to={`/restaurants/${rest._id}`}>{rest.name}</Link>
                    </h3>
                    <p>{rest.address || "Address unavailable"}</p>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setSelected(rest)}
                    >
                      Read reviews{token ? " & add yours" : ""}
                    </Button>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="empty-state">
                <p>No restaurants linked to this dish yet.</p>
                <Link to="/restaurants">Explore restaurants</Link>
              </div>
            )}
          </div>
        </Col>
      </Row>
      <Modal
        show={!!selected}
        onHide={() => {
          if (!saving) setSelected(null);
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {dish.name} · {selected?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewError && <Alert variant="danger">{reviewError}</Alert>}
          {success && <Alert variant="success">Your review was saved.</Alert>}
          <h2 className="h5">Community reviews</h2>
          {reviewLoading ? (
            <p role="status">Loading reviews…</p>
          ) : reviews.length ? (
            reviews.map((review) => (
              <article className="review-item" key={review._id}>
                <strong>★ {review.rating} / 5</strong>
                <p>{review.comment}</p>
                <small>{review.user?.username || "Food lover"}</small>
              </article>
            ))
          ) : (
            <p className="text-muted">No reviews yet. Share the first taste.</p>
          )}
          {token ? (
            <Form onSubmit={submit} className="review-form">
              <h2 className="h5">Share your experience</h2>
              <StarRatingInput rating={rating} onChange={setRating} />
              <Form.Group controlId="review-comment" className="my-3">
                <Form.Label>Your review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={3000}
                />
              </Form.Group>
              <Form.Group controlId="review-photo" className="mb-3">
                <Form.Label>Photo (optional, up to 5 MB)</Form.Label>
                <Form.Control
                  key={String(success)}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Form.Group>
              <Button type="submit" disabled={saving || reviewLoading}>
                {saving ? "Saving…" : "Publish review"}
              </Button>
            </Form>
          ) : (
            <p>
              <Link to="/login">Sign in</Link> to share your review.
            </p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
