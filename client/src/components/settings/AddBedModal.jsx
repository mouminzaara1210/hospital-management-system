import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';

const schema = z.object({
  bedNumber: z.string().min(1, 'Bed Number required'),
  ward: z.string().min(1, 'Ward required'),
  department: z.string().min(1, 'Department required'),
  type: z.enum(['general','semi-private','private','icu','nicu']),
  ratePerDay: z.preprocess((a) => parseInt(z.string().parse(String(a)), 10), z.number().min(0, 'Cannot be negative')),
});

export default function AddBedModal({ isOpen, onClose, onSave, isSaving, initialData, departments = [] }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { bedNumber: '', ward: '', department: '', type: 'general', ratePerDay: 0 }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) reset(initialData);
      else reset({ bedNumber: '', ward: '', department: '', type: 'general', ratePerDay: 0 });
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
         <div className="flex justify-between items-center p-5 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-800">
               {initialData ? 'Edit Bed' : 'Add Bed'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-md text-neutral-500">
               <X size={20} />
            </button>
         </div>

         <form onSubmit={handleSubmit((d) => onSave(initialData?._id, d))} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Bed Number *</label>
                  <input {...register('bedNumber')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 font-mono text-primary-700" />
                  {errors.bedNumber && <span className="text-xs text-red-500">{errors.bedNumber.message}</span>}
               </div>
               <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ward *</label>
                  <input {...register('ward')} placeholder="e.g. Ward A" className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                  {errors.ward && <span className="text-xs text-red-500">{errors.ward.message}</span>}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Department *</label>
                  <select {...register('department')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                  {errors.department && <span className="text-xs text-red-500">{errors.department.message}</span>}
               </div>
               <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Bed Type *</label>
                  <select {...register('type')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 capitalize">
                    <option value="general">General</option>
                    <option value="semi-private">Semi-Private</option>
                    <option value="private">Private</option>
                    <option value="icu">ICU</option>
                    <option value="nicu">NICU</option>
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-neutral-700 mb-1">Rate Per Day</label>
               <input type="number" {...register('ratePerDay')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500 font-mono" />
               <p className="text-xs text-neutral-500 mt-1">If 0, it falls back to fee structure settings.</p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
               <button type="button" onClick={onClose} className="px-4 py-2 border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg font-medium">Cancel</button>
               <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg flex items-center gap-2">
                  {isSaving && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
                  {initialData ? 'Save Changes' : 'Add Bed'}
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}
