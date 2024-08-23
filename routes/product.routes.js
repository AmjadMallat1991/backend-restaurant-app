module.exports = (app) => {
  const products = require("../controllers/product.controller.js");
  const { redisCachingMiddleware } = require("../middlewares/redis.js");
  var router = require("express").Router();
  router.post("/add", products.create);
  router.get("/get", products.findAll);
  router.get("/get_product_id/:product_id", products.findById);
  router.get(
    "/get_by_category/:category_id",
    redisCachingMiddleware(),
    products.findByCategory
  );
  router.post("/add_ingredient", products.createIngredient);
  app.use("/api/products", router);
};
