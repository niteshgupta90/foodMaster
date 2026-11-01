import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  Pagination,
} from "react-bootstrap";
import api from "../services/api";
import RestaurantCard from "../components/RestaurantCard";
export default function RestaurantListPage() {
  const [data, setData] = useState({
    restaurants: [],
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    api
      .get("/restaurants", {
        params: { page, limit: 12, q },
        signal: abort.signal,
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (!abort.signal.aborted)
          setError("Unable to load restaurants. Please refresh to try again.");
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [page, q]);
  return (
    <Container className="discovery-page">
      <header className="page-intro">
        <p className="eyebrow">FIND YOUR TABLE</p>
        <div className="directory-heading">
          <h1>A place for every craving.</h1>

        </div>
        <p>Explore local restaurants and discover what to order.</p>
      </header>
      <Form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(draft.trim());
          setPage(1);
        }}
      >
        <Form.Control
          aria-label="Search restaurants"
          placeholder="Search by restaurant or address…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit">Find restaurants</Button>
      </Form>
      <p className="text-muted mt-4" aria-live="polite">
        {data.total} restaurants
      </p>
      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : loading ? (
        <div className="empty-state" role="status">
          <Spinner animation="border" />
        </div>
      ) : !data.restaurants.length ? (
        <div className="empty-state">
          <h2>No restaurants found</h2>
          <p>Try a different name or address.</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {data.restaurants.map((rest) => (
            <Col key={rest._id}>
              <RestaurantCard restaurant={rest} />
            </Col>
          ))}
        </Row>
      )}
      {data.totalPages > 1 && (
        <Pagination className="pagination-wrap">
          <Pagination.Prev
            disabled={page <= 1}
            onClick={() => setPage((x) => x - 1)}
          />
          {Array.from({ length: data.totalPages }, (_, i) => (
            <Pagination.Item
              key={i}
              active={page === i + 1}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={page >= data.totalPages}
            onClick={() => setPage((x) => x + 1)}
          />
        </Pagination>
      )}
    </Container>
  );
}
