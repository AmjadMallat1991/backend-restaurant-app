// models/product.model.js
const { v4: uuidv4 } = require("uuid");

module.exports = (mongoose) => {
  const Product = mongoose.model(
    "product",
    mongoose.Schema(
      {
        product_id: {
          type: String,
          required: true,
          unique: true,
          default: uuidv4(),
        }, // Ensure this is a String
        product_name: String,
        product_description: String,
        price: String,
        image: String,
        category_id: { type: String, ref: "category" },
        ingredients: [{ type: String, ref: "ingredient" }], //// Change to String to match the category model
      },
      {
        timestamps: true,
      }
    )
  );
  return Product;
};
