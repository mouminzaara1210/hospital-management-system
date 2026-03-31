const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g., '10mg', '5ml'
  frequency: { type: String, required: true }, // e.g., '1-0-1', 'Twice daily'
  durationDays: { type: Number, required: true },
  instructions: { type: String } // e.g., 'Take after food'
});

const prescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  medicines: [medicineSchema],
  symptoms: [{ type: String }],
  diagnosis: [{ type: String }],
  notes: { type: String }, // General clinical notes or AI assistant ref
  suggestedTests: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
