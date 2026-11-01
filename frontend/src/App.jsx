// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RestaurantListPage from "./pages/RestaurantListPage";
import DishListPage from "./pages/DishListPage";
import DishDetailPage from "./pages/DishDetailPage"; // NEW
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import AddDishPage from "./pages/AddDishPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Link, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import AdminPage from "./pages/AdminPage"; // Import AdminPage
import DishReviewsPage from "./pages/DishReviewsPage";

import "./styles/refresh.css";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function App() {
  return (
    <Router>
      {/* Wrap everything in AuthProvider */}
      <AuthProvider>
        <ScrollToTop />

        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <NavigationBar />
        <main id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurants" element={<RestaurantListPage />} />
            <Route path="/dishes" element={<DishListPage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
            {/* Dish Detail route */}
            <Route path="/dishes/:id" element={<DishDetailPage />} />
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminPage />} />{" "}
            {/* Add AdminPage route */}
            <Route
              path="*"
              element={
                <div className="container empty-state">
                  <h1>Page not found</h1>
                  <Link to="/dishes">Explore dishes</Link>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="site-footer">
          <div className="container">
            <span className="fw-bold">FoodMaster</span>
            <span>Good food starts with a great dish.</span>
            <Link to="/dishes">Find your next favorite →</Link>
          </div>
        </footer>
      </AuthProvider>
    </Router>
  );
}

export default App;
