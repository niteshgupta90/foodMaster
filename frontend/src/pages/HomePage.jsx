import React from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import { imageUrl } from "../services/api";
export default function HomePage() {
  return (
    <Container className="home-page">
      <section className="home-hero">
        <div>
          <p className="eyebrow">A DISH WORTH DISCOVERING</p>
          <h1>
            Find your next
            <br />
            <em>favorite bite.</em>
          </h1>
          <p className="hero-copy">
            Start with what you’re craving. Discover dishes, explore local
            restaurants, and find recommendations from fellow food lovers.
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <Button as={Link} to="/dishes" size="lg">
              Explore dishes ↗
            </Button>
            <Button
              as={Link}
              to="/restaurants"
              variant="outline-primary"
              size="lg"
            >
              Browse restaurants
            </Button>
          </div>
          <p className="small text-muted mt-4">
            Discover by cuisine · Find a restaurant · Share your experience
          </p>
        </div>
        <div className="hero-photo">
          <img
            src={imageUrl("/uploads/masala dosa.webp")}
            alt="Crisp masala dosa served with chutney"
          />
          <span className="photo-caption">
            Big cravings. Local discoveries.
          </span>
        </div>
      </section>
      <section className="home-steps">
        <div>
          <span>01 / DISCOVER</span>
          <h2>Follow your craving</h2>
          <p>Explore dishes by cuisine, price, and dietary preferences.</p>
        </div>
        <div>
          <span>02 / EXPLORE</span>
          <h2>Find a place to try it</h2>
          <p>
            See restaurants serving your favorites and compare community
            reviews.
          </p>
        </div>
        <div>
          <span>03 / SHARE</span>
          <h2>Make your bite count</h2>
          <p>
            Rate a dish at a restaurant and help the next person find something
            great.
          </p>
        </div>
      </section>
    </Container>
  );
}
