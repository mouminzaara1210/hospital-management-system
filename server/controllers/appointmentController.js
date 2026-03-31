const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Book new appointment
// @route   POST /api/appointments
// @access  Private (Patient, Receptionist)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, slotTime, reasonForVisit } = req.body;
    let patientId;

    if (req.user.role === 'Patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      patientId = patient._id;
    } else {
      // Receptionist booking for another patient
      patientId = req.body.patientId;
    }

    if (!patientId || !doctorId || !appointmentDate || !slotTime) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Assign Token Number for OPD Queue (based on sheer count for that day)
    const normalizedDate = new Date(appointmentDate);
    normalizedDate.setHours(0, 0, 0, 0);
    
    const countToday = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: {
        $gte: normalizedDate,
        $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const tokenNumber = countToday + 1;

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      slotTime,
      reasonForVisit,
      tokenNumber,
      status: 'Confirmed'
    });

    // Fire Socket.IO event indicating a new booking (if available)
    const io = req.app.get('socketio');
    if (io) {
      io.emit('appointment:booked', appointment);
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error booking appointment' });
  }
};

// @desc    Get my appointments
// @route   GET /api/appointments/me
// @access  Private (Patient)
exports.getMyPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: 'Patient entity not found' });
    
    // Sort by most recent
    const appointments = await Appointment.find({ patient: patient._id })
      .populate('doctor', 'firstName lastName specialisation')
      .sort({ appointmentDate: -1, slotTime: -1 });
      
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving appointments' });
  }
};

// @desc    Get doctor's active appointments (today)
// @route   GET /api/appointments/doctor/queue
// @access  Private (Doctor, Nurse, Receptionist)
exports.getDoctorQueue = async (req, res) => {
  try {
    const { doctorId } = req.query; // If staff needs specific doctor
    let targetDoctorId = doctorId;

    if (req.user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      targetDoctorId = doctor._id;
    }

    if (!targetDoctorId) {
       return res.status(400).json({ error: 'Doctor ID is required' });
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const queue = await Appointment.find({
      doctor: targetDoctorId,
      appointmentDate: { $gte: today, $lt: tomorrow }
    })
    .populate('patient', 'firstName lastName patientId')
    .sort({ tokenNumber: 1 });

    res.json(queue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving queue' });
  }
};

// @desc    Update appointment status (e.g. calling token)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor, Nurse, Receptionist)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, queueStatus } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (status) appointment.status = status;
    if (queueStatus) appointment.queueStatus = queueStatus;
    
    await appointment.save();

    // Broadcast queue update via Socket.io
    const io = req.app.get('socketio');
    if (io && queueStatus === 'Calling') {
      io.emit('queue:token_called', { 
        tokenNumber: appointment.tokenNumber, 
        doctorId: appointment.doctor 
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating appointment' });
  }
};
