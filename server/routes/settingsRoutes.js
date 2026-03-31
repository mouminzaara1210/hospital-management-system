const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// ❌ REMOVE auth import (not needed now)
// const { verifyToken, authoriseRoles } = require('../middleware/auth');

const settingsController = require('../controllers/settingsController');

// Setup multer for logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/hospital/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + Date.now() + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG allowed'));
    }
  }
});


// ✅ NO AUTH — everything open

router.get('/', settingsController.getSettings);

router.put('/profile', upload.single('logo'), settingsController.updateProfile);

router.route('/departments')
  .put(settingsController.saveDepartments)
  .post(settingsController.addDepartment);

router.route('/departments/:deptId')
  .put(settingsController.updateDepartment)
  .delete(settingsController.deleteDepartment);

router.route('/beds')
  .put(settingsController.saveBeds)
  .post(settingsController.addBed);

router.post('/beds/bulk', settingsController.addMultipleBeds);

router.route('/beds/:bedId')
  .put(settingsController.updateBed)
  .delete(settingsController.deleteBed);

router.put('/fees', settingsController.updateFeeStructure);
router.put('/notifications', settingsController.updateNotificationSettings);
router.post('/notifications/test-email', settingsController.sendTestEmail);

module.exports = router;