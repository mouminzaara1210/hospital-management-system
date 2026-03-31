import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';
import StaffLayout from './layouts/StaffLayout';
import PatientLayout from './layouts/PatientLayout';

// Base Pages
import Login from './pages/Login';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import RegistrationWizard from './pages/patient/Registration';
import Booking from './pages/patient/Booking';
import Billing from './pages/patient/Billing';

// Shared Pages
import Profile from './pages/shared/Profile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import EHRSystem from './pages/doctor/EHRSystem';
import PrescriptionWriter from './pages/doctor/PrescriptionWriter';

// Staff Pages
import OPDQueue from './pages/staff/OPDQueue';
import VitalsEntry from './pages/staff/VitalsEntry';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import BedManagement from './pages/admin/BedManagement';
import StaffDirectory from './pages/admin/StaffDirectory';
import StaffProfile from './pages/admin/StaffProfile';
import SystemSettings from './pages/admin/SystemSettings';

// Placeholder component for WIP pages
function WIPPage({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md w-full">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-medical-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500">{description || 'This module is under active development and will be available soon.'}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Department Head']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="beds" element={<BedManagement />} />
          <Route path="staff" element={<StaffDirectory />} />
          <Route path="staff/:id" element={<StaffProfile />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DoctorDashboard />} />
          <Route path="ehr/:patientId" element={<EHRSystem />} />
          <Route path="prescription/:patientId" element={<PrescriptionWriter />} />
          <Route path="patients" element={<WIPPage title="My Patients" description="View all patients assigned to you, their history and upcoming appointments." />} />
          <Route path="ai-assist" element={<WIPPage title="AI Clinical Assistant" description="Gemini-powered AI to assist with differential diagnosis, drug interactions, and clinical notes." />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['Nurse', 'Receptionist']}>
            <StaffLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/staff/queue" replace />} />
          <Route path="queue" element={<OPDQueue />} />
          <Route path="ward" element={<VitalsEntry />} />
          <Route path="reception" element={<OPDQueue />} />
          <Route path="labs" element={<WIPPage title="Lab Orders" description="View and manage lab test requests and results for ward patients." />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Patient Routes */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }>
          <Route path="registration" element={<RegistrationWizard />} />
          <Route path="booking" element={<Booking />} />
          <Route path="billing" element={<Billing />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Root Profile Catch */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Department Head', 'Doctor', 'Nurse', 'Receptionist', 'Patient']}>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
