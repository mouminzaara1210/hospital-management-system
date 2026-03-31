const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

// Generate JWT Tokens
const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

// @desc    Register a new user (Usually Patient self-reg or Admin creates staff)
// @route   POST /api/auth/register
// @access  Public (Patient) / Private (Admin for others)
exports.register = async (req, res) => {
  const { 
    email, password, role, 
    firstName, lastName, dateOfBirth, gender, contactNumber // Patient specifics
  } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Role mapping
    let entityModelMap = {
      'Patient': 'Patient',
      'Doctor': 'Doctor',
      'Receptionist': 'Staff',
      'Nurse': 'Staff',
      'Super Admin': 'Staff'
    };

    if (!entityModelMap[role]) {
      return res.status(400).json({ error: 'Invalid User Role' });
    }

    const savedUser = await User.create({
      email,
      password,
      role,
      entityModel: entityModelMap[role],
    });

    let savedEntity;

    if (role === 'Patient') {
      const patientIdSequence = Math.floor(10000 + Math.random() * 90000); // Dummy seq maker
      const patientId = `HMS-${new Date().getFullYear()}-${patientIdSequence}`;
      
      savedEntity = await Patient.create({
        userId: savedUser._id,
        patientId,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        contactNumber
      });
    } else if (role === 'Doctor') {
      // Stub for Admin creation of doctor
      savedEntity = await Doctor.create({
        userId: savedUser._id,
        firstName, lastName,
        specialisation: req.body.specialisation || 'General' 
      });
    } else {
      // Rest of Staff
      savedEntity = await Staff.create({
        userId: savedUser._id,
        firstName, lastName,
        department: 'General'
      });
    }

    // Attach entity reference back to User
    savedUser.entityId = savedEntity._id;
    await savedUser.save();

    const { accessToken, refreshToken } = generateTokens(savedUser._id);
    res.status(201).json({
      success: true,
      message: `${role} registered successfully.`,
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        entityId: savedEntity._id
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @desc    User Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Usually you'd set refresh token in an HTTP-only cookie here
    // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        entityId: user.entityId,
        entityModel: user.entityModel
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
};
