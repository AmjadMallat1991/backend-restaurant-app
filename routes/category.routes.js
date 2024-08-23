module.exports = (app) => {
  const categories = require("../controllers/category.controller.js");
  const { redisCachingMiddleware } = require("../middlewares/redis.js");
  var router = require("express").Router();
  router.post("/add", categories.create);
  router.get("/get", redisCachingMiddleware(), categories.findAll);

  router.get("/get_category_id/:category_id", categories.findById);

  app.use("/api/categories", router);
};
