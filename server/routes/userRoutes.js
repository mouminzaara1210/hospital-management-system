const express = require('express');
const router = express.Router();
const { getMe, updateMe, changePassword, updatePreferences, getStats } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.route('/me')
  .get(getMe)
  .patch(updateMe);

router.patch('/me/password', changePassword);
router.patch('/me/preferences', updatePreferences);
router.get('/me/stats', getStats);

module.exports = router;
