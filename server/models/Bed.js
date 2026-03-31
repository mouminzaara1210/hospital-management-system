const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  ward: {
    type: String,
    enum: ['General', 'ICU', 'NICU', 'Emergency', 'Private'],
    required: true
  },
  bedNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance'],
    default: 'Available'
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  },
  admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission', // Optional link to full admission record
    default: null
  }
}, { timestamps: true });

// Ensure bedNumber is unique per ward
bedSchema.index({ ward: 1, bedNumber: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);
