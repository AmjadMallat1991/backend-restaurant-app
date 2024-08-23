const db = require("../models");
const upload = require("../config/upload.config.js");
const Category = db.categories;
const Product = db.products;
const Ingredient = db.ingredients;
const { readData, writeData } = require("../middlewares/redis.js");

exports.create = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Error uploading image",
      });
    }

    // Create a new Category
    const category = new Category({
      category_name: req.body.category_name,
      image: req.file ? `/uploads/${req.file.filename}` : null, // Save the image URL
    });

    category
      .save()
      .then(() => {
        res.send({ success: true });
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
    // Generate a cache key based on the request path
    const cacheKey = "/categories/findAll";

    // Check if data is already cached
    const cachedData = await readData(cacheKey);

    if (cachedData) {
      console.log("Data retrieved from cache");
      return res.send(JSON.parse(cachedData));
    }

    console.log("Cache miss. Fetching data from the database...");

    // Number of products to fetch per category
    const productsLimit = 3;

    // Fetch all categories
    const categories = await Category.find();

    // Fetch products for each category
    for (let category of categories) {
      category.products = await Product.find({
        product_id: { $in: category.products },
      })
        .limit(productsLimit)
        .exec();

      for (let product of category.products) {
        product.ingredients = await Ingredient.find({
          ingredient_id: { $in: product.ingredients },
        })
          .limit(2)
          .exec();
      }
    }

    const responseData = { success: true, categories };

    // Cache the data
    await writeData(cacheKey, JSON.stringify(responseData));
    console.log("Data fetched from the database and cached");

    res.send(responseData);
  } catch (err) {
    console.error("Error occurred while retrieving categories:", err);
    res.status(500).send({
      success: false,
      message: err.message || "Error occurred while retrieving categories.",
    });
  }
};


exports.findById = async (req, res) => {
  const categoryId = req.params.category_id;

  try {
    // Find the category
    const category = await Category.findOne({ category_id: categoryId });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found with Category ID " + categoryId,
      });
    }

    // Fetch products for the category
    const products = await Product.find({
      product_id: { $in: category.products },
    });

    // Attach products to the category
    category.products = products;

    for (let product of category.products) {
      product.ingredients = await Ingredient.find({
        ingredient_id: { $in: product.ingredients },
      })
        .limit(2) // Limit number of products
        .exec();
    }

    res.send({ success: true, category });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error retrieving Category with Category ID " + categoryId,
    });
  }
};
