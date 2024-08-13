const db = require("../models");
const Address = db.address;

// Add a new address for a user
exports.addAddress = (req, res) => {
  const userId = req.userId; // Extract userId from JWT token
  const { address_details, address_name, city, phone_number } = req.body;

  if (!address_details || !address_name || !city || !phone_number) {
    return res.status(400).send({
      message: "All address fields are required.",
    });
  }

  // Create a new address
  const newAddress = new Address({
    user_id: userId, // Use userId from token
    address_details,
    address_name,
    city,
    phone_number,
  });

  newAddress
    .save()
    .then((address) => {
      res.status(200).send({
        success: true,
        data: {
          user_id: address.user_id,
          address_details: address.address_details,
          address_name: address.address_name,
          city: address.city,
          phone_number: address.phone_number,
          default: address.default,
          address_id: address.address_id,
          createdAt: address.createdAt,
          updatedAt: address.updatedAt,
        },
      });
    })
    .catch((err) =>
      res.status(500).send({
        message: err.message || "An error occurred while saving the address.",
      })
    );
};

// Get all addresses for a user
exports.getAddresses = (req, res) => {
  const userId = req.userId; // Extract userId from JWT token

  Address.find({ user_id: userId })
    .then((addresses) => {
      if (!addresses.length) {
        return res.status(404).send({
          message: "No addresses found for this user.",
        });
      }
      res.status(200).send({
        success: true,
        addresses: addresses.map((address) => ({
          user_id: address.user_id,
          address_details: address.address_details,
          address_name: address.address_name,
          city: address.city,
          phone_number: address.phone_number,
          default: address.default,
          address_id: address.address_id,
          createdAt: address.createdAt,
          updatedAt: address.updatedAt,
        })),
      });
    })
    .catch((err) =>
      res.status(500).send({
        message: err.message || "An error occurred while retrieving addresses.",
      })
    );
};

// Get address by ID
exports.getAddressById = (req, res) => {
  const { addressId } = req.params;

  Address.findOne({ address_id: addressId })
    .then((address) => {
      if (!address) {
        return res.status(404).send({ message: "Address not found." });
      }
      res.status(200).send({
        success: true,
        data: {
          user_id: address.user_id,
          address_details: address.address_details,
          address_name: address.address_name,
          city: address.city,
          phone_number: address.phone_number,
          default: address.default,
          address_id: address.address_id,
          createdAt: address.createdAt,
          updatedAt: address.updatedAt,
        },
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Set address as default
exports.setDefaultAddress = async (req, res) => {
  const { addressId } = req.params;
  try {
    // Find the address to update
    const address = await Address.findOne({ address_id: addressId });

    if (!address) {
      return res.status(404).send({ message: "Address not found." });
    }

    // Optionally clear default status for all other addresses for the user
    await Address.updateMany(
      { user_id: address.user_id },
      { $set: { default: false } }
    );

    // Set the current address as default
    address.default = true;
    await address.save();

    res.status(200).send({ success: true });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Delete an address by ID
exports.deleteAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    // Find and delete the address
    const result = await Address.deleteOne({ address_id: addressId });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Address not found." });
    }

    res.status(200).send({ success: true });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
