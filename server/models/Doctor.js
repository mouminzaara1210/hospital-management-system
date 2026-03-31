const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialisation: { type: String, required: true },
  qualifications: [{ type: String }],
  experienceYears: { type: Number },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  fees: {
    consultation: { type: Number, required: true, default: 500 },
    followUp: { type: Number, default: 300 }
  },
  schedule: [{
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: { type: String, required: true }, // HH:mm format
    endTime: { type: String, required: true },
    slotDurationMinutes: { type: Number, default: 15 }
  }],
  status: {
    type: String,
    enum: ['Available', 'In-Consultation', 'On-Leave'],
    default: 'Available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
