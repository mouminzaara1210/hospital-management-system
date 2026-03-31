const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    // Unique identifier format HMS-YYYY-XXXXX
    type: String,
    required: true,
    unique: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String },
  contactNumber: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  insurance: {
    providerName: String,
    policyNumber: String,
    validUntil: Date
  },
  currentStatus: {
    type: String,
    enum: ['OPD', 'Admitted', 'Discharged'],
    default: 'OPD'
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
