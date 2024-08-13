module.exports = (app) => {
  const addresses = require("../controllers/address.controller.js");
  const router = require("express").Router();
  const verifyToken = require("../middleware/authJwt.js");

  // Routes for managing addresses
  router.post("/addresses", verifyToken, addresses.addAddress);
  router.get("/addresses", verifyToken, addresses.getAddresses);
  router.get("/addresses/:addressId", verifyToken, addresses.getAddressById);
  router.put(
    "/addresses/:addressId/default",
    verifyToken,
    addresses.setDefaultAddress
  );
  router.delete("/addresses/:addressId", verifyToken, addresses.deleteAddress);

  app.use("/api", router);
};
