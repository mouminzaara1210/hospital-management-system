import React from 'react';

export default function StatusBadge({ status }) {
  const statusStyles = {
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-red-50 text-red-700 border-red-200',
    on_leave: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const label = {
    active: 'Active',
    inactive: 'Inactive',
    on_leave: 'On Leave',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusStyles[status] || statusStyles.active}`}>
      {label[status] || 'Active'}
    </span>
  );
}
