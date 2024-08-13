// models/category.model.js
const { v4: uuidv4 } = require("uuid");
module.exports = (mongoose) => {
  const Category = mongoose.model(
    "category",
    mongoose.Schema(
      {
        category_id: {
          type: String,
          required: true,
          unique: true,
          default: uuidv4(),
        }, // Change to String
        category_name: String,
        image: String,
        products: [{ type: String, ref: "product" }], // Change to String to match the product model
      },
      {
        timestamps: true,
      }
    )
  );
  return Category;
};
