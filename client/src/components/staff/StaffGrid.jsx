import React from 'react';
import StaffCard from './StaffCard';

export default function StaffGrid({ staff = [], isLoading, onEditStaff }) {
  if (isLoading) {
    return (
      <div className="flex justify-center flex-col items-center py-12 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="sr-only" aria-live="polite">Loading staff directory...</p>
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="text-center py-12 text-neutral-500 bg-white rounded-lg border border-neutral-200" role="status" aria-label="No staff found">
        No staff members match the filters.
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      aria-label={`Staff directory — ${staff.length} members`}
    >
      {staff.map(member => (
        <StaffCard 
          key={member._id} 
          staff={member} 
          openEditDrawer={onEditStaff} 
        />
      ))}
    </div>
  );
}
