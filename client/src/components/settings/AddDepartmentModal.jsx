import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required').toUpperCase(),
  hodRef: z.string().optional(),
  totalBeds: z.preprocess((a) => parseInt(z.string().parse(String(a)), 10), z.number().min(0, 'Cannot be negative')),
  location: z.string().optional(),
});

export default function AddDepartmentModal({ isOpen, onClose, onSave, isSaving, initialData, activeStaff = [] }) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      hodRef: '',
      totalBeds: 0,
      location: ''
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isHODOpen, setIsHODOpen] = useState(false);

  const filteredStaff = activeStaff.filter(s => 
    (s.role === 'department_head' || s.role === 'doctor') &&
    (`${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedHOD = activeStaff.find(s => s._id === initialData?.hodRef);
  
  useEffect(() => {
    if (isOpen) {
      setIsHODOpen(false);
      setSearchTerm('');
      if (initialData) {
        reset({
          name: initialData.name,
          code: initialData.code,
          hodRef: initialData.hodRef || '',
          totalBeds: initialData.totalBeds || 0,
          location: initialData.location || ''
        });
      } else {
        reset({
          name: '', code: '', hodRef: '', totalBeds: 0, location: ''
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave(initialData ? initialData._id : null, data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm shadow-2xl">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mb-[10vh]">
         <div className="flex justify-between items-center p-5 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
               {initialData ? 'Edit Department' : 'Add Department'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-md text-neutral-500">
               <X size={20} />
            </button>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div>
               <label className="block text-sm font-medium text-neutral-700 mb-1">Department Name *</label>
               <input {...register('name')} placeholder="e.g. Cardiology" className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
               {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-neutral-700 mb-1">Department Code *</label>
                 <input {...register('code')} 
                   onChange={(e) => setValue('code', e.target.value.toUpperCase(), { shouldValidate: true })} 
                   placeholder="e.g. CARDIO" 
                   className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 uppercase font-mono" />
                 {errors.code && <span className="text-xs text-red-500">{errors.code.message}</span>}
               </div>
               <div>
                 <label className="block text-sm font-medium text-neutral-700 mb-1">Total Beds</label>
                 <input type="number" {...register('totalBeds')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 font-mono" />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
               <input {...register('location')} placeholder="e.g. Block A, Floor 3" className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
            </div>

            <div className="relative">
               <label className="block text-sm font-medium text-neutral-700 mb-1">Head of Department</label>
               <input 
                  type="text" 
                  value={searchTerm || (selectedHOD ? `${selectedHOD.firstName} ${selectedHOD.lastName}` : '')}
                  placeholder="Search HOD by name..."
                  onClick={() => setIsHODOpen(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500"
               />
               <input type="hidden" {...register('hodRef')} />
               
               {isHODOpen && (
                  <div className="absolute z-60 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                     {filteredStaff.length > 0 ? (
                        filteredStaff.map(staff => (
                           <button 
                              key={staff._id} 
                              type="button"
                              onClick={() => {
                                 setValue('hodRef', staff._id);
                                 setSearchTerm(`${staff.firstName} ${staff.lastName}`);
                                 setIsHODOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-primary-50 text-sm flex flex-col transition-colors border-b last:border-0 border-neutral-50"
                           >
                              <span className="font-medium text-neutral-800">{staff.firstName} {staff.lastName}</span>
                              <span className="text-xs text-neutral-500 capitalize">{staff.role.replace('_',' ')}</span>
                           </button>
                        ))
                     ) : (
                        <div className="p-3 text-sm text-neutral-500 italic">No matching staff found.</div>
                     )}
                  </div>
               )}
               {isHODOpen && <div className="fixed inset-0 z-50 bg-black/5" onClick={() => setIsHODOpen(false)}></div>}
            </div>

            <div className="pt-4 flex justify-end gap-3 mt-6">
               <button type="button" onClick={onClose} className="px-4 py-2 border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg font-medium">Cancel</button>
               <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
                  {isSaving && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
                  {initialData ? 'Save Changes' : 'Add Department'}
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}
