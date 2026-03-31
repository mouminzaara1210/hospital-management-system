const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Bed = require('../models/Bed');

// @desc    Get Key Metrics (Snapshot)
// @route   GET /api/analytics/snapshot
// @access  Private (Admin, Doctor)
exports.getHospitalSnapshot = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const matchToday = {
       appointmentDate: { $gte: today, $lt: tomorrow }
    };

    const appointmentsToday = await Appointment.countDocuments(matchToday);
    
    // Aggregation for Daily Appointments By Department / Doctor
    const hourlyAppointmentsRaw = await Appointment.aggregate([
      { $match: matchToday },
      { 
         $project: { 
            hour: { $substr: ["$slotTime", 0, 2] } // Primitive group by slot hour string ('09', '10')
         }
      },
      {
         $group: {
            _id: "$hour",
            count: { $sum: 1 }
         }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for Recharts
    const hourlyAppointments = hourlyAppointmentsRaw.map(h => ({
      name: `${h._id}:00`,
      appointments: h.count
    }));

    // Mock Revenue Snapshot over last 7 days (Or real aggregation if billing populated)
    const revenueSnapshot = [
       { name: 'Mon', Revenue: 4000 },
       { name: 'Tue', Revenue: 3000 },
       { name: 'Wed', Revenue: 2000 },
       { name: 'Thu', Revenue: 2780 },
       { name: 'Fri', Revenue: 1890 },
       { name: 'Sat', Revenue: 2390 },
       { name: 'Sun', Revenue: 3490 },
    ];

    // Doctor Availability Profile
    const doctors = await Doctor.find().select('firstName lastName specialisation status');

    // Bed Utilization
    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: 'Occupied' });
    const bedUtilization = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;

    res.json({
       appointmentsToday,
       hourlyAppointments: hourlyAppointments.length > 0 ? hourlyAppointments : [
          { name: '09:00', appointments: 5 }, { name: '10:00', appointments: 8 }, { name: '11:00', appointments: 12 }
       ], // Fallback data
       revenueSnapshot,
       doctors,
       bedUtilization
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving analytics' });
  }
};
