const Bed = require('../models/Bed');
const Patient = require('../models/Patient');

// @desc    Get all beds (Grouped by ward if needed)
// @route   GET /api/beds
// @access  Private (Admin, Nurse, Doctor)
exports.getAllBeds = async (req, res) => {
  try {
    const beds = await Bed.find()
      .populate('patient', 'firstName lastName patientId')
      .sort({ ward: 1, bedNumber: 1 });
      
    res.json(beds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving beds' });
  }
};

// @desc    Assign patient to bed OR change status
// @route   PUT /api/beds/:id
// @access  Private (Admin, Nurse)
exports.updateBedStatus = async (req, res) => {
  try {
    const { status, patientId } = req.body;
    const bed = await Bed.findById(req.params.id);

    if (!bed) return res.status(404).json({ error: 'Bed not found' });

    if (status) bed.status = status;
    
    // Assign or unassign patient
    if (patientId !== undefined) {
      if (patientId === null) {
        bed.patient = null;
        bed.status = 'Available';
      } else {
        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        bed.patient = patient._id;
        bed.status = 'Occupied';
      }
    }

    await bed.save();
    
    // Re-populate patient info for broadcast
    const updatedBed = await Bed.findById(bed._id).populate('patient', 'firstName lastName patientId');

    // Broadcast the change
    const io = req.app.get('socketio');
    if (io) {
      io.emit('bed:status_changed', updatedBed);
    }

    res.json(updatedBed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating bed' });
  }
};

// Helper: Seed beds for demo
exports.seedBeds = async (req, res) => {
  try {
    const count = await Bed.countDocuments();
    if (count > 0) return res.json({ msg: 'Beds already seeded', count });

    const bedsToInsert = [];
    const wards = ['General', 'ICU', 'Emergency'];
    wards.forEach(ward => {
       for(let i=1; i<=10; i++) {
          bedsToInsert.push({
             ward,
             bedNumber: `${ward.charAt(0)}-${String(i).padStart(2, '0')}`,
             status: i % 3 === 0 ? 'Occupied' : 'Available' // some mock occupancy
          });
       }
    });

    await Bed.insertMany(bedsToInsert);
    res.status(201).json({ msg: 'Beds seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed beds' });
  }
};
