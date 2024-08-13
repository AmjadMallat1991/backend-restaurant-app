const { v4: uuidv4 } = require("uuid");

module.exports = (mongoose) => {
  const Order = mongoose.model(
    "order",
    mongoose.Schema(
      {
        order_id: {
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
            image: String,
          },
        ],
        phone_number: { type: String, required: true },
        email: { type: String, required: true },
        address_name: { type: String, required: true },
        city: { type: String, required: true },
        date: { type: String, required: true },
        full_name: { type: String, required: true },
        subtotal: { type: String, required: true },
        delivery: { type: String, required: true, default: "2.00$" },
        total: { type: String, required: true },
        status: {
          type: String,
          required: true,
          enum: ["processing", "complete", "trash"],
          default: "processing",
        },
      },
      {
        timestamps: true,
      }
    )
  );
  return Order;
};
