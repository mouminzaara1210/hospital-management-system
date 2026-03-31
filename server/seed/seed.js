const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { ObjectId } = mongoose.Types;

dotenv.config({ path: '../.env' }); // Assuming it's in server directory

const maleFirsts = ["Ramesh", "Suresh", "Arun", "Mohan", "Vijay", "Santosh", "Kiran", "Ajay", "Ravi", "Manoj", "Prakash", "Ganesh", "Rahul", "Deepak", "Amit", "Nikhil", "Rajesh", "Subhash", "Souvik"];
const femaleFirsts = ["Priya", "Sunita", "Ananya", "Kavita", "Geeta", "Meena", "Radha", "Savitri", "Usha", "Rekha", "Anita", "Hetal", "Pooja", "Sneha", "Divya", "Riya", "Moumita"];
const lasts = ["Sharma", "Gupta", "Singh", "Yadav", "Verma", "Mishra", "Joshi", "Krishnamurthy", "Venkataraman", "Pillai", "Nair", "Iyer", "Chandrasekaran", "Patil", "Desai", "Shah", "Mehta", "Patel", "Banerjee", "Ghosh", "Das", "Bose", "Babu", "Prasad"];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPhone = () => { const f = [6,7,8,9]; return String(randomItem(f)) + Math.floor(100000000 + Math.random() * 900000000); };
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hms';
    await mongoose.connect(mongoUri);
    console.log("🌱 Connected to MongoDB. Starting HMS Seed...");

    const db = mongoose.connection.db;

    // 1. DROP ALL COLLECTIONS
    console.log("Dropping existing collections...");
    const collections = await db.listCollections().toArray();
    for (const coll of collections) {
      await db.collection(coll.name).drop();
    }

    const today = new Date();

    // 3. DEPARTMENTS
    const depts = [
      { _id: new ObjectId(), name: "Cardiology", code: "CARDIO", location: "Block A, Floor 2", totalBeds: 25 },
      { _id: new ObjectId(), name: "Orthopaedics", code: "ORTHO", location: "Block B, Floor 1", totalBeds: 30 },
      { _id: new ObjectId(), name: "Neurology", code: "NEURO", location: "Block A, Floor 3", totalBeds: 20 },
      { _id: new ObjectId(), name: "Paediatrics", code: "PAED", location: "Children's Wing, Ground", totalBeds: 40 },
      { _id: new ObjectId(), name: "Gynaecology", code: "GYNAE", location: "Maternity Wing, Floor 1", totalBeds: 35 },
      { _id: new ObjectId(), name: "General Medicine", code: "GENMED", location: "Main Block, Ground", totalBeds: 40 },
      { _id: new ObjectId(), name: "Dermatology", code: "DERM", location: "OPD Wing, Floor 2", totalBeds: 10 },
      { _id: new ObjectId(), name: "Ophthalmology", code: "OPTHAL", location: "Eye Center, Annex", totalBeds: 15 },
      { _id: new ObjectId(), name: "ENT", code: "ENT", location: "OPD Wing, Floor 1", totalBeds: 15 },
      { _id: new ObjectId(), name: "Oncology", code: "ONCO", location: "Cancer Care Block", totalBeds: 25 },
      { _id: new ObjectId(), name: "Emergency Medicine", code: "EMRG", location: "Casualty Block, Ground", totalBeds: 20 },
      { _id: new ObjectId(), name: "Radiology", code: "RADIO", location: "Basement 1", totalBeds: 10 }
    ];
    await db.collection('departments').insertMany(depts);
    console.log(`✓ Inserted ${depts.length} departments`);

    // 4. USERS & STAFF
    const defaultHash = "$2b$10$H2l30MhhvCMyK1e3WwYFceOQfN3k9D4GvK5mR31PjIfR37SIt8m1y"; // Admin@1234
    
    const staffsToGen = [
      { role: 'Super Admin', cnt: 1, eRole: 'super_admin' },
      { role: 'Admin', cnt: 2, eRole: 'admin' },
      { role: 'Department Head', cnt: 2, eRole: 'department_head' },
      { role: 'Doctor', cnt: 12, eRole: 'doctor' },
      { role: 'Nurse', cnt: 8, eRole: 'nurse' },
      { role: 'Receptionist', cnt: 4, eRole: 'receptionist' },
      { role: 'Lab Technician', cnt: 3, eRole: 'lab_technician' },
      { role: 'Pharmacist', cnt: 2, eRole: 'pharmacist' },
      { role: 'Radiologist', cnt: 1, eRole: 'radiologist' }
    ];

    let empCounter = 1;
    const users = [];
    const staffProfiles = [];
    
    const docSpecs = depts.map(d => ({ 
      dId: d._id, 
      quals: d.name === "Cardiology" ? ["MBBS", "MD (Medicine)", "DM (Cardiology)"] : ["MBBS", "MS/MD in Specialty"] 
    }));

    let docIndex = 0;

    for (const group of staffsToGen) {
      for(let i=0; i<group.cnt; i++) {
        const uId = new ObjectId();
        const sId = new ObjectId();
        const gender = Math.random() > 0.5 ? "Male" : "Female";
        const fName = randomItem(gender === "Male" ? maleFirsts : femaleFirsts);
        const lName = randomItem(lasts);
        
        let deptId = null;
        let quals = [];
        let shift = "morning";
        
        if (group.role === 'Doctor') {
          const spec = docSpecs[docIndex % docSpecs.length];
          deptId = spec.dId;
          quals = spec.quals;
          docIndex++;
          shift = randomItem(['morning', 'afternoon', 'rotating']);
        } else if (group.role === 'Nurse') {
          deptId = randomItem(depts)._id;
          shift = randomItem(['morning', 'afternoon', 'night']);
        } else if (group.role === 'Department Head') {
          deptId = randomItem(depts)._id;
        }

        const email = (group.role === 'Super Admin' && i===0) ? 'admin@hms.com' : `${fName}.${lName}${empCounter}@apollohms.in`.toLowerCase();

        users.push({
          _id: uId, email, password: defaultHash, role: group.role,
          entityModel: 'StaffProfile', entityId: sId, isActive: true,
          createdAt: new Date(), updatedAt: new Date()
        });

        const wSched = ['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => ({
          day, slots: [
            { startTime: "09:00", endTime: "11:00", type: "consultation" },
            { startTime: "14:00", endTime: "16:00", type: group.role==='Doctor' ? "ward_round" : "duty" }
          ]
        }));

        staffProfiles.push({
          _id: sId, userId: uId, employeeId: `HMS-EMP-${String(empCounter++).padStart(4, '0')}`,
          firstName: fName, lastName: lName, role: group.eRole,
          department: deptId ? depts.find(d=>d._id.equals(deptId)).name : null,
          contactNumber: randomPhone(), gender, joinDate: randomDate(new Date(2018, 0, 1), new Date()),
          shift, qualifications: quals, status: Math.random() > 0.9 ? 'on_leave' : 'active',
          weeklySchedule: wSched,
          emergencyContact: { name: randomItem(maleFirsts) + " " + randomItem(lasts), relation: "Relation", phone: randomPhone() },
          createdAt: new Date(), updatedAt: new Date()
        });
      }
    }

    await db.collection('users').insertMany(users);
    await db.collection('staffprofiles').insertMany(staffProfiles);
    console.log(`✓ Inserted ${users.length} Staff-related records`);

    // 5. PATIENTS (50 records)
    const patients = [];
    const ptUsers = [];
    for(let i=1; i<=50; i++) {
      const uId = new ObjectId();
      const pId = new ObjectId();
      const gender = Math.random() > 0.5 ? "Male" : "Female";
      const fName = randomItem(gender === "Male" ? maleFirsts : femaleFirsts);
      const lName = randomItem(lasts);
      const email = `pt_${fName.toLowerCase()}${i}@mail.in`;

      ptUsers.push({
        _id: uId, email, password: defaultHash, role: "Patient",
        entityModel: "Patient", entityId: pId, isActive: true,
        createdAt: new Date(), updatedAt: new Date()
      });

      patients.push({
        _id: pId, userId: uId, patientId: `HMS-2024-${String(i).padStart(5, '0')}`,
        firstName: fName, lastName: lName, dateOfBirth: randomDate(new Date(1945, 0, 1), new Date(2021, 0, 1)),
        gender, contactNumber: randomPhone(), bloodGroup: randomItem(["A+", "B+", "O+", "AB+"]),
        address: { street: `${Math.floor(Math.random()*100)} Main Rd`, city: "City", state: "State", zipCode: "400001" },
        emergencyContact: { name: "Contact Name", relation: "Spouse", phone: randomPhone() },
        createdAt: new Date(), updatedAt: new Date()
      });
    }
    await db.collection('users').insertMany(ptUsers);
    await db.collection('patients').insertMany(patients);
    console.log(`✓ Inserted 50 Patients`);

    // 6. APPOINTMENTS (60 records)
    const appointments = [];
    const docsOnly = staffProfiles.filter(s => s.role === 'doctor');
    for(let i=0; i<60; i++) {
       const sts = randomItem(["pending", "confirmed", "completed", "cancelled"]);
       appointments.push({
          _id: new ObjectId(),
          patientId: randomItem(patients)._id,
          doctorId: randomItem(docsOnly)._id,
          appointmentDate: randomDate(new Date(today.getTime() - 7*86400000), new Date(today.getTime() + 7*86400000)),
          slotTime: "10:30", type: "OPD", status: sts,
          chiefComplaint: "General checkup", vitals: {},
          tokenNumber: `TKN-${100+i}`,
          createdAt: new Date(), updatedAt: new Date()
       });
    }
    await db.collection('appointments').insertMany(appointments);
    console.log(`✓ Inserted 60 Appointments`);

    // 13. HOSPITAL SETTINGS
    await db.collection('hospitalsettings').insertOne({
      key: "GLOBAL",
      profile: {
        name: "Apollo Horizon Hospital", tagline: "Healing with Heart",
        address: "14, Rajiv Gandhi Salai", city: "Chennai", state: "Tamil Nadu", pincode: "600096",
        phone: "044-4800-5000", email: "care@apollohorizon.in", website: "www.apollohorizon.in"
      },
      feeStructure: { consultationFees: [], gstPercent: 12, currency: "INR" },
      notifications: { email: { enabled: true }, inApp: { enabled: true } },
      createdAt: new Date(), updatedAt: new Date()
    });
    console.log(`✓ Inserted Hospital Settings`);

    console.log("✅ Seeding Complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  }
};

seed();
