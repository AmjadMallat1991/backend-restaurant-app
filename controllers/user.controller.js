const db = require("../models");
const User = db.users;
const Product = db.products;
const Ingredient = db.ingredients;
const Order = db.order;
const Cart = db.cart;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const mongoose = require("mongoose");
// User registration
exports.create = (req, res) => {
  if (req.body.password !== req.body.confirmPassword) {
    return res
      .status(400)
      .send({ message: "Password and confirm password do not match." });
  }

  const user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  const token = jwt.sign({ id: user._id }, config.secret, {
    expiresIn: 604800,
  });

  user
    .save()
    .then((savedUser) => {
      res.send({
        success: true,
        data: {
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          },
          accessToken: token,
        },
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Oops!!! An error occurred during the sign-up process",
      });
    });
};

// User sign-in
exports.signin = (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .send({ success: false, message: "User not found." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res
          .status(401)
          .send({ success: false, message: "Invalid password." });
      }

      const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 604800,
      });

      res.status(200).send({
        success: true,
        data: {
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          },
          accessToken: token,
        },
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// User sign-out
exports.signout = (req, res) => {
  res.status(200).send({ success: true });
};

// Refresh Token
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(403).send({ message: "Refresh token is required." });
  }

  jwt.verify(refreshToken, config.secret, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Invalid refresh token." });
    }

    const newAccessToken = jwt.sign({ id: decoded.id }, config.secret, {
      expiresIn: 3600,
    });

    res.status(200).send({ success: true, accessToken: newAccessToken });
  });
};

// Get User by ID
exports.getUserById = (req, res) => {
  const userId = req.params.userId;

  User.findOne({ user_id: userId })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      res.status(200).send({
        success: true,
        data: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          favorites: user.favorites,
        },
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Update Favorite
exports.updateFavorite = (req, res) => {
  const userId = req.userId;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).send({ message: "Product ID is required." });
  }

  User.findOne({ _id: userId }) // Updated to match by _id
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      if (!user.favorites) {
        user.favorites = [];
      }

      const index = user.favorites.indexOf(productId);
      if (index === -1) {
        user.favorites.push(productId);
        res.status(200).send({
          success: true,
          message: "Product added to favorites.",
          status: "add",
        });
      } else {
        user.favorites.splice(index, 1);
        res.status(200).send({
          success: true,
          message: "Product removed from favorites.",
          status: "remove",
        });
      }

      return user.save();
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getFavoriteProducts = async (req, res) => {
  const userId = req.userId;

  try {
    // Find the user by their _id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Get the list of favorite product IDs
    const favoriteProductIds = user.favorites || [];

    // Fetch the products that are in the favorites list
    const products = await Product.find({
      product_id: { $in: favoriteProductIds },
    });

    for (let product of products) {
      product.ingredients = await Ingredient.find({
        ingredient_id: { $in: product.ingredients },
      })
        .limit(2) // Limit number of products
        .exec();
    }

    res.status(200).send({ success: true, data: products });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error occurred while retrieving favorite products.",
    });
  }
};

exports.placeOrder = async (req, res) => {
  const userId = req.userId;
  const { phone_number, address_name, city, full_name } = req.body;

  try {
    // Fetch the user's email from the database
    const user = await User.findById(userId);
    const email = user.email;

    // Fetch the user's cart
    const cart = await Cart.findOne({ user_id: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).send({ message: "Cart is empty." });
    }

    const subtotal =
      cart.items
        .reduce((acc, item) => acc + parseFloat(item.price.replace("$", "")), 0)
        .toFixed(2) + "$";

    const delivery = "2.00$";
    const total =
      (parseFloat(subtotal.replace("$", "")) + parseFloat(delivery)).toFixed(
        2
      ) + "$";
    const date = new Date().toLocaleDateString("en-GB");
    // Create a new order
    const order = new Order({
      user_id: userId,
      items: cart.items,
      phone_number,
      email, // Assign email here
      address_name,
      city,
      date,
      full_name,
      subtotal,
      delivery,
      total,
      status: "processing", // default status
    });

    await order.save();

    // // Clear the user's cart after placing the order
    // cart.items = [];
    // await cart.save();

    // Remove the user's cart after placing the order
    await Cart.deleteOne({ user_id: userId });

    res.status(201).send({
      success: true,
      message: "Order placed successfully.",
      order_id: order.order_id,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  const userId = req.userId; // Assuming the user ID is extracted from the token
  const { status } = req.query; // Get the status from query parameters

  try {
    const query = { user_id: userId };

    // If status is provided in the query, add it to the filter criteria
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query);

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .send({
          message: "No orders found for this user with the specified status.",
        });
    }

    res.status(200).send({
      success: true,
      orders: orders,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
