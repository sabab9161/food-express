import Food from "../models/Food.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";

const sumTotal = (items) => items[0]?.total || 0;

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalRestaurants,
      revenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      topSellingFoods
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Restaurant.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments({ status: "Cancelled" }),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { quantity: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      totalOrders,
      totalRevenue: sumTotal(revenue),
      totalUsers,
      totalRestaurants,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      topSellingFoods
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const groupOrdersByDate = () => [
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      orders: { $sum: 1 },
      revenue: { $sum: "$total" }
    }
  },
  { $sort: { _id: 1 } },
  { $limit: 30 }
];

export const getAdminAnalytics = async (req, res) => {
  try {
    const [dailyOrders, weeklyRevenue, monthlySales, topFoods, statusChart, paymentMethodChart, topRestaurants] = await Promise.all([
      Order.aggregate(groupOrdersByDate()),
      Order.aggregate([
        { $group: { _id: { $isoWeek: "$createdAt" }, revenue: { $sum: "$total" } } },
        { $sort: { _id: 1 } },
        { $limit: 12 }
      ]),
      Order.aggregate([
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, sales: { $sum: "$total" } } },
        { $sort: { _id: 1 } },
        { $limit: 12 }
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
        { $sort: { quantity: -1 } },
        { $limit: 8 }
      ]),
      Order.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }]),
      Payment.aggregate([{ $group: { _id: "$paymentMethod", value: { $sum: 1 } } }]),
      Food.aggregate([
        { $lookup: { from: "restaurants", localField: "restaurant", foreignField: "_id", as: "restaurant" } },
        { $unwind: "$restaurant" },
        { $group: { _id: "$restaurant.name", foods: { $sum: 1 }, averageRating: { $avg: "$rating" } } },
        { $sort: { foods: -1 } },
        { $limit: 8 }
      ])
    ]);

    res.json({
      dailyOrders: dailyOrders.map((item) => ({ date: item._id, orders: item.orders })),
      weeklyRevenue: weeklyRevenue.map((item) => ({ week: `Week ${item._id}`, revenue: item.revenue })),
      monthlySales: monthlySales.map((item) => ({ month: item._id, sales: item.sales })),
      topFoods: topFoods.map((item) => ({ name: item._id, quantity: item.quantity })),
      orderStatusChart: statusChart.map((item) => ({ name: item._id, value: item.value })),
      paymentMethodChart: paymentMethodChart.map((item) => ({ name: item._id, value: item.value })),
      topRestaurants: topRestaurants.map((item) => ({ name: item._id, foods: item.foods, rating: Number(item.averageRating.toFixed(1)) }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
