import Review from "../models/Review.js";
import Food from "../models/Food.js";
import Order from "../models/Order.js";

const populateReview = (query) =>
  query
    .populate("user", "name email phone")
    .populate("order", "_id status total createdAt")
    .populate("restaurant", "name")
    .populate("food", "name")
    .populate("deliveryPartner", "name phone");

export const getReviews = async (req, res) => {
  try {
    const reviews = await populateReview(Review.find().sort({ createdAt: -1 }));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryPartnerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
        deliveryPartner: req.params.partnerId,
        reviewType: "deliveryPartner",
        isVisible: true
      })
      .populate("user", "name")
      .populate("deliveryPartner", "name phone")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1))
      : 0;

    res.json({ reviews, averageRating, totalReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { order: orderId, food: foodId, restaurant: restaurantId, reviewType, rating, comment } = req.body;

    if (!["food", "restaurant", "deliveryPartner"].includes(reviewType)) {
      return res.status(400).json({ message: "Invalid review type" });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "You can review only after the order is Delivered" });
    }

    const reviewData = {
      user: req.user._id,
      order: order._id,
      reviewType,
      rating,
      comment,
      customerName: req.user.name,
      isVisible: true
    };

    if (reviewType === "food") {
      const orderedFoodIds = order.items.map((item) => item.food.toString());
      const selectedFoodId = foodId || orderedFoodIds[0];

      if (!selectedFoodId || !orderedFoodIds.includes(selectedFoodId.toString())) {
        return res.status(400).json({ message: "Select a food item from this order" });
      }

      reviewData.food = selectedFoodId;
    }

    if (reviewType === "restaurant") {
      let selectedRestaurantId = restaurantId;

      if (!selectedRestaurantId) {
        const firstFood = await Food.findById(order.items[0].food).select("restaurant");
        selectedRestaurantId = firstFood?.restaurant;
      }

      if (!selectedRestaurantId) {
        return res.status(400).json({ message: "Restaurant not found for this order" });
      }

      reviewData.restaurant = selectedRestaurantId;
    }

    if (reviewType === "deliveryPartner") {
      if (!order.deliveryPartner) {
        return res.status(400).json({ message: "Order does not have an assigned delivery partner" });
      }

      const existingReview = await Review.findOne({
        user: req.user._id,
        order: order._id,
        deliveryPartner: order.deliveryPartner,
        reviewType: "deliveryPartner"
      });

      if (existingReview) {
        return res.status(400).json({ message: "You already reviewed this delivery partner for this order" });
      }

      reviewData.deliveryPartner = order.deliveryPartner;
    }

    const review = await Review.create(reviewData);
    const populatedReview = await populateReview(Review.findById(review._id));

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this delivery partner for this order" });
    }
    res.status(400).json({ message: error.message });
  }
};

export const replyReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { reply: req.body.reply }, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
