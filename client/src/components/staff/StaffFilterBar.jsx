import React from 'react';
import { Search } from 'lucide-react';

export default function StaffFilterBar({ filters, onFilterChange }) {
  const handleChange = (e) => {
    onFilterChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 border border-neutral-200 rounded-lg shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          name="search"
          placeholder="Search name, ID, email..."
          value={filters.search}
          onChange={handleChange}
          className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3 w-full sm:w-auto">
        {/* Role Filter */}
        <select
          name="role"
          value={filters.role}
          onChange={handleChange}
          className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border border-neutral-300 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="receptionist">Receptionist</option>
          <option value="lab_technician">Lab Technician</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="department_head">Dep. Head</option>
        </select>

        {/* Department Filter - Typically mapped from actual departments, assuming hardcoded here or placeholder if no dept selected */}
        {/* If we have dynamic depts, we'd pass them as props, but for now we'll do an open select */}
        <select
          name="department"
          value={filters.department}
          onChange={handleChange}
          className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border border-neutral-300 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Departments</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Emergency">Emergency</option>
          <option value="Administration">Administration</option>
          <option value="Laboratory">Laboratory</option>
        </select>

        {/* Status Filter */}
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border border-neutral-300 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>
    </div>
  );
}
