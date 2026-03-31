const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Get patient profile (self)
// @route   GET /api/patients/me
// @access  Private (Patient)
exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
};

// @desc    Update patient profile (multi-step reg completion)
// @route   PUT /api/patients/me
// @access  Private (Patient)
exports.updatePatientProfile = async (req, res) => {
  try {
    const { address, emergencyContact, insurance, bloodGroup } = req.body;
    
    const patient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      { 
        $set: { address, emergencyContact, insurance, bloodGroup } 
      },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

// @desc    Get all patients (staff view)
// @route   GET /api/patients
// @access  Private (Super Admin, Doctor, Receptionist, Nurse)
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving patients list' });
  }
};

// @desc    Get all doctors (for dropdowns in booking / queue)
// @route   GET /api/patients/doctors
// @access  Private (All authenticated roles)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('firstName lastName specialisation status fees')
      .sort({ firstName: 1 });
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving doctors list' });
  }
};

