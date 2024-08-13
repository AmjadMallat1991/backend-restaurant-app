const { v4: uuidv4 } = require("uuid");

module.exports = (mongoose) => {
  const addressSchema = new mongoose.Schema(
    {
      address_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
      },
      user_id: {
        type: String,
        required: true,
      },
      address_details: String,
      address_name: String,
      city: String,
      phone_number: String,
      default: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return mongoose.model("Address", addressSchema);
};
