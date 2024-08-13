const { v4: uuidv4 } = require("uuid");
module.exports = (mongoose) => {
  const Ingredient = mongoose.model(
    "ingredient",
    mongoose.Schema(
      {
        ingredient_id: {
          type: String,
          required: true,
          unique: true,
          default: uuidv4,
        },
        ingredient_name: String,
        image: String,
        product_id: { type: String, ref: "product" }, // Ensure product_id references Product by string
      },
      {
        timestamps: true,
      }
    )
  );
  return Ingredient;
};
