/**
 * HMS Seed Script — Run with: node seed.js
 * Creates one demo user for each of the 5 system roles.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Staff = require('./models/Staff');

const connectDB = require('./config/db');

const DEMO_USERS = [
  {
    email: 'admin@hms.com',
    password: 'Admin@1234',
    role: 'Super Admin',
    entityModel: 'Staff',
    entityData: { firstName: 'System', lastName: 'Admin', department: 'Administration' },
  },
  {
    email: 'doctor@hms.com',
    password: 'Doctor@1234',
    role: 'Doctor',
    entityModel: 'Doctor',
    entityData: {
      firstName: 'Aanya',
      lastName: 'Kumar',
      specialisation: 'General Medicine',
      qualifications: ['MBBS', 'MD'],
      fees: { consultation: 600, followUp: 300 },
      schedule: [
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 15 },
        { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 15 },
        { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 15 },
      ],
      status: 'Available',
    },
  },
  {
    email: 'nurse@hms.com',
    password: 'Nurse@1234',
    role: 'Nurse',
    entityModel: 'Staff',
    entityData: { firstName: 'Priya', lastName: 'Mehta', assignedWard: 'General', shift: 'Morning' },
  },
  {
    email: 'reception@hms.com',
    password: 'Reception@1234',
    role: 'Receptionist',
    entityModel: 'Staff',
    entityData: { firstName: 'Rahul', lastName: 'Singh', department: 'Reception' },
  },
  {
    email: 'patient@hms.com',
    password: 'Patient@1234',
    role: 'Patient',
    entityModel: 'Patient',
    entityData: {
      dateOfBirth: new Date('1990-06-15'),
      gender: 'Male',
      contactNumber: '9876543210',
      bloodGroup: 'O+',
      address: { street: '12 Main Street', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
      emergencyContact: { name: 'Sunita Sharma', relation: 'Spouse', phone: '9876500000' },
    },
  },
];

async function seed() {
  await connectDB();

  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`[SKIP] ${u.email} already exists.`);
      continue;
    }

    // 1. Create entity record first
    let entity;
    if (u.role === 'Patient') {
      const year = new Date().getFullYear();
      const seq = Math.floor(10000 + Math.random() * 90000);
      entity = await Patient.create({
        userId: new mongoose.Types.ObjectId(), // placeholder, updated below
        patientId: `HMS-${year}-${seq}`,
        firstName: 'Demo',
        lastName: 'Patient',
        ...u.entityData,
      });
    } else if (u.role === 'Doctor') {
      entity = await Doctor.create({
        userId: new mongoose.Types.ObjectId(),
        firstName: u.entityData.firstName,
        lastName: u.entityData.lastName,
        ...u.entityData,
      });
    } else {
      entity = await Staff.create({
        userId: new mongoose.Types.ObjectId(),
        firstName: u.entityData.firstName,
        lastName: u.entityData.lastName,
        ...u.entityData,
      });
    }

    // 2. Create the user
    const user = new User({
      email: u.email,
      password: u.password,
      role: u.role,
      entityModel: u.entityModel,
      entityId: entity._id,
    });
    await user.save(); // triggers bcrypt pre-save hook

    // 3. Back-link userId on entity
    entity.userId = user._id;
    await entity.save();

    console.log(`[CREATED] ${u.role}: ${u.email} / ${u.password}`);
  }

  console.log('\n✅ Seeding complete!');
  console.log('\nDemo Credentials:');
  console.log('─────────────────────────────────────');
  DEMO_USERS.forEach(u => console.log(`  ${u.role.padEnd(14)} │ ${u.email.padEnd(22)} │ ${u.password}`));
  console.log('─────────────────────────────────────');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
