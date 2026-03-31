const mongoose = require('mongoose');

const StaffProfileSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId:   { type: String, unique: true },   // Auto-generated: HMS-EMP-XXXXX
  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, required: true, trim: true },
  role:         { type: String, enum: ['admin', 'doctor', 'nurse', 'receptionist', 'lab_technician', 'pharmacist', 'department_head'], required: true },
  department:   { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // This will refer to HospitalSettings departments later
  departmentName: { type: String }, // Storing name temporarily if Department model is not yet separated
  specialisation: { type: String },               // Doctors only
  email:        { type: String, required: true },
  phone:        { type: String },
  gender:       { type: String, enum: ['male', 'female', 'other'] },
  dateOfJoining:{ type: Date, default: Date.now },
  status:       { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  shift: {
    type:       { type: String, enum: ['morning', 'afternoon', 'night', 'rotating'] },
    startTime:  { type: String },                 // e.g. "08:00"
    endTime:    { type: String },                 // e.g. "16:00"
    workingDays:{ type: [String] },               // e.g. ["Mon","Tue","Wed","Thu","Fri"]
  },
  weeklySchedule: [{
    day:        { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    slots: [{
      startTime: String,
      endTime:   String,
      type:      { type: String, enum: ['consultation', 'ward_round', 'surgery', 'off'] }
    }]
  }],
  emergencyContact: {
    name:  String,
    phone: String,
    relation: String,
  },
  qualifications: [String],
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate employeeId before save
StaffProfileSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('StaffProfile').countDocuments();
    this.employeeId = `HMS-EMP-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('StaffProfile', StaffProfileSchema);
