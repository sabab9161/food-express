import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    logo: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    cuisineType: {
      type: String,
      default: "",
      trim: true
    },
    openingTime: {
      type: String,
      default: "09:00"
    },
    closingTime: {
      type: String,
      default: "23:00"
    },
    gstNumber: {
      type: String,
      default: "",
      trim: true
    },
    fssaiLicense: {
      type: String,
      default: "",
      trim: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    deliveryTime: {
      type: Number,
      default: 30,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema, "restaurants");

export default Restaurant;
