const Vitals = require('../models/Vitals');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Log new vitals for patient
// @route   POST /api/clinical/vitals
// @access  Private (Nurse, Doctor)
exports.logVitals = async (req, res) => {
  try {
    const { patientId, bpSystolic, bpDiastolic, pulse, temperature, spo2, weight, respiratoryRate } = req.body;
    
    if (!patientId) return res.status(400).json({ error: 'Patient ID is required' });

    const vitals = await Vitals.create({
      patient: patientId,
      recordedBy: req.user._id,
      bpSystolic, bpDiastolic, pulse, temperature, spo2, weight, respiratoryRate
    });

    // Alert ward/dashboards of new vitals
    const io = req.app.get('socketio');
    if (io) {
      io.emit('vitals:new', vitals);
    }

    res.status(201).json(vitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error saving vitals' });
  }
};

// @desc    Get patient vitals history
// @route   GET /api/clinical/vitals/:patientId
// @access  Private 
exports.getPatientVitals = async (req, res) => {
  try {
    const vitals = await Vitals.find({ patient: req.params.patientId })
      .populate('recordedBy', 'email role')
      .sort({ createdAt: -1 })
      .limit(30); // Return last 30 points
      
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving vitals' });
  }
};

// @desc    Create new Prescription
// @route   POST /api/clinical/prescriptions
// @access  Private (Doctor)
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, medicines, symptoms, diagnosis, notes, suggestedTests } = req.body;
    
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(403).json({ error: 'Doctor record required' });

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: patientId,
      doctor: doctor._id,
      medicines,
      symptoms,
      diagnosis,
      notes,
      suggestedTests
    });

    // Update appointment status to completed
    await Appointment.findByIdAndUpdate(appointmentId, { 
       status: 'Completed', 
       queueStatus: 'Done' 
    });

    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error saving prescription' });
  }
};

// @desc    Get EHR Timeline (aggregated data)
// @route   GET /api/clinical/ehr/:patientId
// @access  Private (Doctor)
exports.getEHRTimeline = async (req, res) => {
    try {
      const { patientId } = req.params;
      
      const [patient, pastAppointments, prescriptions, recentVitals] = await Promise.all([
        Patient.findById(patientId),
        Appointment.find({ patient: patientId, status: 'Completed' })
                   .populate('doctor', 'firstName lastName specialisation')
                   .sort({ appointmentDate: -1 })
                   .limit(10),
        Prescription.find({ patient: patientId })
                    .populate('doctor', 'firstName lastName')
                    .sort({ createdAt: -1 }),
        Vitals.find({ patient: patientId }).sort({ createdAt: -1 }).limit(10)
      ]);

      if (!patient) return res.status(404).json({ error: 'Patient not found' });

      // Build integrated timeline here or just send bundles for FE to timeline
      res.json({
         patient,
         appointments: pastAppointments,
         prescriptions,
         vitals: recentVitals
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server err formatting EHR data' });
    }
};
