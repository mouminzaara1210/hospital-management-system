import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';

const schema = z.object({
  department: z.string().min(1, 'Department required'),
  ward: z.string().min(1, 'Ward required'),
  type: z.enum(['general','semi-private','private','icu','nicu']),
  startingNumber: z.string().min(1, 'Starting number required').regex(/^\d+$/, 'Must be numeric part'),
  count: z.preprocess((a) => parseInt(z.string().parse(String(a)), 10), z.number().min(1).max(100)),
  ratePerDay: z.preprocess((a) => parseInt(z.string().parse(String(a)), 10), z.number().min(0)),
});

export default function BulkAddBedsModal({ isOpen, onClose, onSave, isSaving, departments = [] }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { department: '', ward: '', type: 'general', startingNumber: '101', count: 5, ratePerDay: 0 }
  });

  if (!isOpen) return null;

  const count = parseInt(watch('count')) || 0;
  const startingNumber = parseInt(watch('startingNumber')) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
         <div className="flex justify-between items-center p-5 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-800">Bulk Add Beds</h2>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-md text-neutral-500">
               <X size={20} />
            </button>
         </div>

         <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-5">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ward *</label>
                  <input {...register('ward')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                  {errors.ward && <span className="text-xs text-red-500">{errors.ward.message}</span>}
               </div>
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

            <div className="grid grid-cols-2 gap-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
               <div>
                  <label className="block text-sm font-medium text-primary-800 mb-1">Starting No. *</label>
                  <input type="number" {...register('startingNumber')} className="w-full px-3 py-2 border border-primary-200 rounded font-mono" />
                  {errors.startingNumber && <span className="text-xs text-red-500">{errors.startingNumber.message}</span>}
               </div>
               <div>
                  <label className="block text-sm font-medium text-primary-800 mb-1">Count (max 100) *</label>
                  <input type="number" {...register('count')} className="w-full px-3 py-2 border border-primary-200 rounded font-mono" />
                  {errors.count && <span className="text-xs text-red-500">{errors.count.message}</span>}
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-neutral-700 mb-1">Rate Per Day</label>
               <input type="number" {...register('ratePerDay')} className="w-full px-3 py-2 border border-neutral-300 rounded font-mono" />
            </div>

            <div className="bg-neutral-50 p-3 rounded text-sm text-neutral-600">
               <strong>Preview:</strong> Beds {startingNumber} to {startingNumber + count - 1 || startingNumber} will be created.
            </div>

            <div className="pt-4 flex justify-end gap-3">
               <button type="button" onClick={onClose} className="px-4 py-2 border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg font-medium">Cancel</button>
               <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
                  {isSaving && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
                  Add {count > 0 ? count : 0} Beds
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}
