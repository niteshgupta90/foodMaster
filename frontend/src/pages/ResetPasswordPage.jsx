import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import api from "../services/api";
import PasswordFields from "../components/PasswordFields";
import { AuthContext } from "../context/AuthContext";
export default function ResetPasswordPage() {
  const [token] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get("token") || "",
  );
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { clearSession } = useContext(AuthContext);
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      clearSession();
      setSuccess(true);
      setPassword("");
      setConfirmation("");
      window.history.replaceState(null, "", window.location.pathname);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Unable to reset your password. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Container className="account-card">
      <p className="eyebrow">A FRESH START</p>
      <h1>Reset your password</h1>
      {success ? (
        <>
          <Alert variant="success">
            Your password has been reset. Previous account sessions have been
            signed out.
          </Alert>
          <Link className="btn btn-primary w-100" to="/login">
            Sign in with your new password
          </Link>
        </>
      ) : !/^[a-f0-9]{64}$/.test(token) ? (
        <>
          <Alert variant="warning">
            This reset link is missing or invalid.
          </Alert>
          <Link to="/forgot-password">Request a new reset link</Link>
        </>
      ) : (
        <>
          <p className="text-muted">
            Choose a new password for your account. Your reset link expires
            after 15 minutes and works only once.
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={submit}>
            <PasswordFields
              password={password}
              confirmation={confirmation}
              onPassword={setPassword}
              onConfirmation={setConfirmation}
              prefix="reset"
            />
            <Button className="w-100" type="submit" disabled={saving}>
              {saving ? "Updating password…" : "Reset password"}
            </Button>
          </Form>
          <Link className="d-block mt-4" to="/login">
            Back to sign in
          </Link>
        </>
      )}
    </Container>
  );
}
