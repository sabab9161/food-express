import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Coupon from "./models/Coupon.js";
import DeliveryPartner from "./models/DeliveryPartner.js";
import Food from "./models/Food.js";
import Restaurant from "./models/Restaurant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const restaurants = [
  {
    name: "Burger King",
    description: "Flame-grilled burgers, crispy sides, and fast comfort meals.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=300&q=80",
    address: "18 Market Street",
    city: "Mumbai",
    cuisineType: "Burgers",
    openingTime: "10:00",
    closingTime: "23:30",
    gstNumber: "27AAACB1234C1Z5",
    fssaiLicense: "10012022000111",
    rating: 4.4,
    deliveryTime: 28,
    deliveryFee: 39,
    isOpen: true
  },
  {
    name: "Domino's Pizza",
    description: "Freshly baked pizzas, garlic breads, and party-ready sides.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=300&q=80",
    address: "42 Broadway Avenue",
    city: "Delhi",
    cuisineType: "Pizza",
    openingTime: "09:30",
    closingTime: "23:45",
    gstNumber: "07AAACD1234C1Z2",
    fssaiLicense: "10012022000222",
    rating: 4.5,
    deliveryTime: 32,
    deliveryFee: 29,
    isOpen: true
  },
  {
    name: "KFC",
    description: "Crunchy fried chicken, wings, buckets, and classic sides.",
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=300&q=80",
    address: "77 Central Plaza",
    city: "Bengaluru",
    cuisineType: "Chicken",
    openingTime: "11:00",
    closingTime: "23:00",
    gstNumber: "29AAACK1234C1Z9",
    fssaiLicense: "10012022000333",
    rating: 4.3,
    deliveryTime: 30,
    deliveryFee: 35,
    isOpen: true
  },
  {
    name: "McDonald's",
    description: "Burgers, fries, breakfast favorites, shakes, and quick bites.",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=300&q=80",
    address: "9 Lake Road",
    city: "Pune",
    cuisineType: "Fast Food",
    openingTime: "08:00",
    closingTime: "23:00",
    gstNumber: "27AAACM1234C1Z1",
    fssaiLicense: "10012022000444",
    rating: 4.2,
    deliveryTime: 25,
    deliveryFee: 25,
    isOpen: true
  },
  {
    name: "Pizza Hut",
    description: "Pan pizzas, cheesy pastas, wings, and family meal boxes.",
    image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=1000&q=85",
    logo: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=300&q=80",
    address: "55 Sunset Boulevard",
    city: "Hyderabad",
    cuisineType: "Pizza",
    openingTime: "10:30",
    closingTime: "23:30",
    gstNumber: "36AAACP1234C1Z8",
    fssaiLicense: "10012022000555",
    rating: 4.4,
    deliveryTime: 35,
    deliveryFee: 45,
    isOpen: true
  }
];

