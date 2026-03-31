const mongoose = require('mongoose');

const HospitalSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'GLOBAL', unique: true },

  profile: {
    name:        { type: String, required: true },
    tagline:     String,
    address:     String,
    city:        String,
    state:       String,
    pincode:     String,
    phone:       String,
    email:       String,
    website:     String,
    logoUrl:     String,
    registrationNumber: String,
    accreditation: String,             // e.g. NABH, JCI
  },

  departments: [{
    _id:    { type: mongoose.Schema.Types.ObjectId, auto: true },
    name:   { type: String, required: true },
    code:   String,                    // e.g. CARDIO, ORTHO
    hodRef: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffProfile' },
    totalBeds: { type: Number, default: 0 },
    location:  String,                 // e.g. "Block B, Floor 2"
    isActive:  { type: Boolean, default: true },
  }],

  beds: [{
    _id:        { type: mongoose.Schema.Types.ObjectId, auto: true },
    bedNumber:  { type: String, required: true },
    ward:       String,
    department: { type: mongoose.Schema.Types.ObjectId },
    type:       { type: String, enum: ['general','semi-private','private','icu','nicu'] },
    status:     { type: String, enum: ['available','occupied','maintenance'], default: 'available' },
    ratePerDay: Number,
  }],

  feeStructure: {
    consultationFees: [{
      role:           String,           // e.g. 'General Physician', 'Cardiologist'
      opd:            Number,
      ipd:            Number,
      emergency:      Number,
    }],
    labTestFees: [{
      testName:  String,
      testCode:  String,
      price:     Number,
      category:  String,               // e.g. 'Haematology', 'Radiology'
    }],
    roomCharges: [{
      roomType:  String,               // 'general','semi-private','private','icu','nicu'
      ratePerDay: Number,
    }],
    miscCharges: [{
      item:  String,
      price: Number,
    }],
    gstPercent:    { type: Number, default: 18 },
    currency:      { type: String, default: 'INR' },
  },

  notifications: {
    email: {
      enabled:              { type: Boolean, default: true },
      appointmentReminder:  { type: Boolean, default: true },
      reminderHoursBefore:  { type: Number,  default: 24 },
      labResultReady:       { type: Boolean, default: true },
      appointmentConfirmed: { type: Boolean, default: true },
      dischargeReady:       { type: Boolean, default: true },
      smtpHost:   String,
      smtpPort:   Number,
      smtpUser:   String,
      smtpPass:   String,              // Stored encrypted (or plain text in simple implementation, but we might omit from client in controller)
      fromName:   String,
      fromEmail:  String,
    },
    inApp: {
      enabled:           { type: Boolean, default: true },
      criticalVitals:    { type: Boolean, default: true },
      newAppointment:    { type: Boolean, default: true },
      bedStatusChange:   { type: Boolean, default: true },
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('HospitalSettings', HospitalSettingsSchema);
