const db = require("../models");
const upload = require("../config/upload.config.js");
const { Address } = require("./address.controller.js");
const Product = db.products;
const Category = db.categories;
const Ingredient = db.ingredients;

exports.create = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Error uploading image",
      });
    }

    // Create a new Product
    const product = new Product({
      product_name: req.body.product_name,
      product_description: req.body.product_description,
      price: req.body.price,
      image: req.file ? `/uploads/${req.file.filename}` : null, // Save the image URL
      category_id: req.body.category_id, // Should be a String
    });

    product
      .save()
      .then(() => {
        // Update the category to include the new product
        Category.findOneAndUpdate(
          { category_id: req.body.category_id }, // Find category by String ID
          { $push: { products: req.body.product_id } }, // Add product ID to category
          { new: true }
        )
          .then(() => {
            res.send({ success: true });
          })
          .catch((err) => {
            res.status(500).send({
              message: err.message || "Error updating category",
            });
          });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Oops!!! An error has occurred",
        });
      });
  });
};

exports.findAll = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not specified

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch total count of products
    const totalProducts = await Product.countDocuments();

    // Fetch products with pagination
    const products = await Product.find().skip(skip).limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);
    // Fetch ingredients for the product
    for (let product of products) {
      product.ingredients = await Ingredient.find({
        ingredient_id: { $in: product.ingredients },
      });
    }

    res.send({
      success: true,
      page,
      limit,
      totalPages,
      totalProducts,
      products,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message || "Error occurred while retrieving products.",
    });
  }
};
exports.findById = async (req, res) => {
  const productId = req.params.product_id;

  try {
    // Find the product
    const product = await Product.findOne({ product_id: productId });

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found with Product ID " + productId,
      });
    }

    // Fetch ingredients for the product
    const ingredients = await Ingredient.find({
      ingredient_id: { $in: product.ingredients },
    });

    // Attach ingredients to the product
    product.ingredients = ingredients;

    res.send({ success: true, product });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error retrieving Product with Product ID " + productId,
    });
  }
};

exports.findByCategory = async (req, res) => {
  try {
    // Get category ID from request parameters
    const categoryId = req.params.category_id;

    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not specified

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch total count of products for the given category
    const totalProducts = await Product.countDocuments({
      category_id: categoryId,
    });

    // Fetch products with pagination for the given category
    const products = await Product.find({ category_id: categoryId })
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);
    // Fetch ingredients for the product
    for (let product of products) {
      product.ingredients = await Ingredient.find({
        ingredient_id: { $in: product.ingredients },
      });
    }

    res.send({
      success: true,
      page,
      limit,
      totalPages,
      totalProducts,
      products,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message:
        err.message || "Error occurred while retrieving products by category.",
    });
  }
};

exports.createIngredient = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Error uploading image",
      });
    }

    // Create a new Ingredient
    const ingredient = new Ingredient({
      ingredient_name: req.body.ingredient_name,
      image: req.file ? `/uploads/${req.file.filename}` : null, // Save the image URL
      product_id: req.body.product_id,
    });

    ingredient
      .save()
      .then(async (savedIngredient) => {
        // Update the Product with the new ingredient
        await Product.findOneAndUpdate(
          { product_id: req.body.product_id },
          { $push: { ingredients: savedIngredient.ingredient_id } }
        );
        res.send({ success: true, ingredient: savedIngredient });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Oops!!! An error has occurred",
        });
      });
  });
}; // Delete an address by ID
exports.deleteAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    // Find and delete the address
    const result = await Address.deleteOne({ address_id: addressId });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Address not found." });
    }

    res.status(200).send({ success: true });
  } catch (err) {
    res.status;
    {
      500;
    }
    send({ message: err.message });
  }
};
