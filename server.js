const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const app = express();
const db = require("../backend/models/index.js");
const { initializeRedisClient } = require("./middlewares/redis.js");

initializeRedisClient();
db.mongoose
  .connect(db.url, {})
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Connot connect to DB", err);
    process.exit();
  });

var corsOptions = {
  origin: [
    "http://localhost:8081",
    "http://127.0.0.1:5500",
    "http://localhost:3000/",
    "http://localhost:62328/",
  ],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "amjad!!!" });
});
require("./routes/product.routes.js")(app);
require("./routes/category.routes.js")(app);
require("./routes/user.routes.js")(app);
require("./routes/address.routes.js")(app);
require("./routes/cart.routes.js")(app);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port  ${PORT}`);
  setTimeout(function () {
    process.send("ready");
  }, 5000);
});
