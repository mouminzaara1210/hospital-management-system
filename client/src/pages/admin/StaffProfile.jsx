import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin, Building2, Calendar, Edit2, PlayCircle, PauseCircle } from 'lucide-react';
import { staffService } from '../../services/staff.service';
import RoleBadge from '../../components/staff/RoleBadge';
import StatusBadge from '../../components/staff/StatusBadge';
import WeeklyScheduleViewer from '../../components/staff/WeeklyScheduleViewer';
import EditStaffDrawer from '../../components/staff/EditStaffDrawer';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [staff, setStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await staffService.getOne(id);
      if (res.success) setStaff(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchStaff();
  }, [id]);

  const handleUpdate = async (editedId, payload) => {
    setIsSaving(true);
    try {
      await staffService.updateStaff(editedId, payload);
      setIsEditOpen(false);
      fetchStaff();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    setIsSaving(true);
    try {
      const newStatus = staff.status === 'active' ? 'inactive' : 'active';
      await staffService.toggleStatus(staff._id, newStatus);
      setIsStatusConfirmOpen(false);
      fetchStaff();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-b-2 border-primary-600 rounded-full animate-spin"></div></div>;
  }
  if (!staff) {
    return <div className="p-6">Staff member not found.</div>;
  }

  const initials = `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase();
  const departmentName = staff.department?.name || staff.departmentName || staff.department || 'Unassigned';

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/admin/staff')} 
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors w-max"
      >
        <ChevronLeft size={16} /> Directory
      </button>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-primary-50 to-white border border-neutral-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary-200 text-primary-800 rounded-full flex items-center justify-center text-3xl font-semibold shadow-inner border border-primary-100 flex-none">
                 {initials}
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-neutral-900 mb-2 flex items-center gap-3">
                   {staff.firstName} {staff.lastName}
                   <RoleBadge role={staff.role} />
                 </h2>
                 <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600">
                    <span className="flex items-center gap-1.5"><Building2 size={16} className="text-neutral-400" /> {departmentName}</span>
                    <span className="flex items-center gap-1.5 font-mono text-primary-700 bg-primary-100/50 px-1.5 py-0.5 rounded">{staff.employeeId}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={16} className="text-neutral-400" /> Joined {new Date(staff.dateOfJoining).toLocaleDateString()}</span>
                    <StatusBadge status={staff.status} />
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-3 md:pt-2">
              <button 
                onClick={() => setIsEditOpen(true)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <Edit2 size={16} /> Edit Staff
              </button>
              <button 
                onClick={() => setIsStatusConfirmOpen(true)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm ${staff.status === 'active' ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}
              >
                {staff.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                {staff.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN - 60% */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 border-b pb-2">Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                 <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Email Address</label>
                    <div className="flex items-center gap-2 text-neutral-800"><Mail size={16} className="text-neutral-400" /> {staff.email}</div>
                 </div>
                 <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                    <div className="flex items-center gap-2 text-neutral-800"><Phone size={16} className="text-neutral-400" /> {staff.phone || 'N/A'}</div>
                 </div>
                 <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Gender</label>
                    <div className="text-neutral-800 capitalize">{staff.gender || 'Not specified'}</div>
                 </div>
                 {staff.specialisation && (
                   <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Specialisation</label>
                      <div className="text-neutral-800">{staff.specialisation}</div>
                   </div>
                 )}
              </div>
              
              {staff.qualifications?.length > 0 && (
                 <div className="mt-6">
                    <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Qualifications</label>
                    <div className="flex flex-wrap gap-2">
                       {staff.qualifications.map((q, i) => (
                         <span key={i} className="px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs rounded-lg font-medium">
                           {q}
                         </span>
                       ))}
                    </div>
                 </div>
              )}
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 border-b pb-2">Weekly Schedule</h3>
              <WeeklyScheduleViewer schedule={staff.weeklySchedule} />
           </div>
        </div>

        {/* RIGHT COLUMN - 40% */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 border-b pb-2">Shift Information</h3>
              <div className="space-y-5">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Shift Type</span>
                    <span className="font-medium text-neutral-800 capitalize bg-neutral-100 px-2 py-1 rounded text-xs">{staff.shift?.type || 'Not assigned'}</span>
                 </div>
                 
                 <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                    <div className="text-center w-full">
                       <span className="block text-xs text-neutral-500 mb-1">Start Time</span>
                       <span className="font-mono text-lg text-neutral-800 font-semibold">{staff.shift?.startTime || '--:--'}</span>
                    </div>
                    <div className="w-px h-8 bg-neutral-300"></div>
                    <div className="text-center w-full">
                       <span className="block text-xs text-neutral-500 mb-1">End Time</span>
                       <span className="font-mono text-lg text-neutral-800 font-semibold">{staff.shift?.endTime || '--:--'}</span>
                    </div>
                 </div>

                 <div>
                    <span className="block text-sm text-neutral-500 mb-2">Working Days</span>
                    <div className="flex flex-wrap gap-1.5">
                       {staff.shift?.workingDays?.map(day => (
                         <span key={day} className="px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 text-xs rounded-full font-medium shadow-sm">
                           {day}
                         </span>
                       ))}
                       {(!staff.shift?.workingDays || staff.shift.workingDays.length === 0) && (
                         <span className="text-sm text-neutral-400">No working days set</span>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 border-b pb-2">Emergency Contact</h3>
              {staff.emergencyContact?.name ? (
                <div className="space-y-4">
                  <div>
                     <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Contact Name</label>
                     <div className="text-neutral-800 font-medium">{staff.emergencyContact.name}</div>
                  </div>
                  <div>
                     <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                     <div className="flex items-center gap-2 text-neutral-800"><Phone size={16} className="text-neutral-400" /> {staff.emergencyContact.phone || 'N/A'}</div>
                  </div>
                  {staff.emergencyContact.relation && (
                    <div>
                       <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Relation</label>
                       <div className="text-neutral-800">{staff.emergencyContact.relation}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-neutral-400">No emergency contact information provided.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <EditStaffDrawer 
        isOpen={isEditOpen}
        staff={staff}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdate}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        title={staff.status === 'active' ? "Deactivate Staff Member?" : "Activate Staff Member?"}
        description={staff.status === 'active' 
          ? `${staff.firstName} ${staff.lastName} will lose access to the system immediately.`
          : `${staff.firstName} ${staff.lastName} will regain access to the system.`
        }
        confirmLabel={staff.status === 'active' ? "Yes, Deactivate" : "Yes, Activate"}
        confirmVariant={staff.status === 'active' ? "danger" : "primary"}
        onConfirm={handleStatusToggle}
        onCancel={() => setIsStatusConfirmOpen(false)}
        isLoading={isSaving}
      />
    </div>
  );
}
