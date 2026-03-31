const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Usually Nurse or Doctor
    required: true
  },
  bpSystolic: { type: Number },
  bpDiastolic: { type: Number },
  pulse: { type: Number }, // bpm
  temperature: { type: Number }, // Celsius
  spo2: { type: Number }, // percentage
  weight: { type: Number }, // kg
  respiratoryRate: { type: Number },
}, { timestamps: true }); // Timestamps allows for time-series charting

module.exports = mongoose.model('Vitals', vitalsSchema);
