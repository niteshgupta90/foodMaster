// src/pages/HomePage.js
import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const backgroundImageUrl = `${backendUrl}/uploads/background-cake.jpg`;

    const navigate = useNavigate();

    // When the user clicks "Get Started," navigate to the dishes page.
    const handleGetStarted = () => {
        navigate('/dishes');
    };

  return (
    <>
      {/* HERO SECTION */}
      <div 
        className="hero-section d-flex align-items-center justify-content-center"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <div className="hero-overlay text-center">
          <h1>Welcome to FoodMaster</h1>
          <p>Discover the best dishes for your dietary preferences!</p>
          <Button variant="primary" size="lg" className="mt-3" onClick={handleGetStarted}>
            Get Started
          </Button>
        </div>
      </div>

      {/* FEATURES / HIGHLIGHTS */}
      <Container className="mt-5 mb-5 features-section text-center">
        <Row>
          <Col>
            <h2>Why FoodMaster?</h2>
            <p>
              We help you find the top vegetarian and Indian dishes around you effortlessly.
            </p>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col md={4} className="mb-4">
            <Card className="feature-card h-100 shadow-sm">
              <Card.Body className="text-center">
                <Card.Title>Top Dishes</Card.Title>
                <Card.Text>
                  Explore a curated list of the most popular dishes with recommended restaurants.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="feature-card h-100 shadow-sm">
              <Card.Body className="text-center">
                <Card.Title>Personalized Reviews</Card.Title>
                <Card.Text>
                  Read and write reviews to help others discover the best culinary experiences.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="feature-card h-100 shadow-sm">
              <Card.Body className="text-center">
                <Card.Title>Local Discovery</Card.Title>
                <Card.Text>
                  Search by location to find top-rated restaurants and dishes in your area.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ADDITIONAL INFO */}
      <Container className="mb-5 info-section">
        <Row>
          <Col md={6} className="text-center text-md-start mb-4 mb-md-0">
            <h3>How It Works</h3>
            <p>
              1. Search for your favorite city or let us detect your location.<br />
              2. Browse the top dishes and recommended restaurants.<br />
              3. Read and add reviews to share your experiences.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-start">
            <h3>Our Mission</h3>
            <p>
              At FoodMaster, our mission is to simplify dining decisions by curating the best dishes for your dietary needs, ensuring you always have great food recommendations at your fingertips.
            </p>
          </Col>
        </Row>
      </Container>

      {/* FOOTER */}
      <footer className="footer">
        <Container>
            <Row>
            <Col md={6} className="text-center">
                <div className="d-flex flex-column align-items-center">
                <h5 className="mb-2">Contact Us</h5>
                <div className="d-flex flex-column align-items-center">
                    <a href="mailto:support@foodmaster.com" className="mb-1" style={{ color: '#fff' }}>
                    support@foodmaster.com
                    </a>
                    <span style={{ color: '#fff' }}>(123) 456-7890</span>
                </div>
                </div>
            </Col>
            <Col md={6} className="text-center">
                <div className="d-flex flex-column align-items-center">
                <h5 className="mb-2">Follow Us</h5>
                <div className="d-flex">
                    <a href="/" className="me-3" style={{ color: '#fff' }}>Facebook</a>
                    <a href="/" className="me-3" style={{ color: '#fff' }}>Instagram</a>
                    <a href="/" style={{ color: '#fff' }}>Twitter</a>
                </div>
                </div>
            </Col>
            </Row>
            <Row className="mt-3">
            <Col>
                <hr className="footer-hr" />
                <p className="text-center mb-0">
                &copy; {new Date().getFullYear()} FoodMaster. All Rights Reserved.
                </p>
            </Col>
            </Row>
        </Container>
        </footer>
    </>
  );
}

export default HomePage;
