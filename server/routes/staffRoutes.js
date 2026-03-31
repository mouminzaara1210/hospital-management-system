const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { verifyToken, authoriseRoles } = require('../middleware/auth');

// Protect all routes
router.use(verifyToken);
router.use(authoriseRoles('Admin', 'Super Admin', 'Department Head'));

router.route('/')
  .get(staffController.getAll)
  .post(staffController.createStaff);

router.route('/:id')
  .get(staffController.getOne)
  .put(staffController.updateStaff);

router.patch('/:id/status', staffController.toggleStatus);

router.route('/:id/schedule')
  .get(staffController.getWeeklySchedule)
  .put(staffController.updateWeeklySchedule);

router.get('/department/:deptId', staffController.getByDepartment);

module.exports = router;
