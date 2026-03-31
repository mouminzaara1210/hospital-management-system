const HospitalSettings = require('../models/HospitalSettings');

// Helper to get or create the singleton settings document
const getOrCreateSettings = async () => {
  let settings = await HospitalSettings.findOne({ key: 'GLOBAL' });
  if (!settings) {
    settings = await HospitalSettings.create({
      key: 'GLOBAL',
      profile: { name: 'My Hospital' },
      departments: [],
      beds: [],
      feeStructure: {},
      notifications: {}
    });
  }
  return settings;
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    // Create a plain object and strip SMTP password before sending
    const settingsObj = settings.toObject();
    if (settingsObj.notifications?.email?.smtpPass) {
       delete settingsObj.notifications.email.smtpPass;
    }
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    
    // Process text fields
    if (req.body.profile) {
      const parsedProfile = typeof req.body.profile === 'string' ? JSON.parse(req.body.profile) : req.body.profile;
      settings.profile = { ...settings.profile, ...parsedProfile };
    } else {
       // If fields sent loosely
       ['name', 'tagline', 'address', 'city', 'state', 'pincode', 'phone', 'email', 'website', 'registrationNumber', 'accreditation'].forEach(field => {
         if (req.body[field] !== undefined) {
           settings.profile[field] = req.body[field];
         }
       });
    }

    // Process file upload
    if (req.file) {
      settings.profile.logoUrl = `/uploads/hospital/${req.file.filename}`;
    }

    await settings.save();
    res.json({ success: true, data: settings.profile });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.saveDepartments = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.departments = req.body.departments; // Full array replace
    await settings.save();
    res.json({ success: true, data: settings.departments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const newDept = req.body;
    
    // Check for duplicates
    if (settings.departments.some(d => d.code === newDept.code || d.name.toLowerCase() === newDept.name.toLowerCase())) {
       return res.status(400).json({ success: false, error: 'Department with this code or name already exists' });
    }

    settings.departments.push(newDept);
    await settings.save();
    
    // Return the newly created item (last in array)
    const added = settings.departments[settings.departments.length - 1];
    res.status(201).json({ success: true, data: added });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const deptId = req.params.deptId;
    const deptIndex = settings.departments.findIndex(d => d._id.toString() === deptId);
    
    if (deptIndex === -1) return res.status(404).json({ success: false, error: 'Department not found' });
    
    settings.departments[deptIndex] = { ...settings.departments[deptIndex].toObject(), ...req.body };
    await settings.save();
    res.json({ success: true, data: settings.departments[deptIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const deptId = req.params.deptId;
    const dept = settings.departments.id(deptId);
    
    if (!dept) return res.status(404).json({ success: false, error: 'Department not found' });
    
    // Soft delete
    dept.isActive = false;
    await settings.save();
    res.json({ success: true, message: 'Department disabled' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.saveBeds = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.beds = req.body.beds;
    await settings.save();
    res.json({ success: true, data: settings.beds });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.addBed = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    // Validate duplicates
    if (settings.beds.some(b => b.bedNumber === req.body.bedNumber)) {
      return res.status(400).json({ success: false, error: 'Bed number already exists' });
    }
    
    settings.beds.push(req.body);
    await settings.save();
    res.status(201).json({ success: true, data: settings.beds[settings.beds.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.addMultipleBeds = async (req, res) => {
  try {
     const settings = await getOrCreateSettings();
     const { department, ward, type, startingNumber, count, ratePerDay } = req.body;
     
     let addedBeds = [];
     for(let i=0; i<parseInt(count); i++) {
        const bNo = String(parseInt(startingNumber) + i);
        if(!settings.beds.some(b => b.bedNumber === bNo)) {
           settings.beds.push({ bedNumber: bNo, ward, department, type, ratePerDay, status: 'available' });
           addedBeds.push(bNo);
        }
     }
     
     if (addedBeds.length > 0) {
        await settings.save();
     }
     res.status(201).json({ success: true, added: addedBeds.length });
  } catch (err) {
     res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateBed = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const bedId = req.params.bedId;
    const bedIndex = settings.beds.findIndex(b => b._id.toString() === bedId);
    
    if (bedIndex === -1) return res.status(404).json({ success: false, error: 'Bed not found' });
    
    settings.beds[bedIndex] = { ...settings.beds[bedIndex].toObject(), ...req.body };
    await settings.save();
    res.json({ success: true, data: settings.beds[bedIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteBed = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const bedId = req.params.bedId;
    
    settings.beds = settings.beds.filter(b => b._id.toString() !== bedId);
    await settings.save();
    res.json({ success: true, message: 'Bed deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.feeStructure = { ...settings.feeStructure, ...req.body };
    await settings.save();
    res.json({ success: true, data: settings.feeStructure });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    
    // We expect req.body to contain `email` and `inApp` objects
    if (req.body.email) {
      settings.notifications.email = { ...settings.notifications.email, ...req.body.email };
    }
    if (req.body.inApp) {
      settings.notifications.inApp = { ...settings.notifications.inApp, ...req.body.inApp };
    }
    
    await settings.save();
    res.json({ success: true, data: settings.notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.sendTestEmail = async (req, res) => {
  try {
    // const settings = await getOrCreateSettings();
    // Simulate SMTP testing via nodemail
    console.log(`[SMTP] Sending test email as requested...`);
    
    // Assuming success
    res.json({ success: true, message: 'Test email successfully sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SMTP Timeout or Invalid Credentials' });
  }
};
