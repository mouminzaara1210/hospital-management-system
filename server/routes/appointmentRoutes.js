const express = require('express');
const router = express.Router();
const { 
  bookAppointment, 
  getMyPatientAppointments, 
  getDoctorQueue, 
  updateAppointmentStatus 
} = require('../controllers/appointmentController');
const { verifyToken, authoriseRoles } = require('../middleware/auth');

router.use(verifyToken);

// Booking Endpoint
router.post('/', authoriseRoles('Patient', 'Receptionist'), bookAppointment);

// Patient specific endpoint
router.get('/me', authoriseRoles('Patient'), getMyPatientAppointments);

// Doctor / Queue specific endpoint
router.get('/doctor/queue', authoriseRoles('Doctor', 'Receptionist', 'Nurse', 'Super Admin'), getDoctorQueue);

// Update status
router.put('/:id/status', authoriseRoles('Doctor', 'Receptionist', 'Nurse'), updateAppointmentStatus);

module.exports = router;
