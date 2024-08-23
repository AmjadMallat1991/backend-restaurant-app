module.exports = (app) => {
  const users = require("../controllers/user.controller.js");
  const router = require("express").Router();
  const verifyToken = require("../middlewares/authJwt.js");
  const verifyApiToken = require("../middlewares/verifyApiToken.js");

  router.post("/signup", verifyApiToken, users.create);
  router.post("/signin", verifyApiToken, users.signin);
  router.post("/refresh-token", verifyApiToken, users.refreshToken);
  router.get("/protected", verifyToken, (req, res) => {
    res.status(200).send("This is a protected route!");
  });
  router.get("/generate-api-token", (req, res) => {
    const token = require("../config/auth.config.js").apiToken;
    res.status(200).send({ apiToken: token });
  });
  router.get("/get_user/:userId", verifyApiToken, users.getUserById);
  router.post("/update-favorite", verifyToken, users.updateFavorite);
  router.get("/favorites", verifyToken, users.getFavoriteProducts);
  router.post("/signout", verifyApiToken, users.signout);
  router.post("/placeOrder", verifyToken, users.placeOrder);
  router.get("/orders", verifyToken, users.getOrders);
  app.use("/api/users", router);
};
