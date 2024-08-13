const db = require("../models");
const Cart = db.cart;
const Product = db.products;


const DELIVERY_CHARGE = 2.0; // Fixed delivery charge

// Add item to cart
exports.addToCart = async (req, res) => {
  const userId = req.userId;
  const { product_id, quantity } = req.body;

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return res
      .status(400)
      .send({ message: "Invalid quantity. Must be a positive integer." });
  }

  try {
    const product = await Product.findOne({ product_id });

    if (!product) {
      return res.status(404).send({ message: "Product not found." });
    }

    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      cart = new Cart({ user_id: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product_id === product_id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price =
        (
          parseFloat(product.price.replace("$", "")) * existingItem.quantity
        ).toFixed(2) + "$";
    } else {
      cart.items.push({
        product_id: product.product_id,
        product_name: product.product_name,
        price:
          (parseFloat(product.price.replace("$", "")) * quantity).toFixed(2) +
          "$",
        image: product.image,
        quantity,
      });
    }

    await cart.save();

    const subtotal = cart.items
      .reduce((acc, item) => acc + parseFloat(item.price.replace("$", "")), 0)
      .toFixed(2);

    const total = (parseFloat(subtotal) + DELIVERY_CHARGE).toFixed(2) + "$";

    res.status(200).send({
      success: true,
      message: "Item added to cart successfully.",
      cart: cart.items,
      subtotal: `${subtotal}$`,
      delivery: `${DELIVERY_CHARGE.toFixed(2)}$`,
      total,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get all cart items for a user
exports.getCartItems = async (req, res) => {
  const userId = req.userId;

  try {
    const cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      return res.status(404).send({ message: "No cart found for this user." });
    }

    const subtotal = cart.items
      .reduce((acc, item) => acc + parseFloat(item.price.replace("$", "")), 0)
      .toFixed(2);

    const total = (parseFloat(subtotal) + DELIVERY_CHARGE).toFixed(2) + "$";

    res.status(200).send({
      success: true,
      cart: cart.items,
      subtotal: `${subtotal}$`,
      delivery: `${DELIVERY_CHARGE.toFixed(2)}$`,
      total,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.userId;
  const { product_id, quantity } = req.body;

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return res
      .status(400)
      .send({ message: "Invalid quantity. Must be a positive integer." });
  }

  try {
    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product_id === product_id
    );

    if (itemIndex === -1) {
      return res.status(404).send({ message: "Item not found in cart." });
    }

    const item = cart.items[itemIndex];
    item.quantity -= quantity;

    if (item.quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      item.price =
        (
          (parseFloat(item.price.replace("$", "")) /
            (item.quantity + quantity)) *
          item.quantity
        ).toFixed(2) + "$";
    }

    await cart.save();

    const subtotal = cart.items
      .reduce((acc, item) => acc + parseFloat(item.price.replace("$", "")), 0)
      .toFixed(2);

    const total = (parseFloat(subtotal) + DELIVERY_CHARGE).toFixed(2) + "$";

    res.status(200).send({
      success: true,
      message: "Item quantity updated successfully.",
      cart: cart.items,
      subtotal: `${subtotal}$`,
      delivery: `${DELIVERY_CHARGE.toFixed(2)}$`,
      total,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};


