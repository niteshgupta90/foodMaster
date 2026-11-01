// src/pages/LoginPage.js
import React, { useState, useContext } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "../services/api";
import "../styles/App.css"; // Ensure this file includes .content-container

function LoginPage() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await axios.post("/auth/login", { email, password });
      // Use AuthContext's login() method
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="account-card sign-in-card">
      <h1>Welcome back</h1>
      {location.state?.passwordChanged && (
        <p role="status" className="alert alert-success">
          Password changed. Sign in with your new password.
        </p>
      )}
      {error && (
        <p role="alert" className="alert alert-danger">
          {error}
        </p>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="loginEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="loginPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Link to="/forgot-password" className="d-block mb-4">
          Forgot password?
        </Link>
        <Button disabled={saving} variant="primary" type="submit">
          Log In
        </Button>
      </Form>
    </Container>
  );
}

export default LoginPage;
