import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function AdminPage() {
  const { user } = useContext(AuthContext);
  const isAdmin = !!user?.isAdmin;
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [directory, setDirectory] = useState({
    restaurants: [],
    total: 0,
    totalPages: 0,
  });
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState("");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [directoryRefresh, setDirectoryRefresh] = useState(0);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState("");
  const [added, setAdded] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const abort = new AbortController();
    setStatsLoading(true);
    setStatsError("");
    Promise.all([
      api.get("/dishes", { params: { limit: 1 }, signal: abort.signal }),
      api.get("/restaurants", { params: { limit: 1 }, signal: abort.signal }),
    ])
      .then(([d, r]) =>
        setStats({ dishes: d.data.total, restaurants: r.data.total }),
      )
      .catch(() => {
        if (!abort.signal.aborted)
          setStatsError("Catalog totals could not be loaded.");
      })
      .finally(() => {
        if (!abort.signal.aborted) setStatsLoading(false);
      });
    return () => abort.abort();
  }, [isAdmin, refresh]);
  useEffect(() => {
    if (!isAdmin) return;
    const abort = new AbortController();
    setDirectoryLoading(true);
    setDirectoryError("");
    api
      .get("/restaurants", {
        params: { q: query, page, limit: 6 },
        signal: abort.signal,
      })
      .then((res) => setDirectory(res.data))
      .catch(() => {
        if (!abort.signal.aborted)
          setDirectoryError("The restaurant directory could not be loaded.");
      })
      .finally(() => {
        if (!abort.signal.aborted) setDirectoryLoading(false);
      });
    return () => abort.abort();
  }, [isAdmin, query, page, directoryRefresh]);
  async function submit(event) {
    event.preventDefault();
    setFormError("");
    setAdded(null);
    if (!name.trim() || !address.trim()) {
      setFormError("Enter a restaurant name and full address.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/restaurants", {
        name: name.trim(),
        address: address.trim(),
      });
      setAdded(data);
      setName("");
      setAddress("");
      setRefresh((x) => x + 1);
      setQuery("");
      setDraft("");
      setPage(1);
      setDirectoryRefresh((x) => x + 1);
    } catch (err) {
      setFormError(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          "Unable to add this restaurant. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (!isAdmin)
    return (
      <Container className="empty-state">
        <h1>Admin access required</h1>
        <p>This area is available to administrator accounts.</p>
        <Link to="/dishes">Back to discoveries</Link>
      </Container>
    );
  return (
    <Container className="admin-workspace">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">FOODMASTER / ADMIN WORKSPACE</p>
          <h1>
            Keep good food
            <br />
            {" "}on the map.
          </h1>
          <p className="text-muted">
            Welcome back, {user.displayName || user.username}. Here’s your food
            catalog.
          </p>
        </div>
        <div className="admin-heading-actions">
          <span className="admin-access">● Administrator</span>
          <Link className="btn btn-primary" to="/add-dish">
            + Add a dish
          </Link>
        </div>
      </header>
      {statsError && (
        <Alert variant="warning">
          {statsError}{" "}
          <Button variant="link" onClick={() => setRefresh((x) => x + 1)}>
            Retry totals
          </Button>
        </Alert>
      )}
      <section
        className="admin-metrics"
        aria-label="Catalog overview"
        aria-busy={statsLoading}
      >
        {[
          ["dishes", "Dishes", "/dishes", "Explore the dish catalog"],
          [
            "restaurants",
            "Restaurants",
            "/restaurants",
            "Browse all restaurants",
          ],
        ].map(([key, label, url, text]) => (
          <article key={key} className="admin-metric">
            <div className="metric-heading">
              <span>{label}</span>
              <span className="metric-symbol" aria-hidden="true">
                {key === "dishes" ? "✳" : "⌂"}
              </span>
            </div>
            <strong aria-label={`${label} total`}>
              {statsLoading ? "…" : (stats?.[key] ?? "—")}
            </strong>
            <Link to={url}>
              {text} <span aria-hidden="true">↗</span>
            </Link>
          </article>
        ))}
        <article className="admin-shortcuts">
          <p className="eyebrow">YOUR NEXT GOOD FIND</p>
          <h2>A great catalog starts with the details.</h2>
          <p>
            Check existing places before adding a restaurant, and use a complete
            address.
          </p>
          <Link to="/profile">Manage your profile ↗</Link>
        </article>
      </section>
      <div className="admin-content-grid">
        <section
          className="admin-directory"
          aria-labelledby="directory-heading"
        >
          <header className="admin-section-heading">
            <div>
              <p className="eyebrow">THE PLACES BEHIND THE DISHES</p>
              <h2 id="directory-heading">Restaurant directory</h2>
            </div>
            <Button
              variant="link"
              aria-label="Refresh restaurant directory"
              onClick={() => setDirectoryRefresh((x) => x + 1)}
              disabled={directoryLoading}
            >
              Refresh ↻
            </Button>
          </header>
          <Form
            className="admin-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              setQuery(draft.trim());
              setPage(1);
              setDirectoryRefresh((x) => x + 1);
            }}
          >
            <Form.Control
              aria-label="Search restaurant directory"
              placeholder="Search by name or address…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button variant="outline-primary" type="submit">
              Search
            </Button>
          </Form>
          <div className="admin-directory-results" aria-busy={directoryLoading}>
            {directoryError ? (
              <Alert variant="danger">
                {directoryError}
                <Button
                  variant="link"
                  onClick={() => setDirectoryRefresh((x) => x + 1)}
                >
                  Retry directory
                </Button>
              </Alert>
            ) : directoryLoading ? (
              <div className="admin-list-state" role="status">
                <Spinner animation="border" size="sm" />
                <span>Loading restaurants…</span>
              </div>
            ) : !directory.restaurants.length ? (
              <div className="admin-list-state">
                <h3>No restaurants found</h3>
                <p>Try a different name or address.</p>
                {query && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setQuery("");
                      setDraft("");
                      setPage(1);
                    }}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <ul className="admin-place-list">
                {directory.restaurants.map((restaurant) => (
                  <li key={restaurant._id}>
                    <span className="admin-place-icon" aria-hidden="true">
                      ⌂
                    </span>
                    <div>
                      <h3>
                        <Link to={`/restaurants/${restaurant._id}`}>
                          {restaurant.name}
                        </Link>
                      </h3>
                      <p>{restaurant.address || "Address not provided"}</p>
                    </div>
                    <Link
                      className="admin-view-link"
                      to={`/restaurants/${restaurant._id}`}
                      aria-label={`View ${restaurant.name}`}
                    >
                      View <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {!directoryLoading && !directoryError && directory.total > 0 && (
            <nav
              className="admin-list-footer"
              aria-label="Restaurant directory pagination"
            >
              <p aria-live="polite">
                {(page - 1) * 6 + 1}–{Math.min(page * 6, directory.total)} of{" "}
                {directory.total} restaurants
              </p>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((x) => x - 1)}
                  aria-label="Previous restaurant page"
                >
                  ←
                </Button>
                <span>
                  Page {page} of {directory.totalPages}
                </span>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={page >= directory.totalPages}
                  onClick={() => setPage((x) => x + 1)}
                  aria-label="Next restaurant page"
                >
                  →
                </Button>
              </div>
            </nav>
          )}
        </section>
        <aside>
          <section className="admin-add-panel">
            <p className="eyebrow">GROW THE DIRECTORY</p>
            <h2>Add a restaurant</h2>
            <p className="text-muted small">
              Found somewhere worth sharing? Give it a place in the catalog.
            </p>
            {formError && <Alert variant="danger">{formError}</Alert>}
            {added && (
              <Alert variant="success">
                <strong>{added.name || "Restaurant"} added.</strong>
                {added._id && (
                  <Link className="d-block" to={`/restaurants/${added._id}`}>
                    View restaurant →
                  </Link>
                )}
              </Alert>
            )}
            <Form onSubmit={submit}>
              <Form.Group controlId="restaurant-name" className="mb-3">
                <Form.Label>Restaurant name</Form.Label>
                <Form.Control
                  required
                  maxLength={150}
                  disabled={saving}
                  placeholder="e.g. Dosa House"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="restaurant-address" className="mb-4">
                <Form.Label>Full address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  required
                  maxLength={500}
                  disabled={saving}
                  placeholder="Street address, city, state, postal code"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
                <Form.Text>
                  Include the city so people can find it in their city searches.
                </Form.Text>
              </Form.Group>
              <Button className="w-100" type="submit" disabled={saving}>
                {saving ? "Adding restaurant…" : "+ Add restaurant"}
              </Button>
              <p className="admin-publish-note">
                This adds a restaurant to the shared catalog.
              </p>
            </Form>
          </section>
          <div className="admin-catalog-note">
            <span aria-hidden="true">✳</span>
            <div>
              <h3>Start with a dish</h3>
              <p>
                Adding a new dish? Choose an existing restaurant to connect the
                two.
              </p>
              <Link to="/add-dish">Add a dish →</Link>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
