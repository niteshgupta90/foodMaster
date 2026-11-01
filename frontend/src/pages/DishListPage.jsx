import React, { useEffect, useState } from "react";
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
import { useLocation, Link } from "react-router-dom";
import api from "../services/api";
import DishCard from "../components/DishCard";
import DishFilters, { emptyFilters } from "../components/DishFilters";
export default function DishListPage() {
  const [data, setData] = useState({ dishes: [], total: 0, totalPages: 0 });
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const restaurantId = params.get("restaurantId");
  const restaurantName = params.get("restaurantName");
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    (async () => {
      try {
        const request = {
          ...filters,
          q: query,
          page,
          limit: 12,
          sortBy: sort,
          restaurantId,
        };
        if (filters.distance) {
          if (!navigator.geolocation)
            throw new Error(
              "Location is unavailable. Choose Any distance to continue.",
            );
          const position = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(
              resolve,
              () =>
                reject(
                  new Error(
                    "Location access was unavailable. Choose Any distance or allow location access.",
                  ),
                ),
              { timeout: 10000 },
            ),
          );
          request.lat = position.coords.latitude;
          request.lng = position.coords.longitude;
        }
        const res = await api.get("/dishes", {
          params: request,
          signal: abort.signal,
        });
        if (!abort.signal.aborted) setData(res.data);
      } catch (err) {
        if (!abort.signal.aborted)
          setError(
            err.response?.data?.msg || err.message || "Unable to load dishes.",
          );
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    })();
    return () => abort.abort();
  }, [query, page, sort, filters, restaurantId, retry]);
  return (
    <Container className="discovery-page">
      <header className="page-intro">
        <p className="eyebrow">THE DISH COMES FIRST</p>
        <h1>What are you craving?</h1>
        <p>Find a dish you’ll love. Discover where to try it.</p>
      </header>
      <Row className="g-4">
        <Col lg={3}>
          <DishFilters
            filters={filters}
            onFilterChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          />
        </Col>
        <Col lg={9}>
          <Form
            className="search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(draft.trim());
              setPage(1);
            }}
          >
            <Form.Control
              aria-label="Search dishes"
              placeholder="Try paneer, dosa, biryani…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit">Search dishes</Button>
          </Form>
          <div className="results-toolbar">
            <div>
              <h2>
                {restaurantId
                  ? `Dishes at ${restaurantName || "this restaurant"}`
                  : "Explore the menu"}
              </h2>
              <span className="text-muted small" aria-live="polite">
                {loading
                  ? "Finding your next favorite…"
                  : `${data.total} dishes${query ? ` matching “${query}”` : ""}`}
                {filters.city ? ` · ${filters.city}` : ""}
              </span>
              {restaurantId && (
                <Link className="d-block small" to="/dishes">
                  Browse all dishes
                </Link>
              )}
            </div>
            <Form.Select
              aria-label="Sort dishes"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Recommended order</option>
              <option value="name">Name A–Z</option>
              <option value="rating">Highest rated</option>
            </Form.Select>
          </div>
          {error ? (
            <Alert variant="danger" role="alert">
              {error}{" "}
              <Button variant="link" onClick={() => setRetry((x) => x + 1)}>
                Try again
              </Button>
            </Alert>
          ) : loading ? (
            <div className="empty-state" role="status">
              <Spinner animation="border" />
              <p>Loading dishes…</p>
            </div>
          ) : !data.dishes.length ? (
            <div className="empty-state">
              <h2>No dishes found</h2>
              <p>Try another search or clear your filters.</p>
              <Button
                variant="outline-primary"
                onClick={() => {
                  setFilters(emptyFilters);
                  setDraft("");
                  setQuery("");
                  setPage(1);
                }}
              >
                Clear search & filters
              </Button>
            </div>
          ) : (
            <>
              <Row xs={1} sm={2} xl={3} className="g-4">
                {data.dishes.map((dish) => (
                  <Col key={dish._id}>
                    <DishCard dish={dish} />
                  </Col>
                ))}
              </Row>
              {data.totalPages > 1 && (
                <nav aria-label="Dish pages" className="pagination-wrap">
                  <Pagination>
                    <Pagination.Prev
                      disabled={page === 1}
                      onClick={() => setPage((x) => x - 1)}
                    />
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                      .filter(
                        (n) =>
                          n === 1 ||
                          n === data.totalPages ||
                          Math.abs(n - page) <= 1,
                      )
                      .map((n, i, ns) => (
                        <React.Fragment key={n}>
                          {i > 0 && n - ns[i - 1] > 1 && (
                            <Pagination.Ellipsis disabled />
                          )}
                          <Pagination.Item
                            active={n === page}
                            onClick={() => setPage(n)}
                          >
                            {n}
                          </Pagination.Item>
                        </React.Fragment>
                      ))}
                    <Pagination.Next
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((x) => x + 1)}
                    />
                  </Pagination>
                </nav>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}
