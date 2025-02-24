// src/services/dishService.js
import api from './api';

export const getDishes = async (restaurantId) => {
  const res = await api.get(`/dishes?restaurantId=${restaurantId || ''}`);
  return res.data;
};

export const createDish = async (data) => {
  const res = await api.post('/dishes', data);
  return res.data;
};
