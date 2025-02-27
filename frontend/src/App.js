// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantListPage from './pages/RestaurantListPage';
import DishListPage from './pages/DishListPage';
import DishDetailPage from './pages/DishDetailPage'; // NEW
import AddDishPage from './pages/AddDishPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import AdminPage from './pages/AdminPage'; // Import AdminPage
import DishReviewsPage from './pages/DishReviewsPage';

function App() {
  return (
    <Router>
      {/* Wrap everything in AuthProvider */}
      <AuthProvider>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantListPage />} />
          <Route path="/dishes" element={<DishListPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />

          {/* Dish Detail route */}
          <Route path="/dishes/:dishId" element={<DishDetailPage />} />
          <Route path="/dish-reviews" element={<DishReviewsPage />} />

          {/* Protected route to add dish */}
          <Route
            path="/add-dish"
            element={
              <ProtectedRoute>
                <AddDishPage />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} /> {/* Add AdminPage route */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
