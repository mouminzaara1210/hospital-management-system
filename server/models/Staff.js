const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String }, // General reception, HR, specific ward, etc.
  assignedWard: {
    type: String, // E.g., 'ICU', 'General Ward A' (for Nurses)
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'Reliever'],
  }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
