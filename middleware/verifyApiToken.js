// middleware/verifyApiToken.js
const config = require("../config/auth.config.js");

const verifyApiToken = (req, res, next) => {
  const token = req.headers["x-api-token"];

  if (!token || token !== config.apiToken) {
    return res.status(403).send({
      message: "Invalid or missing API token.",
    });
  }

  next();
};

module.exports = verifyApiToken;
