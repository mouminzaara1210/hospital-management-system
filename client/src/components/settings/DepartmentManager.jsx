import React, { useState, useEffect } from 'react';
import { Layers, Edit2, PlayCircle, PauseCircle, Users, Activity } from 'lucide-react';
import AddDepartmentModal from './AddDepartmentModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { settingsService } from '../../services/settings.service';
import StatusBadge from '../staff/StatusBadge';
import { formatINR } from '../../utils/formatters';

export default function DepartmentManager({ settings, fetchSettings, activeStaff = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmStatusToggle, setConfirmStatusToggle] = useState(null);

  const departments = settings?.departments || [];

  const handleSave = async (id, payload) => {
    setIsSaving(true);
    try {
      if (id) {
         await settingsService.updateDepartment(id, payload);
      } else {
         await settingsService.addDepartment(payload);
      }
      setIsModalOpen(false);
      setEditingDept(null);
      await fetchSettings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save department');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmStatusToggle) return;
    setIsSaving(true);
    try {
      await settingsService.updateDepartment(confirmStatusToggle._id, { isActive: !confirmStatusToggle.isActive });
      setConfirmStatusToggle(null);
      await fetchSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
             <Layers size={22} className="text-primary-600" />
             Departments
          </h3>
          <p className="text-sm text-neutral-500 mt-1">Manage hospital clinical and administrative departments</p>
        </div>
        <button 
          onClick={() => { setEditingDept(null); setIsModalOpen(true); }}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm"
        >
          + Add Department
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
           <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
             <tr>
               <th className="py-3 px-6 font-medium">Code</th>
               <th className="py-3 px-6 font-medium">Name</th>
               <th className="py-3 px-6 font-medium">Head of Department</th>
               <th className="py-3 px-6 font-medium text-center">Beds</th>
               <th className="py-3 px-6 font-medium text-center">Rate/Day</th>
               <th className="py-3 px-6 font-medium">Status</th>
               <th className="py-3 px-6 font-medium text-center">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-neutral-200">
             {departments.map(dept => {
               const hod = activeStaff.find(s => s._id === dept.hodRef);
               const hodName = hod ? `${hod.firstName} ${hod.lastName}` : (dept.hodRef ? 'Unknown' : 'Not Assigned');

               return (
                 <tr key={dept._id} className={`hover:bg-neutral-50 ${dept.isActive ? '' : 'opacity-60 bg-neutral-50/50'}`}>
                   <td className="py-4 px-6 font-mono font-medium text-primary-700">{dept.code}</td>
                   <td className="py-4 px-6 font-medium text-neutral-800">{dept.name}</td>
                   <td className="py-4 px-6 text-neutral-600">{hodName}</td>
                   <td className="py-4 px-6 text-center text-neutral-600 font-mono">{dept.totalBeds}</td>
                   <td className="py-4 px-6 text-center text-neutral-600 font-mono">{formatINR(dept.bedRate || 0)}</td>
                   <td className="py-4 px-6">
                      <StatusBadge status={dept.isActive ? 'active' : 'inactive'} />
                   </td>
                   <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                         <button 
                           title="Edit"
                           onClick={() => { setEditingDept(dept); setIsModalOpen(true); }}
                           className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                         ><Edit2 size={16} /></button>
                         <button 
                           title={dept.isActive ? "Deactivate" : "Activate"}
                           onClick={() => setConfirmStatusToggle(dept)}
                           className={`p-1.5 rounded ${dept.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                         >{dept.isActive ? <PauseCircle size={16} /> : <PlayCircle size={16} />}</button>
                      </div>
                   </td>
                 </tr>
               );
             })}
             {departments.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-12 text-center text-neutral-500">
                      No departments have been configured yet.
                   </td>
                </tr>
             )}
           </tbody>
        </table>
      </div>

      <AddDepartmentModal 
         isOpen={isModalOpen}
         onClose={() => { setIsModalOpen(false); setEditingDept(null); }}
         onSave={handleSave}
         isSaving={isSaving}
         initialData={editingDept}
         activeStaff={activeStaff}
      />

      <ConfirmDialog
         isOpen={!!confirmStatusToggle}
         title={confirmStatusToggle?.isActive ? 'Deactivate Department?' : 'Activate Department?'}
         description={confirmStatusToggle?.isActive 
           ? 'This department will no longer be visible across the system for new assignments.'
           : 'This department will be marked as active and usable again.'}
         confirmLabel={confirmStatusToggle?.isActive ? 'Deactivate' : 'Activate'}
         confirmVariant={confirmStatusToggle?.isActive ? 'danger' : 'primary'}
         onConfirm={handleToggleStatus}
         onCancel={() => setConfirmStatusToggle(null)}
         isLoading={isSaving}
      />
    </div>
  );
}
