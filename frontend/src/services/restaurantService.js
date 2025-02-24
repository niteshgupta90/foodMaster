// src/services/restaurantService.js
import api from './api';

export const getAllRestaurants = async () => {
  const res = await api.get('/restaurants');
  return res.data;
};

export const createRestaurant = async (data) => {
  const res = await api.post('/restaurants', data);
  return res.data;
};
