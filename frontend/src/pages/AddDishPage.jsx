// src/pages/AddDishPage.js
import React, { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";

function AddDishPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [name, setName] = useState("");
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [price, setPrice] = useState("");
  const [cuisineType, setCuisineType] = useState("Indian");
  const [priceTier, setPriceTier] = useState("$");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("/restaurants", { params: { limit: 100 } });
      setRestaurants(res.data.restaurants);
      // If you want to pre-select the first restaurant:
      // setSelectedRestaurant(res.data[0]?._id || '');
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load restaurants");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.post("/dishes", {
        restaurant: selectedRestaurant,
        name,
        isVegetarian,
        price,
        cuisineType,
        priceTier,
      });

      navigate("/dishes");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Failed to add dish");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "600px" }}>
      <h1>Add a dish</h1>
      {error && (
        <p role="alert" className="alert alert-danger">
          {error}
        </p>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="dish-restaurant" className="mb-3">
          <Form.Label>Restaurant</Form.Label>
          <Form.Select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            required
          >
            <option value="">Select a Restaurant</option>
            {restaurants.map((rest) => (
              <option key={rest._id} value={rest._id}>
                {rest.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="dish-name" className="mb-3">
          <Form.Label>Dish Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. Paneer Tikka"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="dish-vegetarian" className="mb-3">
          <Form.Check
            type="checkbox"
            label="Is Vegetarian?"
            checked={isVegetarian}
            onChange={(e) => setIsVegetarian(e.target.checked)}
          />
        </Form.Group>

        <Form.Group controlId="dish-price" className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="Dish price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="dish-cuisine" className="mb-3">
          <Form.Label>Cuisine</Form.Label>
          <Form.Select
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
          >
            {[
              "Indian",
              "Chinese",
              "Italian",
              "Thai",
              "Mexican",
              "Japanese",
              "American",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="dish-tier" className="mb-3">
          <Form.Label>Price range</Form.Label>
          <Form.Select
            value={priceTier}
            onChange={(e) => setPriceTier(e.target.value)}
          >
            {["$", "$$", "$$$", "$$$$"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button disabled={saving} variant="primary" type="submit">
          Add Dish
        </Button>
      </Form>
    </Container>
  );
}

export default AddDishPage;
