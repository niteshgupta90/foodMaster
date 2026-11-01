import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PasswordFields from "../components/PasswordFields";
export default function ProfilePage() {
  const navigate = useNavigate();
  const { updateUser, clearSession } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    api
      .get("/auth/me", { signal: abort.signal })
      .then((res) => setProfile(res.data.user))
      .catch((err) => {
        if (!abort.signal.aborted)
          setError(
            "Unable to load your profile. Please refresh or sign in again.",
          );
      });
    return () => abort.abort();
  }, []);
  async function save(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const { displayName, city, bio, preference } = profile;
      const { data } = await api.patch("/auth/me", {
        displayName,
        city,
        bio,
        preference,
      });
      setProfile(data.user);
      updateUser(data.user);
      setMessage("Your profile has been saved.");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }
  async function changePassword(event) {
    event.preventDefault();
    setPasswordError("");
    if (password !== confirmation) {
      setPasswordError("The passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await api.post("/auth/change-password", { currentPassword, password });
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
      clearSession();
      navigate("/login", { replace: true, state: { passwordChanged: true } });
    } catch (err) {
      setPasswordError(
        err.response?.data?.msg || "Unable to change your password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  if (!profile)
    return (
      <Container className="account-card">
        {error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <div role="status">
            <Spinner animation="border" />
            <p>Loading your profile…</p>
          </div>
        )}
      </Container>
    );
  const field = (key, value) => setProfile({ ...profile, [key]: value });
  return (
    <Container className="profile-page">
      <header className="page-intro">
        <p className="eyebrow">YOUR PLACE AT THE TABLE</p>
        <h1>My profile</h1>
        <p>
          Make yourself at home. Update your details and manage your account.
        </p>
      </header>
      <Row className="g-4">
        <Col lg={7}>
          <section className="profile-section">
            <h2>About you</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Form onSubmit={save}>
              <Form.Group controlId="profile-display-name" className="mb-3">
                <Form.Label>Display name</Form.Label>
                <Form.Control
                  maxLength={100}
                  autoComplete="name"
                  value={profile.displayName || ""}
                  onChange={(e) => field("displayName", e.target.value)}
                />
                <Form.Text>
                  Used in your account navigation. Your existing username stays
                  attached to reviews.
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="profile-city" className="mb-3">
                <Form.Label>City (optional)</Form.Label>
                <Form.Control
                  autoComplete="address-level2"
                  maxLength={100}
                  value={profile.city || ""}
                  onChange={(e) => field("city", e.target.value)}
                />
                <Form.Text>
                  For your profile; this doesn’t change dish-search filters.
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="profile-preference" className="mb-3">
                <Form.Label>Dietary preference</Form.Label>
                <Form.Select
                  value={profile.preference || "none"}
                  onChange={(e) => field("preference", e.target.value)}
                >
                  <option value="none">No preference</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="profile-bio" className="mb-4">
                <Form.Label>A little about you (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  maxLength={300}
                  value={profile.bio || ""}
                  onChange={(e) => field("bio", e.target.value)}
                  placeholder="Your favorite flavors, dishes, or food discoveries…"
                />
                <Form.Text>
                  {(profile.bio || "").length}/300 · Saved to your account; no
                  public profile is published.
                </Form.Text>
              </Form.Group>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </Form>
          </section>
        </Col>
        <Col lg={5}>
          <section className="profile-section mb-4">
            <h2>Account details</h2>
            <dl className="account-details">
              <dt>Username</dt>
              <dd>{profile.username}</dd>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
              <dt>Account type</dt>
              <dd>{profile.isAdmin ? "Administrator" : "Community member"}</dd>
              {profile.createdAt && (
                <>
                  <dt>Member since</dt>
                  <dd>
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </>
              )}
            </dl>
            <p className="small text-muted">
              Account email and role are read-only.
            </p>
          </section>
          <section className="profile-section">
            <h2>Change password</h2>
            <p className="small text-muted">
              Changing your password signs out your existing sessions.
            </p>
            {passwordError && <Alert variant="danger">{passwordError}</Alert>}
            <Form onSubmit={changePassword}>
              <Form.Group controlId="profile-current-password" className="mb-3">
                <Form.Label>Current password</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Form.Group>
              <PasswordFields
                password={password}
                confirmation={confirmation}
                onPassword={setPassword}
                onConfirmation={setConfirmation}
                prefix="profile"
              />
              <Button
                variant="outline-primary"
                type="submit"
                disabled={passwordSaving}
              >
                {passwordSaving ? "Updating…" : "Change password"}
              </Button>
            </Form>
          </section>
        </Col>
      </Row>
    </Container>
  );
}
