const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  type: {
    type: String,
    enum: ['OPD', 'IPD', 'Online'],
    default: 'OPD'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  slotTime: {
    type: String, // HH:mm format
    required: true
  },
  tokenNumber: {
    type: Number, // For OPD Queue
  },
  queueStatus: {
    type: String,
    enum: ['Waiting', 'Calling', 'Consulting', 'Done'],
    default: 'Waiting'
  },
  reasonForVisit: String,
  cancellationReason: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
