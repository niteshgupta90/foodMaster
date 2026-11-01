// src/pages/RegisterPage.js
import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import "../styles/App.css"; // Ensure this file includes .content-container

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preference, setPreference] = useState("vegetarian");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await axios.post("/auth/register", {
        username,
        email,
        password,
        preference,
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Registration failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="account-card sign-up-card">
      <h1>Join the table</h1>
      {error && (
        <p role="alert" className="alert alert-danger">
          {error}
        </p>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="registerUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="registerEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="registerPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            placeholder="At least 12 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="registerPreference">
          <Form.Label>Dietary Preference</Form.Label>
          <Form.Select
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
          >
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="none">None</option>
          </Form.Select>
        </Form.Group>

        <Button disabled={saving} variant="primary" type="submit">
          Register
        </Button>
      </Form>
    </Container>
  );
}

export default RegisterPage;
