import React from 'react';

const roleStyles = {
  admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  doctor: 'bg-primary-50 text-primary-700 border-primary-200',
  nurse: 'bg-teal-50 text-teal-700 border-teal-200',
  receptionist: 'bg-blue-50 text-blue-700 border-blue-200',
  lab_technician: 'bg-purple-50 text-purple-700 border-purple-200',
  pharmacist: 'bg-orange-50 text-orange-700 border-orange-200',
  department_head: 'bg-rose-50 text-rose-700 border-rose-200',
};

const labels = {
  admin: 'Admin',
  doctor: 'Doctor',
  nurse: 'Nurse',
  receptionist: 'Receptionist',
  lab_technician: 'Lab Technician',
  pharmacist: 'Pharmacist',
  department_head: 'Dep. Head',
};

export default function RoleBadge({ role }) {
  if (!role) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${roleStyles[role] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {labels[role] || role}
    </span>
  );
}
