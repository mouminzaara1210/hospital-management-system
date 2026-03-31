const User = require('../models/User');
const StaffProfile = require('../models/StaffProfile');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Get current logged in user details (populated)
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    let entityData = null;
    if (user.entityModel === 'StaffProfile') {
      entityData = await StaffProfile.findById(user.entityId);
    } else if (user.entityModel === 'Doctor') {
      entityData = await Doctor.findById(user.entityId);
    } else if (user.entityModel === 'Patient') {
      entityData = await Patient.findById(user.entityId);
    }

    res.json({ user, entity: entityData });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

// @desc    Update current logged in user details
// @route   PATCH /api/users/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let entityModel;
    if (user.entityModel === 'StaffProfile') entityModel = StaffProfile;
    else if (user.entityModel === 'Doctor') entityModel = Doctor;
    else if (user.entityModel === 'Patient') entityModel = Patient;
    else return res.status(400).json({ error: 'Unknown entity model' });

    // Ensure they only update safe fields like contact info, gender, dob, etc.
    const allowedFields = ['firstName', 'lastName', 'contactNumber', 'gender', 'bloodGroup', 'dateOfBirth'];
    
    // Address updates
    let updatePayload = { ...req.body };
    // Filter payload to only allowed keys inside top level (if restricting)
    
    const updatedEntity = await entityModel.findByIdAndUpdate(
      user.entityId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    res.json({ success: true, entity: updatedEntity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user profile', details: err.message });
  }
};

// @desc    Change Password
// @route   PATCH /api/users/me/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect old password' });

    user.password = newPassword;
    await user.save(); // pre-save hook handles hashing

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// @desc    Update Notification Preferences
// @route   PATCH /api/users/me/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Using a virtual object mapping or extending user schema.
    // Assuming we add a `preferences` object to the User schema.
    if (!user.preferences) user.preferences = {};
    
    // Update preferences (email, inApp, etc)
    user.preferences = { ...user.preferences, ...req.body };
    user.markModified('preferences');
    await user.save();

    res.json({ success: true, preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// @desc    Get role-specific quick stats
// @route   GET /api/users/me/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    // Generate mock stats for now depending on role
    // For a real app, we would query Appointments, Admissions, etc based on user.entityId
    const role = req.user.role;
    let stats = {};

    if (role === 'Doctor') {
      stats = { patientsToday: 8, appointmentsThisWeek: 42, dept: 'Cardiology' };
    } else if (role === 'Nurse') {
      stats = { patientsInWard: 24, vitalsLoggedToday: 48, assignedWard: 'General A' };
    } else if (role === 'Receptionist') {
      stats = { appointmentsBooked: 112, queueHandled: 45 };
    } else if (role === 'Super Admin' || role === 'Admin') {
      stats = { staffManaged: 35, departmentsActive: 12, bedsActive: 120 };
    }

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};
