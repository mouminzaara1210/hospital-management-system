import React, { useState } from 'react';
import { BedDouble, Edit2, PlayCircle, PauseCircle, Trash2, CalendarDays } from 'lucide-react';
import AddBedModal from './AddBedModal';
import BulkAddBedsModal from './BulkAddBedsModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { settingsService } from '../../services/settings.service';
import StatusBadge from '../staff/StatusBadge';

export default function BedManager({ settings, fetchSettings }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const beds = settings?.beds || [];
  const departments = settings?.departments || [];

  const handleSaveBed = async (id, payload) => {
    setIsSaving(true);
    try {
      if (id) {
         await settingsService.updateBed(id, payload);
      } else {
         await settingsService.addBed(payload);
      }
      setIsAddOpen(false);
      setEditingBed(null);
      await fetchSettings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save bed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkSave = async (payload) => {
    setIsSaving(true);
    try {
      const res = await settingsService.addMultipleBeds(payload);
      setIsBulkOpen(false);
      alert(`Successfully added ${res.added} beds`);
      await fetchSettings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to add beds bulk');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBed = async () => {
    if (!confirmDelete) return;
    setIsSaving(true);
    try {
      await settingsService.deleteBed(confirmDelete._id);
      setConfirmDelete(null);
      await fetchSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
             <BedDouble size={22} className="text-primary-600" />
             Bed Management
          </h3>
          <p className="text-sm text-neutral-500 mt-1">Manage physical beds and ward mappings</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBulkOpen(true)}
            className="px-4 py-2 border border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium rounded-lg text-sm shadow-sm transition-colors"
          >
            Bulk Add
          </button>
          <button 
            onClick={() => { setEditingBed(null); setIsAddOpen(true); }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors"
          >
            + Add Bed
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left border-collapse text-sm">
           <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 sticky top-0 z-10">
             <tr>
               <th className="py-3 px-6 font-medium">Bed No.</th>
               <th className="py-3 px-6 font-medium">Department</th>
               <th className="py-3 px-6 font-medium">Ward</th>
               <th className="py-3 px-6 font-medium">Type</th>
               <th className="py-3 px-6 font-medium text-center">Rate</th>
               <th className="py-3 px-6 font-medium text-center">Status</th>
               <th className="py-3 px-6 font-medium text-center">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-neutral-200">
             {beds.map(bed => {
               const dept = departments.find(d => d._id === bed.department) || { name: 'Unknown' };
               return (
                 <tr key={bed._id} className="hover:bg-neutral-50 transition-colors">
                   <td className="py-3 px-6 font-mono font-medium text-primary-700">{bed.bedNumber}</td>
                   <td className="py-3 px-6 text-neutral-800">{dept.name}</td>
                   <td className="py-3 px-6 text-neutral-600">{bed.ward}</td>
                   <td className="py-3 px-6 text-neutral-600 capitalize">{bed.type?.replace('-',' ')}</td>
                   <td className="py-3 px-6 text-center font-mono text-neutral-600">{bed.ratePerDay ? `₹${bed.ratePerDay}` : '-'}</td>
                   <td className="py-3 px-6 text-center">
                     <span className={`px-2 py-0.5 rounded text-xs font-medium border ${bed.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' : bed.status === 'occupied' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {bed.status}
                     </span>
                   </td>
                   <td className="py-3 px-6 text-center">
                      <div className="flex justify-center gap-1">
                         <button 
                           title="Edit"
                           onClick={() => { setEditingBed(bed); setIsAddOpen(true); }}
                           className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                         ><Edit2 size={16} /></button>
                         <button 
                           title="Delete"
                           onClick={() => setConfirmDelete(bed)}
                           className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                         ><Trash2 size={16} /></button>
                      </div>
                   </td>
                 </tr>
               );
             })}
             {beds.length === 0 && (
                <tr>
                   <td colSpan={7} className="py-12 text-center text-neutral-500">
                      No beds added yet. Use Bulk Add to configure multiple beds at once.
                   </td>
                </tr>
             )}
           </tbody>
        </table>
      </div>

      <AddBedModal 
         isOpen={isAddOpen}
         onClose={() => { setIsAddOpen(false); setEditingBed(null); }}
         onSave={handleSaveBed}
         isSaving={isSaving}
         initialData={editingBed}
         departments={departments}
      />

      <BulkAddBedsModal
         isOpen={isBulkOpen}
         onClose={() => setIsBulkOpen(false)}
         onSave={handleBulkSave}
         isSaving={isSaving}
         departments={departments}
      />

      <ConfirmDialog
         isOpen={!!confirmDelete}
         title="Delete Bed?"
         description={`Are you sure you want to delete Bed ${confirmDelete?.bedNumber}? This action cannot be undone.`}
         confirmLabel="Delete Bed"
         confirmVariant="danger"
         onConfirm={handleDeleteBed}
         onCancel={() => setConfirmDelete(null)}
         isLoading={isSaving}
      />
    </div>
  );
}
