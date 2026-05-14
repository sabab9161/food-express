import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import Food from "./models/Food.js";
import Restaurant from "./models/Restaurant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const restaurantSeed = [
  {
    name: "Burger King",
    description: "Flame-grilled burgers, crispy sides, shakes, and quick meals.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=300&q=80",
    address: "18 Market Street",
    city: "Mumbai",
    cuisineType: "Burgers",
    openingTime: "10:00",
    closingTime: "23:30",
    rating: 4.4,
    deliveryTime: 28,
    deliveryFee: 39,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  },
  {
    name: "Domino's Pizza",
    description: "Fresh pizzas, garlic breads, pasta, and cheesy sides.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=300&q=80",
    address: "42 Broadway Avenue",
    city: "Delhi",
    cuisineType: "Pizza",
    openingTime: "09:30",
    closingTime: "23:45",
    rating: 4.5,
    deliveryTime: 32,
    deliveryFee: 29,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  },
  {
    name: "KFC",
    description: "Crispy fried chicken, burgers, wings, buckets, and sides.",
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=300&q=80",
    address: "77 Central Plaza",
    city: "Bengaluru",
    cuisineType: "Chicken",
    openingTime: "11:00",
    closingTime: "23:00",
    rating: 4.3,
    deliveryTime: 30,
    deliveryFee: 35,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  },
  {
    name: "McDonald's",
    description: "Burgers, fries, wraps, shakes, breakfast, and cafe favorites.",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=300&q=80",
    address: "9 Lake Road",
    city: "Pune",
    cuisineType: "Fast Food",
    openingTime: "08:00",
    closingTime: "23:00",
    rating: 4.2,
    deliveryTime: 25,
    deliveryFee: 25,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  },
  {
    name: "Pizza Hut",
    description: "Pan pizzas, pastas, garlic bread, desserts, and family meals.",
    image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=300&q=80",
    address: "55 Sunset Boulevard",
    city: "Hyderabad",
    cuisineType: "Pizza",
    openingTime: "10:30",
    closingTime: "23:30",
    rating: 4.4,
    deliveryTime: 35,
    deliveryFee: 45,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  },
  {
    name: "Biryani House",
    description: "Aromatic biryanis, kebabs, curries, breads, and royal desserts.",
    image: "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=300&q=80",
    address: "21 Nawab Lane",
    city: "Lucknow",
    cuisineType: "Biryani",
    openingTime: "11:00",
    closingTime: "23:45",
    rating: 4.6,
    deliveryTime: 38,
    deliveryFee: 49,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  },
  {
    name: "Chinese Wok",
    description: "Indo-Chinese noodles, rice bowls, momos, gravies, and starters.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&q=80",
    address: "63 Dragon Street",
    city: "Kolkata",
    cuisineType: "Chinese",
    openingTime: "11:30",
    closingTime: "23:00",
    rating: 4.3,
    deliveryTime: 31,
    deliveryFee: 35,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  },
  {
    name: "South Indian Cafe",
    description: "Dosas, idlis, vadas, uttapams, filter coffee, and classic meals.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1630409346824-4f0e7b080087?auto=format&fit=crop&w=300&q=80",
    address: "14 Temple Road",
    city: "Chennai",
    cuisineType: "South Indian",
    openingTime: "07:00",
    closingTime: "22:30",
    rating: 4.5,
    deliveryTime: 24,
    deliveryFee: 20,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  },
  {
    name: "Sweet Corner",
    description: "Fresh Indian sweets, cakes, pastries, snacks, and celebration boxes.",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=300&q=80",
    address: "88 Celebration Chowk",
    city: "Jaipur",
    cuisineType: "Desserts",
    openingTime: "09:00",
    closingTime: "22:00",
    rating: 4.4,
    deliveryTime: 22,
    deliveryFee: 20,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  },
  {
    name: "Coffee House",
    description: "Fresh coffee, sandwiches, pastries, cold brews, and cafe snacks.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80",
    address: "5 Bean Avenue",
    city: "Bengaluru",
    cuisineType: "Cafe",
    openingTime: "08:00",
    closingTime: "22:30",
    rating: 4.5,
    deliveryTime: 20,
    deliveryFee: 25,
    isOpen: true,
    isApproved: true,
    isBlocked: false
  }
];

