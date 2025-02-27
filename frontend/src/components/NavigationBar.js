// src/components/NavigationBar.js
import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/NavigationBar.css';

function NavigationBar() {
  const { user, token, logout } = useContext(AuthContext);
  const location = useLocation();

  // Determine active link based on current path
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <Navbar expand="lg" fixed="top" className="custom-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="custom-navbar-brand">
          FoodMaster
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {/* <Nav.Link
              as={Link}
              to="/restaurants"
              className={`custom-nav-link ${isActive('/restaurants') ? 'active-link' : ''}`}
            >
              Restaurants
            </Nav.Link> */}
            {/* <Nav.Link
              as={Link}
              to="/dishes"
              className={`custom-nav-link ${isActive('/dishes') ? 'active-link' : ''}`}
            >
              Dishes
            </Nav.Link> */}
          </Nav>
          <Nav className="ms-auto align-items-center">
            {!token ? (
              <>
                <Button
                  variant="outline-light"
                  as={Link}
                  to="/login"
                  className="custom-btn me-2"
                >
                  Login
                </Button>
                <Button
                  variant="outline-light"
                  as={Link}
                  to="/register"
                  className="custom-btn"
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                <span className="navbar-text me-3">
                  Welcome, {user?.username || 'User'}!
                </span>
                <Button variant="outline-light" onClick={logout} className="custom-btn">
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
