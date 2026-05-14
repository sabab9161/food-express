import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    offerPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    foodType: {
      type: String,
      enum: ["Veg", "Non-Veg"],
      default: "Veg"
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    image: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    preparationTime: {
      type: Number,
      default: 25
    },
    stock: {
      type: Number,
      default: 100,
      min: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema, "foods");

export default Food;
