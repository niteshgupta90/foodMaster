const validateDishFilters = (req, res, next) => {
  const { distance, lat, lng, cuisineType, priceTier, page, limit } = req.query;
  
  // Validate distance and coordinates
  if (distance) {
    if (isNaN(distance) || distance < 0) {
      return res.status(400).json({ error: 'Invalid distance value' });
    }
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid coordinates required for distance filter' });
    }
  }

// Validate priceTier (single or array)
if (priceTier) {
    if (Array.isArray(priceTier)) {
      // If it’s an array, validate each item
      for (const pt of priceTier) {
        if (!['$', '$$', '$$$', '$$$$'].includes(pt)) {
          return res.status(400).json({ error: 'Invalid price range' });
        }
      }
    } else {
      // Otherwise, a single string
      if (!['$', '$$', '$$$', '$$$$'].includes(priceTier)) {
        return res.status(400).json({ error: 'Invalid price range' });
      }
    }
  }

  // Validate pagination
  req.query.page = parseInt(page) || 1;
  req.query.limit = parseInt(limit) || 21;

  next();
};

module.exports = validateDishFilters;