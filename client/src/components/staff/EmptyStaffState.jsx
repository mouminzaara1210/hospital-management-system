import React from 'react';
import { Users } from 'lucide-react';

export default function EmptyStaffState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50 my-6">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full">
        <Users size={32} />
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-1">No staff members found</h3>
      <p className="text-sm text-neutral-500 mb-6 max-w-sm">
        Get started by adding your first staff member or adjust your filter criteria.
      </p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
        >
          + Add Staff Member
        </button>
      )}
    </div>
  );
}
