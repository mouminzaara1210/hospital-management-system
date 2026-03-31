const express = require('express');
const router = express.Router();
const { getHospitalSnapshot } = require('../controllers/analyticsController');
const { verifyToken, authoriseRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/snapshot', authoriseRoles('Super Admin', 'Doctor'), getHospitalSnapshot);

module.exports = router;
