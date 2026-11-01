require('dotenv').config();
const mongoose = require('mongoose');
const Dish = require('./models/Dish'); // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI;

async function updateDishImages() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Fetch all dishes
  const dishes = await Dish.find({});
  console.log(`Found ${dishes.length} dishes`);

  for (const dish of dishes) {
    let updated = false;
    // Check if dish has images
    if (dish.images && dish.images.length > 0) {
      // Map through images array and update URL if needed
      dish.images = dish.images.map(img => {
        if (img.url && img.url.includes('http://localhost:5001')) {
          updated = true;
          img.url = img.url.replace('http://localhost:5001', 'https://foodmaster-zwim.onrender.com');
        }
        return img;
      });
    }

    if (updated) {
      await dish.save();
      console.log(`Updated dish: ${dish.name}`);
    }
  }

  console.log('Finished updating dish images.');
  process.exit(0);
}

updateDishImages().catch(err => {
  console.error(err);
  process.exit(1);
});
