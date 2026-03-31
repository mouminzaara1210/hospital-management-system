const express = require('express');
const router = express.Router();
const { 
  getAllBeds, 
  updateBedStatus,
  seedBeds
} = require('../controllers/bedController');
const { verifyToken, authoriseRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', authoriseRoles('Super Admin', 'Doctor', 'Nurse'), getAllBeds);
router.put('/:id', authoriseRoles('Super Admin', 'Nurse'), updateBedStatus);
router.post('/seed', authoriseRoles('Super Admin'), seedBeds); // Helper endpoint

module.exports = router;
