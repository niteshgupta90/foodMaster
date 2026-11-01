import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Form, Button } from "react-bootstrap";
export const emptyFilters = {
  city: "",
  distance: "",
  cuisineType: [],
  priceTier: [],
  rating: "",
  dietary: { isVegetarian: false, isVegan: false, isGlutenFree: false },
};
export default function DishFilters({ filters, onFilterChange }) {
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState(null);
  useEffect(() => {
    api
      .get("/dishes/options")
      .then((res) => setOptions(res.data))
      .catch(() => setOptions({ cuisines: [], dietary: false }));
  }, []);
  const change = (key, value) => onFilterChange({ ...filters, [key]: value });
  const checks = (key, values) =>
    values.map((value) => (
      <Form.Check
        key={value}
        id={`${key}-${value}`}
        label={value}
        checked={filters[key].includes(value)}
        onChange={(e) =>
          change(
            key,
            e.target.checked
              ? [...filters[key], value]
              : filters[key].filter((x) => x !== value),
          )
        }
      />
    ));
  return (
    <aside
      className={`filter-panel ${expanded ? "filters-expanded" : "filters-collapsed"}`}
    >
      <div className="d-flex justify-content-between align-items-center">
        <h2>Refine your craving</h2>
        <Button
          className="filter-toggle"
          variant="outline-primary"
          size="sm"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide filters" : "Show filters"}
        </Button>
        <Button variant="link" onClick={() => onFilterChange(emptyFilters)}>
          Reset
        </Button>
      </div>
      <div className="filter-content">
        <Form.Group controlId="filter-city">
          <Form.Label>City</Form.Label>
          <Form.Select
            value={filters.city}
            onChange={(e) => change("city", e.target.value)}
          >
            <option value="">All cities</option>
            {["Seattle", "Bellevue", "Bothell", "Redmond"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <fieldset>
          <legend>Cuisine</legend>
          {options?.cuisines?.length ? (
            checks("cuisineType", options.cuisines)
          ) : (
            <p className="small text-muted">
              Cuisine labels haven’t been added to this collection yet.
            </p>
          )}
        </fieldset>
        <fieldset>
          <legend>Price range</legend>
          <div className="price-checks">
            {checks("priceTier", ["$", "$$", "$$$", "$$$$"])}
          </div>
        </fieldset>
        <fieldset>
          <legend>Dietary preferences</legend>
          <p className="small text-muted">
            Older entries may be missing dietary labels. Confirm ingredients
            with the restaurant.
          </p>
          {(options?.dietary
            ? [
                ["isVegetarian", "Vegetarian"],
                ["isVegan", "Vegan"],
                ["isGlutenFree", "Gluten free"],
              ]
            : []
          ).map(([key, label]) => (
            <Form.Check
              id={key}
              key={key}
              label={label}
              checked={filters.dietary[key]}
              onChange={(e) =>
                change("dietary", {
                  ...filters.dietary,
                  [key]: e.target.checked,
                })
              }
            />
          ))}
        </fieldset>
        <Form.Group controlId="filter-rating">
          <Form.Label>Minimum rating</Form.Label>
          <Form.Select
            value={filters.rating}
            onChange={(e) => change("rating", e.target.value)}
          >
            <option value="">Any rating</option>
            <option value="4">4 stars & up</option>
            <option value="3">3 stars & up</option>
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="filter-distance">
          <Form.Label>Distance</Form.Label>
          <Form.Select
            value={filters.distance}
            onChange={(e) => change("distance", e.target.value)}
          >
            <option value="">Any distance</option>
            {[1, 5, 10, 25].map((x) => (
              <option key={x} value={x}>
                Within {x} {x === 1 ? "mile" : "miles"}
              </option>
            ))}
          </Form.Select>
          <Form.Text>Uses your location only when selected.</Form.Text>
        </Form.Group>
      </div>
    </aside>
  );
}
