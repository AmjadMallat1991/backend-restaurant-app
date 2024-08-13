const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.products = require("./db.product.js")(mongoose);
db.categories = require("./db.category.js")(mongoose);
db.users = require("./db.user.js")(mongoose);
db.address = require("./db.address.js")(mongoose);
db.cart = require("./db.cart.js")(mongoose);
db.order = require("./db.order.js")(mongoose);
db.ingredients = require("./db.ingredients.js")(mongoose);
module.exports = db;
