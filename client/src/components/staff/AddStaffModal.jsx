import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import WeeklyScheduleEditor from './WeeklyScheduleEditor';

const step1Schema = z.object({
  firstName:  z.string().min(2, 'Minimum 2 characters'),
  lastName:   z.string().min(2, 'Minimum 2 characters'),
  email:      z.string().email('Invalid email address'),
  phone:      z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
  role:       z.enum(['admin','doctor','nurse','receptionist','lab_technician','pharmacist','department_head']),
  department: z.string().min(1, 'Select a department'),
  gender:     z.enum(['male','female','other']).optional(),
  specialisation: z.string().optional(),
  qualifications: z.string().optional(), // We'll parse this into array later
  dateOfJoining: z.string().optional()
});

const step2Schema = z.object({
  shiftType:   z.enum(['morning','afternoon','night','rotating']),
  startTime:   z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional(),
  endTime:     z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional(),
  workingDays: z.array(z.string()).min(1, 'Select at least one working day'),
}).superRefine((data, ctx) => {
  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["endTime"],
    });
  }
});

const step3Schema = z.object({
  emergencyName: z.string().min(2, 'Required'),
  emergencyPhone: z.string().regex(/^[6-9]\d{9}$/, '10-digit number').optional().or(z.literal('')),
  emergencyRelation: z.string().optional(),
});

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AddStaffModal({ isOpen, onClose, onSave, isSaving }) {
  const [step, setStep] = useState(1);
  const [weeklySchedule, setWeeklySchedule] = useState([]);

  const form1 = useForm({ resolver: zodResolver(step1Schema), defaultValues: { role: 'doctor', gender: 'other' } });
  const form2 = useForm({ resolver: zodResolver(step2Schema), defaultValues: { shiftType: 'morning', workingDays: ['Mon','Tue','Wed','Thu','Fri'] } });
  const form3 = useForm({ resolver: zodResolver(step3Schema) });

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setWeeklySchedule([]);
      form1.reset({ role: 'doctor', gender: 'other', firstName: '', lastName: '', email: '', phone: '', department: '', specialisation: '', qualifications: '', dateOfJoining: '' });
      form2.reset({ shiftType: 'morning', workingDays: ['Mon','Tue','Wed','Thu','Fri'], startTime: '', endTime: '' });
      form3.reset({ emergencyName: '', emergencyPhone: '', emergencyRelation: '' });
    }
  }, [isOpen, form1, form2, form3]);

  if (!isOpen) return null;

  const handleNext1 = async () => {
    const valid = await form1.trigger();
    if (valid) setStep(2);
  };

  const handleNext2 = async () => {
    const valid = await form2.trigger();
    if (valid) setStep(3);
  };

  const onSubmit = async () => {
    const valid = await form3.trigger();
    if (!valid) return;

    const data1 = form1.getValues();
    const data2 = form2.getValues();
    const data3 = form3.getValues();

    const payload = {
      firstName: data1.firstName,
      lastName: data1.lastName,
      email: data1.email,
      phone: data1.phone,
      role: data1.role,
      department: data1.department,
      gender: data1.gender,
      specialisation: data1.specialisation,
      dateOfJoining: data1.dateOfJoining ? new Date(data1.dateOfJoining) : new Date(),
      qualifications: data1.qualifications ? data1.qualifications.split(',').map(s=>s.trim()).filter(Boolean) : [],
      shift: {
        type: data2.shiftType,
        startTime: data2.startTime,
        endTime: data2.endTime,
        workingDays: data2.workingDays
      },
      weeklySchedule,
      emergencyContact: {
        name: data3.emergencyName,
        phone: data3.emergencyPhone,
        relation: data3.emergencyRelation
      }
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto w-full h-full" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-800">Add Staff Member</h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-md text-neutral-500">
             <X size={20} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="pt-6 pb-2 px-8">
           <div className="flex items-center gap-2">
             <div className="flex items-center text-sm font-medium">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>1</div>
                <span className={step >= 1 ? 'text-neutral-900' : 'text-neutral-500'}>Personal Info</span>
             </div>
             <div className="flex-1 h-0.5 bg-neutral-200"><div className="h-full bg-primary-600 transition-all" style={{ width: step > 1 ? '100%' : '0%' }}></div></div>
             <div className="flex items-center text-sm font-medium">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>2</div>
                <span className={step >= 2 ? 'text-neutral-900' : 'text-neutral-500'}>Shift</span>
             </div>
             <div className="flex-1 h-0.5 bg-neutral-200"><div className="h-full bg-primary-600 transition-all" style={{ width: step > 2 ? '100%' : '0%' }}></div></div>
             <div className="flex items-center text-sm font-medium">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>3</div>
                <span className={step >= 3 ? 'text-neutral-900' : 'text-neutral-500'}>Emergency</span>
             </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
           {step === 1 && (
             <form className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-neutral-700 mb-1">First Name *</label>
                   <input {...form1.register('firstName')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                   {form1.formState.errors.firstName && <span className="text-xs text-red-500">{form1.formState.errors.firstName.message}</span>}
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name *</label>
                   <input {...form1.register('lastName')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                   {form1.formState.errors.lastName && <span className="text-xs text-red-500">{form1.formState.errors.lastName.message}</span>}
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                   <input type="email" {...form1.register('email')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                   {form1.formState.errors.email && <span className="text-xs text-red-500">{form1.formState.errors.email.message}</span>}
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                   <input {...form1.register('phone')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
                   <select {...form1.register('gender')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500">
                     <option value="male">Male</option>
                     <option value="female">Female</option>
                     <option value="other">Other</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-neutral-700 mb-1">Date of Joining</label>
                   <input type="date" {...form1.register('dateOfJoining')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-neutral-700 mb-1">Role *</label>
                   <select {...form1.register('role')} className="w-full px-3 py-2 border border-neutral-300 rounded flex-1 focus:ring-primary-500 focus:border-primary-500">
                      <option value="admin">Admin</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="lab_technician">Lab Technician</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="department_head">Dep. Head</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-neutral-700 mb-1">Department *</label>
                   <input {...form1.register('department')} placeholder="ObjectId later" className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                    {form1.formState.errors.department && <span className="text-xs text-red-500">{form1.formState.errors.department.message}</span>}
                 </div>
               </div>

               {form1.watch('role') === 'doctor' && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Specialisation</label>
                      <input {...form1.register('specialisation')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Qualifications (comma sep)</label>
                      <input {...form1.register('qualifications')} placeholder="e.g. MBBS, MD" className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                    </div>
                  </div>
               )}
             </form>
           )}

           {step === 2 && (
             <form className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-neutral-800 border-b pb-2">Shift Configuration</h3>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Shift Type *</label>
                    <select {...form2.register('shiftType')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500">
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
                      <option value="rotating">Rotating</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Start Time (HH:MM)</label>
                      <input type="time" {...form2.register('startTime')} className="w-full flex-1 px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">End Time (HH:MM)</label>
                      <input type="time" {...form2.register('endTime')} className="w-full flex-1 px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Working Days</label>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map(day => {
                        const selected = form2.watch('workingDays')?.includes(day);
                        return (
                          <button 
                            key={day}
                            type="button"
                            onClick={() => {
                              const curr = form2.getValues('workingDays') || [];
                              form2.setValue('workingDays', selected ? curr.filter(d=>d!==day) : [...curr, day], { shouldValidate: true });
                            }}
                            className={`px-3 py-1 text-sm rounded-full transition-colors border ${selected ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                    {form2.formState.errors.workingDays && <span className="text-xs text-red-500 block mt-1">{form2.formState.errors.workingDays.message}</span>}
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="font-medium text-neutral-800 border-b pb-2">Weekly Schedule (Slots)</h3>
                  <WeeklyScheduleEditor value={weeklySchedule} onChange={setWeeklySchedule} />
                </div>
             </form>
           )}

           {step === 3 && (
             <form className="space-y-4">
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-neutral-800 border-b pb-2">Emergency Contact Info</h3>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Contact Name *</label>
                    <input {...form3.register('emergencyName')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                    {form3.formState.errors.emergencyName && <span className="text-xs text-red-500">{form3.formState.errors.emergencyName.message}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                      <input {...form3.register('emergencyPhone')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Relation</label>
                      <input {...form3.register('emergencyRelation')} placeholder="e.g. Spouse, Parent" className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg text-sm">
                  <h4 className="font-medium text-neutral-800 mb-2">Review Details</h4>
                  <p className="text-neutral-600 mb-1"><span className="font-medium text-neutral-800">Name:</span> {form1.getValues('firstName')} {form1.getValues('lastName')}</p>
                  <p className="text-neutral-600 mb-1"><span className="font-medium text-neutral-800">Role:</span> <span className="capitalize">{form1.getValues('role').replace('_',' ')}</span></p>
                  <p className="text-neutral-600 mb-1"><span className="font-medium text-neutral-800">Email:</span> {form1.getValues('email')}</p>
                  <p className="text-neutral-600"><span className="font-medium text-neutral-800">Shift:</span> <span className="capitalize">{form2.getValues('shiftType')}</span></p>
                </div>
             </form>
           )}
        </div>

        <div className="p-4 border-t border-neutral-200 flex justify-between bg-neutral-50 rounded-b-xl">
           {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg font-medium"
              >Back</button>
           ) : <div />}
           
           {step < 3 ? (
             <button 
               type="button" 
               onClick={step === 1 ? handleNext1 : handleNext2}
               className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium"
             >Next</button>
           ) : (
             <button 
               type="button" 
               onClick={onSubmit}
               disabled={isSaving}
               className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium shadow-sm flex items-center gap-2"
             >
               {isSaving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>}
               Add Staff Member
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
