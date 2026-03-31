const mongoose = require('mongoose');
const User = require('../models/User');
const StaffProfile = require('../models/StaffProfile');

const roleMapping = {
  'admin': 'Admin',
  'doctor': 'Doctor',
  'nurse': 'Nurse',
  'receptionist': 'Receptionist',
  'lab_technician': 'Lab Technician',
  'pharmacist': 'Pharmacist',
  'department_head': 'Department Head',
  'super_admin': 'Super Admin'
};

/**
 * Get all staff members with filtering and pagination
 */
exports.getAll = async (req, res) => {
  try {
    const { role, department, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    // For Department Heads, enforce restriction
    if (req.user && req.user.role === 'Department Head') {
      const currentStaffInfo = await StaffProfile.findOne({ userId: req.user._id });
      if (currentStaffInfo && currentStaffInfo.department) {
        query.department = currentStaffInfo.department;
      }
    } else if (department) {
      query.department = department; // Admin can filter
    }

    if (role) query.role = role;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await StaffProfile.countDocuments(query);
    const staff = await StaffProfile.find(query)
      .populate('department')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

    res.json({
      success: true,
      data: staff,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error fetching staff' });
  }
};

/**
 * Get single staff member by ID
 */
exports.getOne = async (req, res) => {
  try {
    const staff = await StaffProfile.findById(req.params.id).populate('department');
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found' });
    
    // Department head restriction
    if (req.user && req.user.role === 'Department Head') {
      const currentStaffInfo = await StaffProfile.findOne({ userId: req.user._id });
      if (staff.department?.toString() !== currentStaffInfo.department?.toString()) {
         return res.status(403).json({ success: false, error: 'Not authorized to view staff outside your department' });
      }
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Create a new staff member and user account transactionally
 */
exports.createStaff = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const tempPassword = `HMS@temp`;
    const userRole = roleMapping[role] || 'Admin';

    const user = new User({
      email,
      password: tempPassword,
      role: userRole,
      entityModel: 'StaffProfile',
      entityId: null // We'll update this
    });

    await user.save({ session });

    const staffProfile = new StaffProfile({
      ...req.body,
      userId: user._id,
      createdBy: req.user?._id
    });

    await staffProfile.save({ session });

    // Update user with real entityId and true password
    user.entityId = staffProfile._id;
    user.password = `HMS@${staffProfile.employeeId}`;
    await user.save({ session }); // Will trigger bcrypt hash again

    await session.commitTransaction();
    session.endSession();

    // Nodemailer mock
    console.log(`[Mock Email] Sent welcome to ${email} with password: HMS@${staffProfile.employeeId}`);

    res.status(201).json({ success: true, data: staffProfile });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Server error creating staff' });
  }
};

/**
 * Update general staff information
 */
exports.updateStaff = async (req, res) => {
  try {
    // Dept Head verification logic could go here
    const staff = await StaffProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error updating staff' });
  }
};

/**
 * Toggle active/inactive/on_leave status
 */
exports.toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const staff = await StaffProfile.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found' });

    staff.status = status;
    await staff.save();

    // Toggle isActive on User
    const user = await User.findById(staff.userId);
    if (user) {
      user.isActive = (status === 'active');
      await user.save();
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error updating status' });
  }
};

/**
 * Update weekly schedule slots
 */
exports.updateWeeklySchedule = async (req, res) => {
  try {
    const { weeklySchedule } = req.body;
    
    // Validate overlapping slots
    for (const daySchedule of weeklySchedule) {
      if (!daySchedule.slots) continue;
      const slots = daySchedule.slots.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (let i = 0; i < slots.length - 1; i++) {
        if (slots[i].endTime > slots[i+1].startTime) {
          return res.status(400).json({ success: false, error: `Overlapping slots on ${daySchedule.day}` });
        }
      }
    }

    const staff = await StaffProfile.findByIdAndUpdate(req.params.id, { weeklySchedule }, { new: true });
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found' });

    res.json({ success: true, data: staff.weeklySchedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error updating schedule' });
  }
};

/**
 * Fetch just the weekly schedule
 */
exports.getWeeklySchedule = async (req, res) => {
  try {
    const staff = await StaffProfile.findById(req.params.id).select('weeklySchedule');
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found' });
    res.json({ success: true, data: staff.weeklySchedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Get staff members by department
 */
exports.getByDepartment = async (req, res) => {
  try {
    const staff = await StaffProfile.find({ department: req.params.deptId }).select('-weeklySchedule');
    res.json({ success: true, data: staff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
