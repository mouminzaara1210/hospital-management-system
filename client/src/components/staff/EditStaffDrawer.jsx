import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save } from 'lucide-react';
import WeeklyScheduleEditor from './WeeklyScheduleEditor';

const schema = z.object({
  firstName:  z.string().min(2, 'Required'),
  lastName:   z.string().min(2, 'Required'),
  email:      z.string().email('Invalid email'),
  phone:      z.string().regex(/^[6-9]\d{9}$/, '10-digit number').optional().or(z.literal('')),
  role:       z.enum(['admin','doctor','nurse','receptionist','lab_technician','pharmacist','department_head']),
  department: z.string().min(1, 'Required'),
  gender:     z.enum(['male','female','other']).optional(),
  specialisation: z.string().optional(),
  qualifications: z.string().optional(),
  
  shiftType:   z.enum(['morning','afternoon','night','rotating']).optional(),
  startTime:   z.string().optional(),
  endTime:     z.string().optional(),
  workingDays: z.array(z.string()).optional()
});

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function EditStaffDrawer({ isOpen, staff, onClose, onSave, isSaving }) {
  const [activeTab, setActiveTab] = useState('details');
  const [weeklySchedule, setWeeklySchedule] = useState([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (staff && isOpen) {
      reset({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || 'doctor',
        department: typeof staff.department === 'object' ? staff.department?._id : (staff.department || ''),
        gender: staff.gender || 'other',
        specialisation: staff.specialisation || '',
        qualifications: staff.qualifications ? staff.qualifications.join(', ') : '',
        shiftType: staff.shift?.type || 'morning',
        startTime: staff.shift?.startTime || '09:00',
        endTime: staff.shift?.endTime || '17:00',
        workingDays: staff.shift?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      });
      setWeeklySchedule(staff.weeklySchedule || []);
      setActiveTab('details');
    }
  }, [staff, isOpen, reset]);

  if (!isOpen || !staff) return null;

  const onSubmit = (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      department: data.department,
      gender: data.gender,
      specialisation: data.specialisation,
      qualifications: data.qualifications ? data.qualifications.split(',').map(s=>s.trim()).filter(Boolean) : [],
      shift: {
        type: data.shiftType,
        startTime: data.startTime,
        endTime: data.endTime,
        workingDays: data.workingDays || []
      },
      weeklySchedule
    };

    onSave(staff._id, payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col translate-x-0 transition-transform duration-300">
        <div className="flex-none p-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div>
             <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
               Edit Staff Member
             </h2>
             <p className="text-sm font-mono text-primary-600 mt-0.5">{staff.employeeId}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-200 rounded-md text-neutral-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-none grid grid-cols-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary-600 text-primary-700 bg-primary-50/50' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'}`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('shift')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'shift' ? 'border-primary-600 text-primary-700 bg-primary-50/50' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'}`}
          >
            Shift & Schedule
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-6 flex-1">
            {activeTab === 'details' && (
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
                     <input {...register('firstName')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                     {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
                     <input {...register('lastName')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                     {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                   <input type="email" {...register('email')} className="w-full px-3 py-2 border border-neutral-300 rounded bg-neutral-50 text-neutral-500" readOnly title="Email cannot be changed directly" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                     <input {...register('phone')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
                     <select {...register('gender')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500">
                       <option value="male">Male</option>
                       <option value="female">Female</option>
                       <option value="other">Other</option>
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                     <select {...register('role')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 bg-neutral-50 cursor-not-allowed" title="Role changes must be done by sysadmin">
                       {/* Simplified: making role read-only in UI */}
                       <option value={staff.role}>{staff.role}</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-neutral-700 mb-1">Department</label>
                     <input {...register('department')} placeholder="ObjectId" className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                     {errors.department && <span className="text-xs text-red-500">{errors.department.message}</span>}
                   </div>
                 </div>

                 {watch('role') === 'doctor' && (
                    <div className="space-y-4 pt-2 border-t border-neutral-100">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Specialisation</label>
                        <input {...register('specialisation')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Qualifications (comma sep)</label>
                        <input {...register('qualifications')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                      </div>
                    </div>
                 )}
              </div>
            )}

            {activeTab === 'shift' && (
              <div className="space-y-6">
                 <div>
                   <h3 className="text-sm font-medium text-neutral-700 border-b pb-1 mb-3">General Shift</h3>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-xs text-neutral-500 mb-1">Shift Type</label>
                       <select {...register('shiftType')} className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-primary-500">
                         <option value="morning">Morning</option>
                         <option value="afternoon">Afternoon</option>
                         <option value="night">Night</option>
                         <option value="rotating">Rotating</option>
                       </select>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       <div>
                         <label className="block text-xs text-neutral-500 mb-1">Start Time</label>
                         <input type="time" {...register('startTime')} className="w-full font-mono px-3 py-2 border text-sm border-neutral-300 rounded focus:ring-primary-500" />
                       </div>
                       <div>
                         <label className="block text-xs text-neutral-500 mb-1">End Time</label>
                         <input type="time" {...register('endTime')} className="w-full font-mono px-3 py-2 border text-sm border-neutral-300 rounded focus:ring-primary-500" />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs text-neutral-500 mb-2">Working Days</label>
                       <div className="flex gap-1.5 flex-wrap">
                         {DAYS.map(day => {
                           const daysArr = watch('workingDays') || [];
                           const selected = daysArr.includes(day);
                           return (
                             <button
                               key={day}
                               type="button"
                               onClick={() => setValue('workingDays', selected ? daysArr.filter(d=>d!==day) : [...daysArr, day], { shouldDirty: true })}
                               className={`px-2.5 py-1 text-xs rounded-full transition-colors border ${selected ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-neutral-200 text-neutral-600'}`}
                             >
                               {day}
                             </button>
                           )
                         })}
                       </div>
                     </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-medium text-neutral-700 border-b pb-1 mb-3 mt-8">Weekly Individual Slots</h3>
                   <WeeklyScheduleEditor value={weeklySchedule} onChange={setWeeklySchedule} />
                 </div>
              </div>
            )}
          </div>
          
          <div className="flex-none p-5 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3 sticky bottom-0">
             <button
               type="button"
               onClick={onClose}
               className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
             >
               Cancel
             </button>
             <button
               type="submit"
               disabled={isSaving}
               className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
             >
               {isSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
               Save Changes
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
