const { v4: uuidv4 } = require("uuid");

module.exports = (mongoose) => {
  const Cart = mongoose.model(
    "cart",
    mongoose.Schema(
      {
        cart_id: {
          type: String,
          required: true,
          unique: true,
          default: uuidv4,
        },
        user_id: {
          type: String,
          required: true,
        },
        items: [
          {
            product_id: String,
            product_name: String,
            price: String,
            quantity: Number,
            image:String,
          },
        ],
      },
      {
        timestamps: true,
      }
    )
  );
  return Cart;
};
