import React, { useState, useEffect, useCallback } from 'react';
import StaffTable from '../../components/staff/StaffTable';
import StaffFilterBar from '../../components/staff/StaffFilterBar';
import AddStaffModal from '../../components/staff/AddStaffModal';
import EditStaffDrawer from '../../components/staff/EditStaffDrawer';
import EmptyStaffState from '../../components/staff/EmptyStaffState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StaffGrid from '../../components/staff/StaffGrid';
import { LayoutGrid, List } from 'lucide-react';

// 🔥 MOCK DATA
const mockStaff = [
  { _id: "1", firstName: "Arjun", lastName: "Mehta", role: "doctor", status: "active" },
  { _id: "2", firstName: "Priya", lastName: "Sharma", role: "doctor", status: "active" },
  { _id: "3", firstName: "Kavya", lastName: "Nair", role: "nurse", status: "active" },
  { _id: "4", firstName: "Rahul", lastName: "Verma", role: "staff", status: "on_leave" },
  { _id: "5", firstName: "Niranjna", lastName: "Karthikeyan", role: "nurse", status: "on_leave" },
  { _id: "6", firstName: "Moumin", lastName: "Zaara", role: "doctor", status: "active" },
  { _id: "7", firstName: "Sneha", lastName: "Kumar", role: "Patient", status: "on_leave" },
  { _id: "8", firstName: "Anita", lastName: "Singh", role: "nurse", status: "active" }
];

export default function StaffDirectory() {
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({ total: 0, doctors: 0, nurses: 0, onLeave: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    department: '',
    status: ''
  });

  const [viewMode, setViewMode] = useState('grid');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);

  const [statusToggleItem, setStatusToggleItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 FILTER LOGIC (THIS FIXES YOUR SEARCH)
  const fetchStaff = useCallback(() => {
    setIsLoading(true);

    const search = filters.search.toLowerCase();

    const data = mockStaff.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();

      return (
        (!search || fullName.includes(search) || s.role.includes(search)) &&
        (!filters.role || s.role === filters.role) &&
        (!filters.status || s.status === filters.status)
      );
    });

    setStaff(data);

    const active = data.filter(s => s.status === 'active');
    const docs = active.filter(s => s.role === 'doctor').length;
    const nurses = active.filter(s => s.role === 'nurse').length;
    const onLeave = data.filter(s => s.status === 'on_leave').length;

    setStats({
      total: active.length,
      doctors: docs,
      nurses,
      onLeave
    });

    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Staff Directory</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {staff.length} staff members across your hospital
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          + Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-xs">Total Active</p>
          <p className="text-2xl">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-xs">Doctors</p>
          <p className="text-2xl">{stats.doctors}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-xs">Nurses</p>
          <p className="text-2xl">{stats.nurses}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-xs text-orange-500">On Leave</p>
          <p className="text-2xl">{stats.onLeave}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <StaffFilterBar
            filters={filters}
            onFilterChange={(newFilters) =>
              setFilters(prev => ({ ...prev, ...newFilters }))
            }
          />
        </div>

        <div className="flex bg-neutral-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('grid')}>
            <LayoutGrid size={16} /> Grid
          </button>
          <button onClick={() => setViewMode('table')}>
            <List size={16} /> Table
          </button>
        </div>
      </div>

      {/* Content */}
      {staff.length === 0 ? (
        <EmptyStaffState onAdd={() => setIsAddModalOpen(true)} />
      ) : viewMode === 'table' ? (
        <StaffTable staff={staff} isLoading={isLoading} />
      ) : (
        <StaffGrid staff={staff} isLoading={isLoading} />
      )}

      {/* Modals */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={() => {}}
        isSaving={isSaving}
      />

      <EditStaffDrawer
        isOpen={!!editStaff}
        staff={editStaff}
        onClose={() => setEditStaff(null)}
        onSave={() => {}}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={!!statusToggleItem}
        onConfirm={() => setStatusToggleItem(null)}
        onCancel={() => setStatusToggleItem(null)}
      />
    </div>
  );
}