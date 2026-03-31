const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Avoid sending password by default
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Department Head', 'Doctor', 'Receptionist', 'Nurse', 'Patient', 'Lab Technician', 'Pharmacist'],
    required: true
  },
  // Reference back to the specific entity details based on role
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityModel'
  },
  entityModel: {
    type: String,
    required: true,
    enum: ['Patient', 'Doctor', 'Staff', 'StaffProfile'] 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordOtp: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await require('bcrypt').genSalt(10);
  this.password = await require('bcrypt').hash(this.password, salt);
  
  next();
});

// Method to verify password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
