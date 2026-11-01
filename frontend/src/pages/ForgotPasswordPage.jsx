import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import api from "../services/api";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setMessage(data.msg);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Unable to request a reset link. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Container className="account-card">
      <p className="eyebrow">LET’S GET YOU BACK IN</p>
      <h1>Forgot your password?</h1>
      <p className="text-muted">
        Enter your account email to request a password-reset link.
      </p>
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      <Form onSubmit={submit}>
        <Form.Group controlId="reset-email" className="mb-4">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Button className="w-100" disabled={saving} type="submit">
          {saving ? "Requesting link…" : "Send reset link"}
        </Button>
      </Form>
      <Link className="d-block mt-4" to="/login">
        ← Back to sign in
      </Link>
    </Container>
  );
}
