module.exports = (app) => {
  const cart = require("../controllers/cart.controller.js");
  const router = require("express").Router();
  const verifyToken = require("../middlewares/authJwt.js");

  // Routes for managing cart
  router.post("/cart/add_cart", verifyToken, cart.addToCart);
  router.get("/cart", verifyToken, cart.getCartItems);
  router.post("/cart/remove_cart", verifyToken, cart.removeFromCart); // Ensure this route is added

  app.use("/api", router);
};
