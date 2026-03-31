const express = require('express');
const router = express.Router();
const { 
  logVitals, 
  getPatientVitals, 
  createPrescription, 
  getEHRTimeline 
} = require('../controllers/clinicalController');
const { verifyToken, authoriseRoles } = require('../middleware/auth');

router.use(verifyToken);

// Vitals
router.post('/vitals', authoriseRoles('Nurse', 'Doctor', 'Super Admin'), logVitals);
router.get('/vitals/:patientId', authoriseRoles('Nurse', 'Doctor', 'Super Admin'), getPatientVitals);

// Prescriptions
router.post('/prescriptions', authoriseRoles('Doctor'), createPrescription);

// EHR Timeline
router.get('/ehr/:patientId', authoriseRoles('Doctor', 'Super Admin'), getEHRTimeline);

module.exports = router;
