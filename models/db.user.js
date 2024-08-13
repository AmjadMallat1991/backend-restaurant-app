const { v4: uuidv4 } = require("uuid");
module.exports = (mongoose) => {
  const User = mongoose.model(
    "users",
    mongoose.Schema(
      {
        user_id: {
          type: String,
          required: true,
          unique: true,
          default: uuidv4,
        },
        first_name: String,
        last_name: String,
        email: { type: String, unique: true },
        password: String,
        confirmPassword: String,
        favorites: [String],
      },
      {
        timestamps: true,
      }
    )
  );
  return User;
};
