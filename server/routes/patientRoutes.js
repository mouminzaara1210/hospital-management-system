const express = require('express');
const router = express.Router();
const { getPatientProfile, updatePatientProfile, getAllPatients, getAllDoctors } = require('../controllers/patientController');
const { verifyToken, authoriseRoles } = require('../middleware/auth');

// All patient routes require authentication
router.use(verifyToken);

router.route('/me')
  .get(authoriseRoles('Patient'), getPatientProfile)
  .put(authoriseRoles('Patient'), updatePatientProfile);

// Staff access to the patient index
router.route('/')
  .get(authoriseRoles('Super Admin', 'Doctor', 'Receptionist', 'Nurse'), getAllPatients);

// Doctors list for dropdowns (accessible by all authenticated roles)
router.get('/doctors', authoriseRoles('Patient', 'Super Admin', 'Doctor', 'Receptionist', 'Nurse'), getAllDoctors);

module.exports = router;

