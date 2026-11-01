import React, { useContext } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
export default function NavigationBar() {
  const { user, token, logout } = useContext(AuthContext);
  return (
    <Navbar expand="lg" className="site-nav" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand">
          <span className="brand-mark">f.</span> FoodMaster
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} eventKey="dishes" to="/dishes">
              Discover dishes
            </Nav.Link>
            <Nav.Link as={NavLink} eventKey="restaurants" to="/restaurants">
              Restaurants
            </Nav.Link>
          </Nav>
          <Nav className="align-items-lg-center gap-2">
            {token ? (
              <>
                <Nav.Link as={NavLink} eventKey="add-dish" to="/add-dish">
                  Add a dish
                </Nav.Link>
                {user?.isAdmin && (
                  <Nav.Link as={NavLink} eventKey="admin" to="/admin">
                    Admin
                  </Nav.Link>
                )}
                <Nav.Link
                  as={NavLink}
                  eventKey="profile"
                  to="/profile"
                  className="user-chip"
                  aria-label="My profile"
                >
                  <span aria-hidden="true">
                    {(user?.displayName ||
                      user?.username)?.[0]?.toUpperCase() || "U"}
                  </span>
                  {user?.displayName || user?.username}
                </Nav.Link>
                <Button variant="outline-primary" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} eventKey="login" to="/login">
                  Sign in
                </Nav.Link>
                <Button as={Link} to="/register">
                  Join the table
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
