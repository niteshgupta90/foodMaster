// updateDishesWithDetails.js
require('dotenv').config();
const mongoose = require('mongoose');
const Dish = require('./models/Dish');

// If you're storing the dish data in a separate JSON file, you can require it
// but for simplicity, we'll paste the array directly here:
const dishData = [
    {
      "name": "Chole Bhature",
      "description": "A popular North Indian dish made with chickpeas and fried bread.",
      "price": 11.99,
      "priceTier": "$$",
      "origin": "North India",
      "recipe": "Soak chickpeas overnight; cook with onion, tomato, and spices; serve with deep-fried Bhature bread."
    },
    {
      "name": "Paneer Butter Masala",
      "description": "Cottage cheese cubes in a creamy tomato-based gravy.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "North India",
      "recipe": "Marinate paneer; prepare a tomato-butter gravy with spices and cream; simmer paneer until fully coated."
    },
    {
      "name": "Masala Dosa",
      "description": "A South Indian crepe made from rice batter and lentils, filled with spiced potatoes.",
      "price": 10.99,
      "priceTier": "$$",
      "origin": "South India",
      "recipe": "Ferment rice and urad dal batter; spread thin on a hot griddle; fill with potato masala; fold and serve."
    },
    {
      "name": "Palak Paneer",
      "description": "Cottage cheese cubes in a creamy spinach gravy.",
      "price": 14.99,
      "priceTier": "$$",
      "origin": "North India",
      "recipe": "Blanch spinach; purée with spices; simmer with paneer cubes and finish with cream or butter."
    },
    {
      "name": "Rajma Chawal",
      "description": "Kidney beans cooked in spiced gravy, served with rice.",
      "price": 8.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Soak kidney beans; cook with onion, tomato, and spices; serve hot with steamed rice."
    },
    {
      "name": "Pav Bhaji",
      "description": "A spicy blend of mixed vegetables served with buttered bread.",
      "price": 8.99,
      "priceTier": "$",
      "origin": "Maharashtra, India",
      "recipe": "Boil and mash veggies; sauté with bhaji masala; top with butter; serve with toasted pav bread."
    },
    {
      "name": "Vada Pav",
      "description": "A spicy potato fritter served in a bun.",
      "price": 8.99,
      "priceTier": "$",
      "origin": "Maharashtra, India",
      "recipe": "Spiced potato ball dipped in batter and deep-fried; place inside a pav bun with chutneys."
    },
    {
      "name": "Pani Puri",
      "description": "Hollow puri filled with spicy, tangy tamarind water.",
      "price": 6.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Prepare crispy puri; mix tangy water with spices; fill puri with potato or chickpea, add flavored water."
    },
    {
      "name": "Aloo Tikki Chaat",
      "description": "Fried potato patties served with yogurt, chutney, and spices.",
      "price": 9.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Mash spiced potatoes; shape into patties and fry; top with yogurt, chutneys, onions, and chaat masala."
    },
    {
      "name": "Dhokla",
      "description": "Steamed fermented rice and chickpea flour cake.",
      "price": 8.99,
      "priceTier": "$",
      "origin": "Gujarat, India",
      "recipe": "Ferment a batter of besan (chickpea flour) and rice; steam; temper with mustard seeds and curry leaves."
    },
    {
      "name": "Aloo Paratha",
      "description": "Whole wheat bread stuffed with spiced potatoes.",
      "price": 8.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Roll wheat dough with a potato filling of spices; cook on a hot griddle with butter or ghee."
    },
    {
      "name": "Panner Burger",
      "description": "Cottage cheese patty in a burger bun with veggies and sauce.",
      "price": 8.99,
      "priceTier": "$",
      "origin": "Fusion / Modern Indian Cuisine",
      "recipe": "Marinate paneer patty; grill or fry; assemble with lettuce, tomato, sauce in a bun."
    },
    {
      "name": "Veggie Burger",
      "description": "Mixed vegetable patty in a burger bun with veggies and sauce.",
      "price": 8.99,
      "priceTier": "$",
      "origin": "Fusion / Western",
      "recipe": "Combine mashed vegetables, breadcrumbs, spices; shape and grill/fry; serve in a bun with condiments."
    },
    {
      "name": "Panner Tikka",
      "description": "Cottage cheese cubes marinated in spices and grilled.",
      "price": 11.99,
      "priceTier": "$$",
      "origin": "North India (Punjabi Cuisine)",
      "recipe": "Marinate paneer with yogurt and tikka spices; grill or bake until lightly charred."
    },
    {
      "name": "Butter Panner Pizza",
      "description": "Pizza topped with cottage cheese cubes and butter sauce.",
      "price": 16.99,
      "priceTier": "$$",
      "origin": "Fusion (Italian-Indian)",
      "recipe": "Spread butter masala sauce on pizza base; top with paneer cubes, cheese, and veggies; bake."
    },
    {
      "name": "Garlic Naan",
      "description": "Leavened bread topped with garlic and cilantro.",
      "price": 4.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Prepare naan dough with yeast/yogurt; top with garlic and coriander; bake in a tandoor or oven."
    },
    {
      "name": "Malai Kofta",
      "description": "Fried vegetable balls in a creamy tomato-based gravy.",
      "price": 17.99,
      "priceTier": "$$",
      "origin": "North India (Mughlai Cuisine)",
      "recipe": "Form veg/paneer balls; fry until golden; simmer in malai (cream) + tomato gravy with spices."
    },
    {
      "name": "Chilli Panner",
      "description": "Cottage cheese cubes in a spicy Indo-Chinese sauce.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "Indo-Chinese",
      "recipe": "Marinate and stir-fry paneer with soy sauce, chili sauce, onions, and peppers."
    },
    {
      "name": "Samosa Chaat",
      "description": "Crushed samosa topped with yogurt, chutney, and spices.",
      "price": 8.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Fry samosa; break into pieces; garnish with chutneys, yogurt, onions, sev, and chaat masala."
    },
    {
      "name": "Fried Rice",
      "description": "Stir-fried rice with vegetables and spices.",
      "price": 10.99,
      "priceTier": "$$",
      "origin": "East/Southeast Asia (adapted in Indian-Chinese)",
      "recipe": "Cook rice; stir-fry with mixed veggies, soy sauce, garlic, and optionally egg or paneer."
    },
    {
      "name": "Mutton Biryani",
      "description": "A fragrant rice dish layered with marinated mutton.",
      "price": 14.99,
      "priceTier": "$$",
      "origin": "Hyderabad / Mughlai",
      "recipe": "Marinate mutton in yogurt and spices; layer with partially cooked basmati rice; cook in dum."
    },
    {
      "name": "Butter Chicken",
      "description": "Chicken in a mildly spiced tomato-cream sauce, also known as Murgh Makhani.",
      "price": 14.99,
      "priceTier": "$$",
      "origin": "North India (Punjab)",
      "recipe": "Marinate chicken in yogurt and spices; cook in a rich tomato, butter, and cream gravy."
    },
    {
      "name": "Paneer Tikka Masala",
      "description": "Paneer tikka pieces simmered in a spicy and creamy masala gravy.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "North India (Punjabi)",
      "recipe": "Grill paneer tikka; prepare tomato-onion masala gravy with cream/butter; combine."
    },
    {
      "name": "Bhel Puri",
      "description": "A crunchy snack made with puffed rice, onions, tomatoes, and tangy chutneys.",
      "price": 6.99,
      "priceTier": "$",
      "origin": "Maharashtra, India",
      "recipe": "Mix puffed rice with chopped veggies, chutneys, sev; serve immediately to keep crisp."
    },
    {
      "name": "Tandoori Shrimp",
      "description": "Marinated shrimp cooked in a tandoor with spices.",
      "price": 15.99,
      "priceTier": "$$",
      "origin": "North Indian (Tandoori Cooking)",
      "recipe": "Marinate shrimp in yogurt, spices, lemon; skewer and roast in tandoor or oven until lightly charred."
    },
    {
      "name": "Lamb Rogan Josh",
      "description": "A slow-cooked lamb curry in a rich, aromatic gravy, typically from Kashmir.",
      "price": 16.99,
      "priceTier": "$$",
      "origin": "Kashmir, India",
      "recipe": "Sear lamb; simmer with Kashmiri chili, yogurt, and aromatic spices for a deep red gravy."
    },
    {
      "name": "Chicken Tikka Masala",
      "description": "Marinated chicken chunks in a spiced, creamy tomato sauce.",
      "price": 13.99,
      "priceTier": "$$",
      "origin": "North India / UK fusion",
      "recipe": "Marinate chicken in tikka spices; grill; finish in a tomato cream sauce with masala."
    },
    {
      "name": "Saag Paneer",
      "description": "Spinach (saag) curry cooked with paneer cubes in spices.",
      "price": 13.99,
      "priceTier": "$$",
      "origin": "North India (Punjab)",
      "recipe": "Blanch spinach with garlic and onion; purée; simmer with paneer and spices."
    },
    {
      "name": "Naan",
      "description": "A leavened, tandoor-baked flatbread that is soft and fluffy.",
      "price": 2.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Prepare dough with yeast or yogurt; shape and bake in a tandoor or hot oven."
    },
    {
      "name": "Chettinad Chicken",
      "description": "A hot and spicy chicken dish from the Chettinad region of Tamil Nadu.",
      "price": 14.99,
      "priceTier": "$$",
      "origin": "Chettinad, Tamil Nadu (South India)",
      "recipe": "Marinate chicken in a blend of ground spices, curry leaves, and coconut; cook until rich and aromatic."
    },
    {
      "name": "Mutton Chukka",
      "description": "A semi-dry mutton preparation with bold Chettinad spices.",
      "price": 15.99,
      "priceTier": "$$",
      "origin": "Chettinad region, Tamil Nadu",
      "recipe": "Slow-cook mutton with roasted spices, onion, and curry leaves; reduce until thick coating."
    },
    {
      "name": "Dosai",
      "description": "Another term for Dosa, a crispy fermented crepe from South India.",
      "price": 9.99,
      "priceTier": "$",
      "origin": "South India",
      "recipe": "Ferment rice+dal batter; ladle onto griddle in thin layer; cook until golden."
    },
    {
      "name": "Tandoori Chicken",
      "description": "Marinated chicken roasted in a tandoor, known for its smoky, charred flavor.",
      "price": 13.99,
      "priceTier": "$$",
      "origin": "Punjab, North India",
      "recipe": "Marinate chicken in yogurt, tandoori masala, and spices; cook in a hot tandoor oven."
    },
    {
      "name": "Dal Makhani",
      "description": "A creamy lentil dish made with black lentils, butter, and cream.",
      "price": 11.99,
      "priceTier": "$$",
      "origin": "Punjab, North India",
      "recipe": "Slow-cook black urad dal with butter, tomatoes, and spices; finish with cream."
    },
    {
      "name": "Veg Biryani",
      "description": "A fragrant rice dish with mixed vegetables and aromatic spices.",
      "price": 10.99,
      "priceTier": "$$",
      "origin": "Hyderabad / Mughlai (Veg adaptation)",
      "recipe": "Layer spiced veggies with partially cooked rice; dum-cook for a fragrant one-pot meal."
    },
    {
      "name": "Chana Masala",
      "description": "Spicy chickpea curry often served with bhatura or rice.",
      "price": 9.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Soak chickpeas; cook with onion-tomato gravy and chana masala spice."
    },
    {
      "name": "Roti",
      "description": "A whole wheat flatbread common across the Indian subcontinent.",
      "price": 1.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Knead atta (whole wheat flour) into dough; roll thin and cook on tawa."
    },
    {
      "name": "Bombay Sandwich",
      "description": "A toasted sandwich stuffed with veggies, chutney, and sometimes cheese.",
      "price": 5.99,
      "priceTier": "$",
      "origin": "Mumbai, Maharashtra",
      "recipe": "Spread green chutney on bread; layer with cucumbers, tomatoes, onions, beets; toast or grill."
    },
    {
      "name": "Sev Puri",
      "description": "A crunchy snack featuring puri, sev, onions, tomatoes, and tangy chutneys.",
      "price": 6.99,
      "priceTier": "$",
      "origin": "Maharashtra, India",
      "recipe": "Assemble small puris with boiled potatoes, chutneys, onions, tomatoes; top with sev."
    },
    {
      "name": "Jeera Rice",
      "description": "Cumin-flavored basmati rice, often served with dal or curries.",
      "price": 4.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Temper cumin seeds in ghee; stir in soaked basmati rice and water; cook until fluffy."
    },
    {
      "name": "Masala Chai",
      "description": "Spiced tea brewed with milk, sugar, and aromatic spices.",
      "price": 2.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Boil water with black tea, ginger, cardamom, etc.; add milk and sugar; simmer."
    },
    {
      "name": "Samosa",
      "description": "A triangular pastry filled with spiced potato or meat, deep-fried until golden.",
      "price": 2.99,
      "priceTier": "$",
      "origin": "South Asia / Middle East",
      "recipe": "Roll dough into cones; fill with mashed spiced potato (or meat); seal and deep fry."
    },
    {
      "name": "Lassi",
      "description": "A yogurt-based beverage, sweet or salted, often flavored with fruit or spices.",
      "price": 3.99,
      "priceTier": "$",
      "origin": "Punjab, North India",
      "recipe": "Blend yogurt with water/milk, sugar or salt, sometimes fruit (mango) or spices."
    },
    {
      "name": "Clay Pot Chicken Curry",
      "description": "Chicken curry slow-cooked in a clay pot for unique flavor.",
      "price": 14.99,
      "priceTier": "$$",
      "origin": "Various regions of India (Method influenced by earthenware cooking)",
      "recipe": "Marinate chicken; cook with spices in a clay pot to lock in moisture and aroma."
    },
    {
      "name": "Clay Pot Dal",
      "description": "Lentils cooked in a clay pot, absorbing earthen flavors.",
      "price": 9.99,
      "priceTier": "$",
      "origin": "Generic Indian Dal, earthenware method",
      "recipe": "Soak lentils; cook with onion, tomato, spices in a clay pot for a rustic taste."
    },
    {
      "name": "Steamed Rice",
      "description": "Plain white rice, steamed until fluffy.",
      "price": 2.99,
      "priceTier": "$",
      "origin": "Global / Basic staple",
      "recipe": "Rinse rice; cook in water (stovetop or cooker) until grains are soft and separate."
    },
    {
      "name": "Cricket Club Special Biryani",
      "description": "A special house biryani with a blend of meats or veggies and signature spices.",
      "price": 15.99,
      "priceTier": "$$",
      "origin": "Fusion / Possibly Restaurant-specific",
      "recipe": "Layer spiced protein with aromatic rice; dum-cook with special house masala."
    },
    {
      "name": "Chicken Kebab",
      "description": "Marinated chicken pieces skewered and grilled.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "Middle Eastern/Indian",
      "recipe": "Marinate chicken with yogurt/spices; skewer; grill or bake for a smoky flavor."
    },
    {
      "name": "Raita",
      "description": "A yogurt-based condiment with vegetables or boondi, often served with biryani or spicy dishes.",
      "price": 2.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Mix yogurt with chopped veggies (cucumber, onion) or boondi; season with salt, cumin."
    },
    {
      "name": "Maggi Noodles",
      "description": "Instant noodles widely popular in India, cooked with masala spice packet.",
      "price": 2.99,
      "priceTier": "$",
      "origin": "Global brand, famously adapted in India",
      "recipe": "Boil noodles; add seasoning packet; optionally add vegetables or cheese."
    },
    {
      "name": "Maggi Masala",
      "description": "A spicier version of Maggi Noodles with additional vegetables or spices.",
      "price": 3.99,
      "priceTier": "$",
      "origin": "Adapted Indian instant snack",
      "recipe": "Same as Maggi, but incorporate extra onions, tomatoes, chili powder, etc."
    },
    {
      "name": "Chai",
      "description": "Another term for tea, often with milk and sugar.",
      "price": 2.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Simmer black tea with water, milk, sugar; optionally add spices (ginger, cardamom)."
    },
    {
      "name": "Mint Chicken",
      "description": "Chicken cooked in a mint-based marinade for a fresh, herbal flavor.",
      "price": 13.99,
      "priceTier": "$$",
      "origin": "Indian Subcontinent (mint marinade is a local twist)",
      "recipe": "Marinate chicken in mint-coriander paste, yogurt, spices; grill or fry."
    },
    {
      "name": "Tandoori Paneer",
      "description": "Paneer marinated and roasted in a tandoor, similar to tandoori chicken style.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "North India (Punjabi / Tandoori)",
      "recipe": "Marinate paneer with yogurt, tandoori masala; grill or tandoor cook."
    },
    {
      "name": "Basmati Rice",
      "description": "A fragrant, long-grain rice used in many Indian dishes.",
      "price": 3.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Rinse basmati grains; simmer in water until fluffy and aromatic."
    },
    {
      "name": "Blissful Butter Chicken",
      "description": "A variation of butter chicken, extra creamy and rich in flavor.",
      "price": 15.99,
      "priceTier": "$$",
      "origin": "North India (Punjabi, with a twist)",
      "recipe": "Marinate chicken in mild spices; cook in a rich tomato, butter, and cream sauce."
    },
    {
      "name": "Gulab Jamun",
      "description": "Soft, spongy milk-solid balls soaked in sugar syrup, flavored with cardamom.",
      "price": 5.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Prepare khoya dough; shape into small balls; fry golden; soak in sugar syrup."
    },
    {
      "name": "Kanak Special Thali",
      "description": "A complete Indian meal platter with multiple dishes (dal, veg, bread, etc.).",
      "price": 14.99,
      "priceTier": "$$",
      "origin": "North India (Restaurant-styled Thali)",
      "recipe": "Serve a variety of curries, breads, rice, dessert on one platter."
    },
    {
      "name": "Dal Tadka",
      "description": "Yellow lentils tempered with spices, onions, and tomatoes.",
      "price": 9.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Boil lentils; temper with ghee, cumin, garlic, chilies, onion, tomato, and tadka spices."
    },
    {
      "name": "Chapati",
      "description": "An unleavened whole wheat flatbread, staple in many Indian meals.",
      "price": 1.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Mix atta flour with water; knead, roll, and cook on a hot tawa."
    },
    {
      "name": "Spicy Lamb Curry",
      "description": "Lamb stewed in a hot, aromatic gravy with a blend of Indian spices.",
      "price": 16.99,
      "priceTier": "$$",
      "origin": "Various regions (e.g., Rajastan or Punjab)",
      "recipe": "Brown lamb with onions, tomatoes, chili; simmer until tender in a thick curry."
    },
    {
      "name": "Paneer Tikka",
      "description": "Paneer cubes marinated in tikka masala and cooked in a tandoor.",
      "price": 11.99,
      "priceTier": "$$",
      "origin": "North India",
      "recipe": "Marinate paneer with yogurt, spices; grill or bake until slightly charred."
    },
    {
      "name": "Express Guilt Trip Special",
      "description": "A proprietary or playful dish with indulgent flavors (dessert or fusion item).",
      "price": 10.99,
      "priceTier": "$$",
      "origin": "Restaurant-specific / Fusion",
      "recipe": "Likely a sweet or rich dish combining ice cream, chocolate, or deep-fried elements."
    },
    {
      "name": "Fries",
      "description": "Potatoes cut into strips and deep-fried until crispy.",
      "price": 3.99,
      "priceTier": "$",
      "origin": "Global (French fries from Western cuisine)",
      "recipe": "Peel and slice potatoes; fry in hot oil until golden; season with salt."
    },
    {
      "name": "Cola",
      "description": "A carbonated soft drink typically flavored with cola nuts, caramel, etc.",
      "price": 2.99,
      "priceTier": "$",
      "origin": "Western / Global beverage",
      "recipe": "Proprietary formula of sweeteners, carbonated water, and flavors."
    },
    {
      "name": "Grilled Tandoori Chicken",
      "description": "Similar to Tandoori Chicken, possibly double marinated or grilled separately.",
      "price": 14.99,
      "priceTier": "$$",
      "origin": "North India (Punjabi)",
      "recipe": "Marinate chicken in tandoori spices, grill until smoky and charred."
    },
    {
      "name": "Biryani",
      "description": "A generic term for a layered, spiced rice dish with meat or vegetables.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "Indian Subcontinent (Mughlai / Hyderabadi style)",
      "recipe": "Marinate protein/veg; layer with partially cooked basmati; dum-cook with saffron and spices."
    },
    {
      "name": "Banarasi Biryani",
      "description": "Biryani variation from Banaras with unique local spices and garnishes.",
      "price": 13.99,
      "priceTier": "$$",
      "origin": "Varanasi (Banaras), North India",
      "recipe": "Similar layering technique; incorporate local flavors like fennel or special masala."
    },
    {
      "name": "Aloo Tikki",
      "description": "Spiced potato patties often served with chutneys or in chaat.",
      "price": 6.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Mash spiced potatoes; shape into patties; shallow fry until golden crisp."
    },
    {
      "name": "Amulya Special Curry",
      "description": "A signature curry, possibly vegetarian or with paneer, based on house recipe.",
      "price": 13.99,
      "priceTier": "$$",
      "origin": "Restaurant-specific",
      "recipe": "Uses a house-made gravy with veggies or paneer, spiced and simmered to unique taste."
    },
    {
      "name": "Rice",
      "description": "Plain or boiled rice, a staple in many Indian meals.",
      "price": 1.99,
      "priceTier": "$",
      "origin": "Global / Basic staple",
      "recipe": "Rinse rice; boil or steam with water until soft and fluffy."
    },
    {
      "name": "Desi Tadka Special",
      "description": "A house special dish with a 'desi tadka' or Indian touch of spices.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "Fusion / Restaurant style",
      "recipe": "Stir-fry or curry with onions, tomatoes, 'tadka' of spices for added flavor."
    },
    {
      "name": "Dal Fry",
      "description": "Lentils fried with onions, tomatoes, and spices, giving a rich, aromatic flavor.",
      "price": 9.99,
      "priceTier": "$",
      "origin": "North India",
      "recipe": "Boil lentils; fry onions, tomatoes in ghee with spices; combine for final flavor."
    },
    {
      "name": "Rasoi Special Thali",
      "description": "A complete platter from a 'Rasoi' (kitchen) offering multiple dishes.",
      "price": 15.99,
      "priceTier": "$$",
      "origin": "Restaurant-styled Thali",
      "recipe": "Combination of dal, sabzi, bread, rice, and dessert in one plate."
    },
    {
      "name": "Bakery Bread",
      "description": "Generic baked bread, possibly a loaf or buns from an in-house bakery.",
      "price": 3.99,
      "priceTier": "$",
      "origin": "Bakery / Western influence",
      "recipe": "Flour, yeast, water, salt, kneaded and baked to form fresh bread."
    },
    {
      "name": "Chutneys Combo",
      "description": "Assortment of chutneys (mint, tamarind, coconut, etc.) served together.",
      "price": 5.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Blend various chutney bases (coconut, mint, tamarind); serve as dips."
    },
    {
      "name": "Dosa",
      "description": "A crispy fermented crepe from South India, often with a potato filling.",
      "price": 9.99,
      "priceTier": "$",
      "origin": "South India",
      "recipe": "Ferment rice+dal batter; spread thin on a griddle; fill with spiced potato masala."
    },
    {
      "name": "Sambhar",
      "description": "A lentil-based vegetable stew, common in South Indian cuisine.",
      "price": 6.99,
      "priceTier": "$",
      "origin": "South India",
      "recipe": "Boil toor dal with veggies, tamarind, sambar powder; temper with mustard seeds, curry leaves."
    },
    {
      "name": "Cafe Special Chawla",
      "description": "A signature dish from 'Chawla' cafe, potentially rich creamy gravy or unique combo.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "Restaurant-specific / North Indian style",
      "recipe": "Likely uses onion-tomato gravy with cream/spices for a cafe signature taste."
    },
    {
      "name": "Idli",
      "description": "Soft, steamed cakes made from fermented rice and lentil batter.",
      "price": 5.99,
      "priceTier": "$",
      "origin": "South India",
      "recipe": "Ferment rice+urad dal batter; pour into idli molds; steam until fluffy."
    },
    {
      "name": "Vada",
      "description": "Savoury fried snack made from urad dal or other lentils, crisp on outside.",
      "price": 5.99,
      "priceTier": "$",
      "origin": "South India",
      "recipe": "Grind urad dal to thick batter; shape into donut form; deep fry until golden."
    },
    {
      "name": "Thali Special",
      "description": "A broad platter of multiple dishes (dal, sabzi, bread, dessert), a complete meal.",
      "price": 14.99,
      "priceTier": "$$",
      "origin": "All over India (thali concept varies regionally)",
      "recipe": "Includes various small bowls with different curries, rice, bread, sweets."
    },
    {
      "name": "Tiffin Combo",
      "description": "South Indian tiffin items like idli, vada, dosa served together.",
      "price": 10.99,
      "priceTier": "$$",
      "origin": "South India",
      "recipe": "Combo of popular tiffin items with chutneys and sambar."
    },
    {
      "name": "Chutney",
      "description": "A condiment made with coconut, mint, or tamarind, often served with snacks.",
      "price": 2.99,
      "priceTier": "$",
      "origin": "Indian Subcontinent",
      "recipe": "Blend base ingredient with spices, salt, and sometimes chili or tamarind."
    },
    {
      "name": "Farzi Fusion Dosa",
      "description": "A creative twist on dosa with unusual fillings or sauces, 'farzi' meaning 'illusion' or 'fusion'.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "Fusion / Modern South Indian",
      "recipe": "Same fermented batter; fill with a unique or exotic stuffing like cheese or pesto."
    },
    {
      "name": "Creative Curry",
      "description": "A chef’s special curry combining various influences and ingredients.",
      "price": 13.99,
      "priceTier": "$$",
      "origin": "Fusion / Chef-inspired",
      "recipe": "Blend of multiple Indian gravy techniques with seasonal or unique ingredients."
    },
    {
      "name": "Mocktail",
      "description": "A non-alcoholic mixed drink, often fruity or minty.",
      "price": 4.99,
      "priceTier": "$",
      "origin": "Global / Western influence",
      "recipe": "Mix fruit juices, syrups, soda; garnish with mint or fruit slices."
    },
    {
      "name": "Simply Indian Thali",
      "description": "A straightforward Indian thali with essential dishes (dal, sabzi, roti, rice).",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "Generic Indian Thali concept",
      "recipe": "Plate up a portion of dal, vegetable curry, roti, rice, and maybe a sweet."
    },
    {
      "name": "Paneer Masala",
      "description": "A simple paneer curry with onion-tomato gravy, spiced moderately.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "North India",
      "recipe": "Sauté onions, tomatoes, spices; add paneer cubes; simmer until flavors meld."
    },
    {
      "name": "Parotta",
      "description": "A layered flatbread popular in South India, especially Kerala.",
      "price": 3.99,
      "priceTier": "$",
      "origin": "Kerala / South India",
      "recipe": "Knead maida dough with oil; roll and fold multiple times; cook until flaky."
    },
    {
      "name": "Madhurai Special",
      "description": "A specialty dish from Madurai (South TN), possibly a gravy or parotta-based.",
      "price": 12.99,
      "priceTier": "$$",
      "origin": "Madurai, Tamil Nadu",
      "recipe": "Varies – often a peppery gravy or parotta-based dish with local masala."
    },
    {
      "name": "Sambar",
      "description": "A second entry if needed, same lentil-vegetable stew from South India.",
      "price": 6.99,
      "priceTier": "$",
      "origin": "South India",
      "recipe": "Boil dal, tamarind, veggies, sambar powder; finish with mustard seeds, curry leaves."
    },
    {
      "name": "Southern Spice Special",
      "description": "A signature dish from a 'Southern Spice' brand or restaurant, spicy gravy/curry.",
      "price": 13.99,
      "priceTier": "$$",
      "origin": "South India (Restaurant-inspired)",
      "recipe": "Likely a blend of coconut, curry leaves, chili, and local spices in a gravy."
    },
    {
      "name": "Dal",
      "description": "A basic lentil preparation; can be moong, toor, or masoor dal, lightly spiced.",
      "price": 6.99,
      "priceTier": "$",
      "origin": "All over Indian Subcontinent",
      "recipe": "Boil lentils with turmeric; do a mild temper with cumin, onion, chili."
    },
    {
      "name": "Halal Biryani",
      "description": "Biryani prepared with halal meat, often with aromatic spices.",
      "price": 14.99,
      "priceTier": "$$",
      "origin": "Indian Subcontinent / Halal standards",
      "recipe": "Marinate halal meat; layer with spiced rice; dum-cook with saffron and ghee."
    },
    {
      "name": "Chicken Karahi",
      "description": "Chicken stir-fried in a wok-like 'karahi' with tomatoes, ginger, and spices.",
      "price": 13.99,
      "priceTier": "$$",
      "origin": "North India / Pakistan",
      "recipe": "Cook chicken quickly in a hot karahi with tomato, ginger, chili, and garam masala."
    }  
];

