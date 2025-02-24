// src/pages/RestaurantListPage.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, FloatingLabel } from 'react-bootstrap';
import axios from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
// import geocodeAddress from '../utils/mapboxGeocoding'; // example path
import '../styles/App.css'; // Ensure this file includes .content-container

function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');  // NEW: for the search input
//   const [locationInput, setLocationInput] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

//   const handleFindNearby = () => {
//     if ('geolocation' in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const userLat = position.coords.latitude;
//           const userLon = position.coords.longitude;
          
//           // Call backend
//           const res = await axios.get(`/restaurants/near?lat=${userLat}&lon=${userLon}`);
//           setRestaurants(res.data);
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//           alert('Unable to retrieve your location.');
//         }
//       );
//     } else {
//       alert('Geolocation is not available in your browser.');
//     }
//   };

//   const handleSearch = async () => {
//     // 1. Call a geocoding service to get lat/lon for locationInput
//     const { lat, lon } = await geocodeAddress(locationInput);

//     // 2. Then call your /restaurants/near
//     const res = await axios.get(`/restaurants/near?lat=${lat}&lon=${lon}`);
//     setRestaurants(res.data);
//   };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('/restaurants');
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter restaurants by name or address (or any field you like)
  const filteredRestaurants = restaurants.filter((rest) =>
    rest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rest.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="mt-4 content-container">
      <h2 className="text-center mb-4">Nearby Restaurants</h2>
      
      {/* Centered Search Input using FloatingLabel */}
      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <FloatingLabel 
            controlId="searchRestaurants" 
            label="Search by name or address..."
          >
            <Form.Control
              type="text"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FloatingLabel>
        </Col>
      </Row>

      {/* Responsive Grid for Restaurant Cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredRestaurants.map((rest) => (
          <Col key={rest._id}>
            <RestaurantCard restaurant={rest} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default RestaurantListPage;
