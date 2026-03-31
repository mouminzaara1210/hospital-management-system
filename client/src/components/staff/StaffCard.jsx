import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Building2, GraduationCap, AlertCircle, Calendar, Hash, Clock } from 'lucide-react';
import { format } from 'date-fns';

const StaffTooltipContent = ({ staff, todaySlots = [] }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h4 className="font-semibold text-neutral-900 font-sora">{staff.firstName} {staff.lastName}</h4>
        <p className="text-sm text-neutral-500 capitalize">{staff.role.replace('_', ' ')}</p>
      </div>

      {/* Contact */}
      <div>
        <h5 className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1">Contact</h5>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <Mail size={14} className="text-neutral-400" />
            <span className="truncate">{staff.userId?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <Phone size={14} className="text-neutral-400" />
            <span>{staff.contactNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Work */}
      <div>
        <h5 className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1">Work</h5>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <Building2 size={14} className="text-neutral-400" />
            <span className="truncate">{staff.department || 'Not Assigned'}</span>
          </div>
          {staff.role === 'doctor' && staff.qualifications && (
             <div className="flex items-start gap-2 text-sm text-neutral-700">
               <GraduationCap size={14} className="text-neutral-400 shrink-0 mt-0.5" />
               <span className="break-words">{staff.qualifications.join(', ')}</span>
             </div>
          )}
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <Clock size={14} className="text-neutral-400" />
            <span className="capitalize">{staff.shift || 'Flexible'} Shift</span>
          </div>
        </div>
      </div>

      {/* Today's Slots */}
      {staff.role === 'doctor' && (
        <div>
          <h5 className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1">Today's Slots</h5>
          {todaySlots.length > 0 ? (
            <div className="space-y-1">
              {todaySlots.map((slot, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="font-mono text-neutral-600">{slot.startTime}–{slot.endTime}</span>
                  <span className="text-neutral-700 capitalize">{slot.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 italic">No slots scheduled today</p>
          )}
        </div>
      )}

      {/* Emergency Contact */}
      {staff.emergencyContact && staff.emergencyContact.name && (
        <div className="pt-2 border-t border-neutral-100">
          <h5 className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1">Emergency Contact</h5>
          <div className="flex items-start gap-2 text-sm text-neutral-700">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <div>
               <p className="font-medium">{staff.emergencyContact.name}</p>
               <p className="text-neutral-500">{staff.emergencyContact.relation} · {staff.emergencyContact.phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function StaffCard({ staff, openEditDrawer }) {
  const navigate = useNavigate();

  // Color mapping based on role
  const getRoleColors = (role) => {
    switch (role) {
      case 'doctor': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'nurse': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'department_head': return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'admin': return 'bg-neutral-800 text-neutral-100 border-neutral-700';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const getInitials = (first, last) => `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;

  // Find today's slots if available
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = staff.weeklySchedule?.find(s => s.day === todayName);
  const todaySlots = todaySchedule?.slots || [];

  return (
    <div className="group relative">
      <div 
        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100 w-full overflow-hidden flex flex-col justify-between"
        role="article"
        aria-label={`Staff profile: ${staff.firstName} ${staff.lastName}, ${staff.role}`}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/admin/staff/${staff._id}`)}
      >
        {/* Status Dot */}
        <span 
          className="absolute top-4 right-4 flex items-center gap-1.5 z-10"
          aria-label={`Status: ${staff.status}`}
        >
          <span className="relative flex h-2.5 w-2.5">
            {staff.status === 'active' && (
              <span className="status-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              staff.status === 'active' ? 'bg-emerald-500' :
              staff.status === 'on_leave' ? 'bg-amber-400' : 'bg-neutral-300'
            }`} />
          </span>
          <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
            {staff.status === 'active' ? 'Active' : staff.status === 'on_leave' ? 'On Leave' : 'Inactive'}
          </span>
        </span>

        {/* Top Section */}
        <div className="p-6 pb-5 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center text-primary-900 font-semibold text-xl mb-4 shadow-sm border-2 border-white">
            {staff.photoUrl ? (
              <img src={staff.photoUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(staff.firstName, staff.lastName)
            )}
          </div>
          
          <h3 className="font-sora font-semibold text-[15px] mb-1 text-neutral-900">
            {staff.firstName} {staff.lastName}
          </h3>
          
          <div className={`mt-1 mb-2 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getRoleColors(staff.role)}`}>
            {staff.role.replace('_', ' ')}
          </div>
          
          <p className="text-sm text-neutral-500 truncate w-full px-2" title={staff.department}>
            {staff.department || 'No Dept Assigned'}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-neutral-100"></div>

        {/* Bottom Meta */}
        <div className="p-5 pt-4 space-y-2.5 bg-neutral-50/50 flex-grow relative">
          <div className="flex items-center gap-2.5 text-sm text-neutral-600">
            <div className="w-5 flex justify-center"><Hash size={15} className="text-neutral-400" /></div>
            <span className="font-mono text-xs">{staff.employeeId}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-neutral-600">
            <div className="w-5 flex justify-center"><Calendar size={15} className="text-neutral-400" /></div>
            <span className="text-xs">Joined {staff.joinDate ? format(new Date(staff.joinDate), 'dd MMM yyyy') : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-neutral-600">
            <div className="w-5 flex justify-center"><Clock size={15} className="text-neutral-400" /></div>
            <span className="text-xs capitalize">{staff.shift || 'Flexible'} Shift</span>
          </div>

          {/* Hover Actions Overlay */}
          <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-white via-white/95 to-white/70 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 px-4 backdrop-blur-[1px]">
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/admin/staff/${staff._id}`); }}
              aria-label={`View profile for ${staff.firstName}`}
              className="px-3 py-1.5 bg-primary-600 text-white hover:bg-primary-700 text-xs font-medium rounded-md shadow-sm transition-colors w-full"
            >
              View Profile
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); openEditDrawer(staff); }}
              aria-label={`Edit staff ${staff.firstName}`}
              className="px-3 py-1.5 border border-primary-200 text-primary-700 hover:bg-primary-50 text-xs font-medium rounded-md transition-colors w-full"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Custom Tooltip Overlay */}
      <div className="absolute left-full ml-3 top-0 z-50 w-72 rounded-xl bg-white border border-neutral-200 shadow-[0_8px_32px_rgba(139,92,246,0.15)] p-4 text-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 hidden xl:block">
        <StaffTooltipContent staff={staff} todaySlots={todaySlots} />
        <div className="absolute left-[-6px] top-8 w-3 h-3 bg-white border-l border-b border-neutral-200 rotate-45"></div>
      </div>
    </div>
  );
}