// Connection URI for your MongoDB (e.g., from .env)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourApp';

function getPriceTier(price) {
  if (price === undefined || price === null) return undefined;
  if (price <= 10) return '$';
  if (price > 10 && price <= 20) return '$$';
  return '$$$';
}

// A placeholder function to guess origin or store a default
function getOrigin(name) {
  // If you want to guess by name or store a default
  if (name.toLowerCase().includes('dosa')) return 'South India';
  // ... more guesses ...
  return 'Origin not provided';
}

// A placeholder function for recipe
function getRecipe(name) {
  // Hardcode a default or store something
  return `Recipe details for ${name} are not yet provided.`;
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    for (const item of dishData) {
      const priceTier = item.price !== undefined ? getPriceTier(item.price) : undefined;

      // If item.description is empty, maybe store "No description" or fallback
      const description = item.description && item.description.trim() !== ''
        ? item.description
        : 'No description available.';

      // Compute origin or store a default
      const origin = item.origin || getOrigin(item.name);
      // Compute or store a default recipe
      const recipe = item.recipe || getRecipe(item.name);

      // Upsert each dish
      const updatedDish = await Dish.findOneAndUpdate(
        { name: item.name }, // match by dish name
        {
          $set: {
            description,
            origin,
            recipe,
            price: item.price || 0,
            priceTier,
          }
        },
        { upsert: true, new: true }
      );
      console.log(`Updated/created dish: ${updatedDish.name}`);
    }

    console.log('Finished updating dishes with details.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating dishes:', err);
    process.exit(1);
  }
}

main();
