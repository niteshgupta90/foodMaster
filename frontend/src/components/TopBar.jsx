// src/components/TopBar.js
import React from "react";
import { Navbar } from "react-bootstrap";

function TopBar({ city }) {
  return (
    <Navbar bg="light" className="justify-content-center">
      <Navbar.Text>Location: {city || "Unknown"}</Navbar.Text>
    </Navbar>
  );
}

export default TopBar;
