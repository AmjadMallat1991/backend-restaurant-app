module.exports = (app) => {
  const addresses = require("../controllers/address.controller.js");
  const router = require("express").Router();
  const verifyToken = require("../middlewares/authJwt.js");
  const { redisCachingMiddleware } = require("../middlewares/redis.js");

  // Routes for managing addresses
  router.post("/addresses", verifyToken, addresses.addAddress);
  router.get(
    "/addresses",
    verifyToken,
    redisCachingMiddleware(),
    addresses.getAddresses
  );
  router.get("/addresses/:addressId", verifyToken, addresses.getAddressById);
  router.put(
    "/addresses/:addressId/default",
    verifyToken,
    addresses.setDefaultAddress
  );
  router.delete("/addresses/:addressId", verifyToken, addresses.deleteAddress);

  app.use("/api", router);
};
