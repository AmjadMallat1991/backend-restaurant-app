const mongoose = require('mongoose');

const sequenceSchema = mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

module.exports = mongoose.model('Sequence', sequenceSchema);