const foodItems = [
  ["Burger King", "Whopper Meal", "Flame-grilled burger with fries and a chilled drink.", 299, 249, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80", 4.7, 18],
  ["Burger King", "Crispy Chicken Burger", "Crunchy chicken fillet with lettuce, mayo, and toasted bun.", 199, 179, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80", 4.5, 16],
  ["Burger King", "Loaded Fries", "Golden fries topped with cheese sauce, herbs, and jalapenos.", 149, 129, "Sides", "Veg", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80", 4.4, 12],
  ["Burger King", "Veggie King Burger", "Crispy veg patty with fresh lettuce, onions, and tangy sauce.", 179, 149, "Burgers", "Veg", "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80", 4.2, 15],
  ["Domino's Pizza", "Margherita Pizza", "Classic cheese pizza with tomato sauce, mozzarella, and basil.", 249, 199, "Pizza", "Veg", "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80", 4.8, 20],
  ["Domino's Pizza", "Pepperoni Feast", "Loaded pepperoni pizza with extra cheese and oregano.", 399, 349, "Pizza", "Non-Veg", "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80", 4.6, 22],
  ["Domino's Pizza", "Garlic Breadsticks", "Warm breadsticks brushed with garlic butter and herbs.", 129, 99, "Sides", "Veg", "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=900&q=80", 4.3, 10],
  ["Domino's Pizza", "Farmhouse Pizza", "Loaded vegetable pizza with capsicum, onions, tomatoes, and corn.", 369, 329, "Pizza", "Veg", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80", 4.5, 23],
  ["KFC", "Zinger Burger", "Spicy crispy chicken burger with lettuce and signature sauce.", 249, 219, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=900&q=80", 4.6, 18],
  ["KFC", "Chicken Bucket", "Assorted crispy fried chicken pieces for sharing.", 699, 649, "Chicken", "Non-Veg", "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=80", 4.7, 25],
  ["KFC", "Popcorn Chicken", "Bite-sized seasoned chicken pieces with dip.", 199, 169, "Chicken", "Non-Veg", "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80", 4.4, 14],
  ["KFC", "Veg Strips", "Crispy vegetarian strips served with a spicy dip.", 159, 139, "Sides", "Veg", "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=900&q=80", 4.1, 12],
  ["McDonald's", "Big Mac", "Double burger with lettuce, cheese, pickles, onions, and sauce.", 289, 259, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=900&q=80", 4.5, 16],
  ["McDonald's", "McChicken", "Crispy chicken patty with lettuce and creamy mayo.", 199, 179, "Burgers", "Non-Veg", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80", 4.4, 14],
  ["McDonald's", "Oreo Shake", "Creamy vanilla shake blended with Oreo cookie crumbs.", 149, 129, "Drinks", "Veg", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80", 4.6, 8],
  ["McDonald's", "McAloo Tikki", "Crispy potato patty with tomato mayo and toasted buns.", 109, 99, "Burgers", "Veg", "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=80", 4.3, 12],
  ["Pizza Hut", "Cheese Burst Pizza", "Pan pizza packed with molten cheese and tomato sauce.", 399, 349, "Pizza", "Veg", "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80", 4.7, 24],
  ["Pizza Hut", "Veggie Supreme", "Pizza topped with peppers, onions, olives, corn, and mushrooms.", 369, 329, "Pizza", "Veg", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80", 4.5, 23],
  ["Pizza Hut", "Creamy Alfredo Pasta", "Penne pasta tossed in creamy alfredo sauce with herbs.", 249, 219, "Pasta", "Veg", "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=80", 4.3, 18],
  ["Pizza Hut", "Chicken Pepperoni Pizza", "Cheesy pizza with chicken pepperoni and oregano.", 449, 399, "Pizza", "Non-Veg", "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80", 4.6, 24]
];

const deliveryPartners = [
  {
    name: "Amit Sharma",
    phone: "9876500001",
    email: "amit.rider@foodexpress.in",
    vehicleType: "Bike",
    vehicleNumber: "MH01AB1234",
    licenseNumber: "MH2023001111",
    status: "Online",
    earnings: 12500
  },
  {
    name: "Priya Nair",
    phone: "9876500002",
    email: "priya.rider@foodexpress.in",
    vehicleType: "Scooter",
    vehicleNumber: "DL02CD2345",
    licenseNumber: "DL2023002222",
    status: "Offline",
    earnings: 8200
  },
  {
    name: "Rahul Verma",
    phone: "9876500003",
    email: "rahul.rider@foodexpress.in",
    vehicleType: "Bike",
    vehicleNumber: "KA03EF3456",
    licenseNumber: "KA2023003333",
    status: "Busy",
    earnings: 15100
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Promise.all([
      Food.deleteMany(),
      Restaurant.deleteMany(),
      Coupon.deleteMany(),
      DeliveryPartner.deleteMany()
    ]);

    const createdRestaurants = await Restaurant.insertMany(restaurants);
    const restaurantByName = Object.fromEntries(
      createdRestaurants.map((restaurant) => [restaurant.name, restaurant])
    );

    const foods = foodItems.map(
      ([restaurantName, name, description, price, offerPrice, category, foodType, image, rating, preparationTime]) => ({
        name,
        description,
        price,
        offerPrice,
        category,
        foodType,
        image,
        rating,
        preparationTime,
        stock: 100,
        isAvailable: true,
        restaurant: restaurantByName[restaurantName]._id
      })
    );

    const createdFoods = await Food.insertMany(foods);

    await Coupon.insertMany([
      {
        code: "WELCOME50",
        discountType: "percentage",
        discountValue: 50,
        minOrderAmount: 299,
        maxDiscountAmount: 150,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicableType: "all"
      },
      {
        code: "BURGER100",
        discountType: "flat",
        discountValue: 100,
        minOrderAmount: 249,
        maxDiscountAmount: 100,
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicableType: "restaurants",
        restaurantIds: [createdRestaurants[0]._id]
      },
      {
        code: "PIZZA20",
        discountType: "percentage",
        discountValue: 20,
        minOrderAmount: 399,
        maxDiscountAmount: 120,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicableType: "foods",
        foodIds: createdFoods
          .filter((food) => food.category === "Pizza")
          .slice(0, 4)
          .map((food) => food._id)
      }
    ]);

    await DeliveryPartner.insertMany(deliveryPartners);

    console.log("Seed data imported successfully");
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