const foodSeed = [
  ["Burger King", "Whopper Burger", "Flame-grilled chicken patty with lettuce, onion, tomato, and mayo.", 249, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80", 18, 100],
  ["Burger King", "Veggie King Burger", "Crispy veg patty with lettuce, onion, and tangy sauce.", 179, "Burgers", "Veg", "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80", 15, 100],
  ["Burger King", "Crispy Chicken Burger", "Crunchy chicken fillet with creamy mayo and toasted buns.", 199, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80", 16, 100],
  ["Burger King", "Loaded Cheese Fries", "Golden fries topped with cheese sauce, herbs, and jalapenos.", 149, "Sides", "Veg", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80", 12, 100],
  ["Burger King", "Chocolate Thick Shake", "Rich chilled chocolate shake with a creamy finish.", 139, "Beverages", "Veg", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80", 8, 100],

  ["Domino's Pizza", "Margherita Pizza", "Classic cheese pizza with tomato sauce, mozzarella, and basil.", 249, "Pizza", "Veg", "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80", 20, 100],
  ["Domino's Pizza", "Farmhouse Pizza", "Capsicum, onion, tomato, corn, and cheese on a crisp base.", 369, "Pizza", "Veg", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80", 23, 100],
  ["Domino's Pizza", "Pepperoni Pizza", "Loaded pepperoni pizza with extra cheese and oregano.", 399, "Pizza", "Non-Veg", "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80", 22, 100],
  ["Domino's Pizza", "Garlic Breadsticks", "Warm breadsticks brushed with garlic butter and herbs.", 129, "Sides", "Veg", "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=900&q=80", 10, 100],
  ["Domino's Pizza", "Chicken Sausage Pizza", "Cheesy pizza topped with spicy chicken sausage and onions.", 429, "Pizza", "Non-Veg", "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80", 24, 100],

  ["KFC", "Zinger Burger", "Spicy crispy chicken burger with lettuce and signature sauce.", 249, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=900&q=80", 18, 100],
  ["KFC", "Chicken Bucket", "Assorted crispy fried chicken pieces for sharing.", 699, "Chicken", "Non-Veg", "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=80", 25, 100],
  ["KFC", "Popcorn Chicken", "Bite-sized seasoned chicken pieces served with dip.", 199, "Chicken", "Non-Veg", "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80", 14, 100],
  ["KFC", "Crispy Veg Strips", "Crispy vegetarian strips with a spicy dip.", 159, "Sides", "Veg", "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=900&q=80", 12, 100],
  ["KFC", "Chicken Wings", "Hot and crispy wings tossed with house seasoning.", 299, "Chicken", "Non-Veg", "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=80", 20, 100],

  ["McDonald's", "Big Mac", "Double burger with lettuce, cheese, pickles, onions, and sauce.", 289, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=900&q=80", 16, 100],
  ["McDonald's", "McAloo Tikki", "Crispy potato patty with tomato mayo and toasted buns.", 109, "Burgers", "Veg", "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=80", 12, 100],
  ["McDonald's", "McChicken Burger", "Crispy chicken patty with lettuce and creamy mayo.", 199, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80", 14, 100],
  ["McDonald's", "French Fries", "Crispy salted potato fries served hot.", 119, "Sides", "Veg", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80", 8, 100],
  ["McDonald's", "Oreo McFlurry", "Creamy dessert blended with Oreo cookie crumbs.", 149, "Desserts", "Veg", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80", 7, 100],

  ["Pizza Hut", "Cheese Burst Pizza", "Pan pizza packed with molten cheese and tomato sauce.", 399, "Pizza", "Veg", "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80", 24, 100],
  ["Pizza Hut", "Veggie Supreme Pizza", "Pizza topped with peppers, onions, olives, corn, and mushrooms.", 369, "Pizza", "Veg", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80", 23, 100],
  ["Pizza Hut", "Chicken Pepperoni Pizza", "Cheesy pizza with chicken pepperoni and oregano.", 449, "Pizza", "Non-Veg", "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80", 24, 100],
  ["Pizza Hut", "Creamy Alfredo Pasta", "Penne pasta tossed in creamy alfredo sauce with herbs.", 249, "Pasta", "Veg", "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=80", 18, 100],
  ["Pizza Hut", "Garlic Bread Supreme", "Garlic bread loaded with cheese, corn, and herbs.", 179, "Sides", "Veg", "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=900&q=80", 12, 100],

  ["Biryani House", "Chicken Dum Biryani", "Slow-cooked basmati rice with marinated chicken and spices.", 329, "Biryani", "Non-Veg", "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=900&q=80", 35, 100],
  ["Biryani House", "Veg Dum Biryani", "Aromatic basmati rice cooked with vegetables and biryani masala.", 249, "Biryani", "Veg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=80", 30, 100],
  ["Biryani House", "Mutton Biryani", "Rich mutton biryani cooked with saffron, spices, and herbs.", 449, "Biryani", "Non-Veg", "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80", 40, 100],
  ["Biryani House", "Paneer Tikka", "Smoky paneer cubes marinated in spices and grilled.", 259, "Starters", "Veg", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80", 22, 100],
  ["Biryani House", "Chicken Kebab", "Juicy chicken kebabs with mint chutney and salad.", 299, "Starters", "Non-Veg", "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80", 24, 100],

  ["Chinese Wok", "Veg Hakka Noodles", "Stir-fried noodles with vegetables and Indo-Chinese sauces.", 199, "Noodles", "Veg", "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80", 18, 100],
  ["Chinese Wok", "Chicken Fried Rice", "Wok-tossed rice with chicken, egg, vegetables, and sauces.", 229, "Rice", "Non-Veg", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80", 18, 100],
  ["Chinese Wok", "Chilli Paneer", "Paneer cubes tossed with peppers, onions, and chilli sauce.", 249, "Starters", "Veg", "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80", 20, 100],
  ["Chinese Wok", "Chicken Manchurian", "Chicken dumplings tossed in spicy Manchurian gravy.", 279, "Chinese", "Non-Veg", "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80", 22, 100],
  ["Chinese Wok", "Veg Momos", "Steamed vegetable dumplings served with spicy chutney.", 149, "Momos", "Veg", "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=900&q=80", 16, 100],

  ["South Indian Cafe", "Masala Dosa", "Crispy dosa filled with spiced potato masala and served with chutney.", 159, "South Indian", "Veg", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80", 15, 100],
  ["South Indian Cafe", "Idli Sambar", "Soft idlis served with hot sambar and coconut chutney.", 119, "South Indian", "Veg", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80", 10, 100],
  ["South Indian Cafe", "Medu Vada", "Crispy lentil vadas served with sambar and chutney.", 129, "South Indian", "Veg", "https://images.unsplash.com/photo-1630409346824-4f0e7b080087?auto=format&fit=crop&w=900&q=80", 12, 100],
  ["South Indian Cafe", "Onion Uttapam", "Thick uttapam topped with onions, chillies, and coriander.", 169, "South Indian", "Veg", "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=900&q=80", 16, 100],
  ["South Indian Cafe", "Filter Coffee", "Traditional South Indian filter coffee served hot.", 79, "Beverages", "Veg", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80", 5, 100],

  ["Sweet Corner", "Gulab Jamun", "Soft milk-solid dumplings soaked in warm sugar syrup.", 129, "Sweets", "Veg", "https://images.unsplash.com/photo-1605197183305-6e5f7c7f46bb?auto=format&fit=crop&w=900&q=80", 8, 100],
  ["Sweet Corner", "Rasgulla", "Spongy cottage cheese balls soaked in light sugar syrup.", 139, "Sweets", "Veg", "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=900&q=80", 8, 100],
  ["Sweet Corner", "Chocolate Cake", "Moist chocolate cake layered with rich chocolate frosting.", 299, "Desserts", "Veg", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80", 20, 100],
  ["Sweet Corner", "Kaju Katli", "Classic cashew sweet with a smooth, rich finish.", 399, "Sweets", "Veg", "https://images.unsplash.com/photo-1605197183305-6e5f7c7f46bb?auto=format&fit=crop&w=900&q=80", 10, 100],
  ["Sweet Corner", "Samosa", "Crispy pastry filled with spiced potatoes and peas.", 49, "Snacks", "Veg", "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80", 10, 100],

  ["Coffee House", "Cappuccino", "Espresso with steamed milk and smooth foam.", 149, "Coffee", "Veg", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80", 6, 100],
  ["Coffee House", "Cold Coffee", "Chilled coffee blended with milk, ice, and chocolate notes.", 169, "Beverages", "Veg", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80", 7, 100],
  ["Coffee House", "Veg Sandwich", "Grilled sandwich with vegetables, cheese, and cafe sauce.", 189, "Sandwiches", "Veg", "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80", 12, 100],
  ["Coffee House", "Chicken Sandwich", "Toasted sandwich filled with chicken, lettuce, and mayo.", 229, "Sandwiches", "Non-Veg", "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=80", 14, 100],
  ["Coffee House", "Blueberry Muffin", "Soft muffin loaded with blueberry filling and crumble topping.", 129, "Bakery", "Veg", "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=80", 8, 100]
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Promise.all([
      Food.deleteMany({}),
      Restaurant.deleteMany({})
    ]);

    const restaurants = await Restaurant.insertMany(restaurantSeed);
    const restaurantByName = new Map(restaurants.map((restaurant) => [restaurant.name, restaurant]));

    const foods = foodSeed.map(
      ([restaurantName, name, description, price, category, foodType, image, preparationTime, stock]) => {
        const restaurant = restaurantByName.get(restaurantName);

        if (!restaurant) {
          throw new Error(`Restaurant not found for food item: ${name}`);
        }

        return {
          name,
          description,
          price,
          category,
          image,
          restaurant: restaurant._id,
          foodType,
          preparationTime,
          stock,
          isAvailable: true
        };
      }
    );

    await Food.insertMany(foods);

    console.log("Seed completed successfully.");
    console.log(`Restaurants inserted: ${restaurants.length}`);
    console.log(`Food items inserted: ${foods.length}`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
