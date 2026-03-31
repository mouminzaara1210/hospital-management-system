import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Eye, Pencil, PlayCircle, PauseCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import RoleBadge from './RoleBadge';
import ShiftBadge from './ShiftBadge';
import StatusBadge from './StatusBadge';

const roleColor = {
  admin: 'bg-indigo-500',
  doctor: 'bg-primary-500',
  nurse: 'bg-teal-500',
  receptionist: 'bg-blue-500',
  lab_technician: 'bg-purple-500',
  pharmacist: 'bg-orange-500',
  department_head: 'bg-rose-500',
};

const IconButton = ({ icon: Icon, tooltip, onClick, variant = 'primary-ghost' }) => {
  const baseClasses = "p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variantClasses = {
    'primary-ghost': 'text-primary-600 hover:bg-primary-50 hover:text-primary-700 focus:ring-primary-500',
    'danger-ghost': 'text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-red-500',
    'success-ghost': 'text-green-600 hover:bg-green-50 hover:text-green-700 focus:ring-green-500',
    'neutral-ghost': 'text-neutral-500 hover:bg-neutral-100 focus:ring-neutral-400'
  };

  return (
    <button 
      title={tooltip} 
      onClick={onClick} 
      className={`${baseClasses} ${variantClasses[variant] || variantClasses['primary-ghost']}`}
    >
      <Icon size={18} />
    </button>
  );
};

export default function StaffTable({ 
  staff = [], 
  isLoading, 
  onViewProfile, 
  onEditStaff, 
  onToggleStatus 
}) {
  const navigate = useNavigate();

  const columns = React.useMemo(() => [
    {
      accessorKey: 'employeeId',
      header: 'Employee ID',
      cell: info => (
        <span className="font-mono text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
          {info.getValue() || 'N/A'}
        </span>
      ),
    },
    {
      id: 'name',
      header: 'Name',
      accessorFn: row => `${row.firstName} ${row.lastName}`,
      cell: info => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${roleColor[row.role] || 'bg-neutral-400'}`} />
            <div>
              <span className="font-medium text-neutral-800 block">{info.getValue()}</span>
              {row.email && <span className="text-xs text-neutral-500">{row.email}</span>}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: info => <RoleBadge role={info.getValue()} />
    },
    {
      id: 'department',
      accessorFn: row => row.department?.name || row.departmentName || 'N/A',
      header: 'Department',
      cell: info => <span className="text-sm text-neutral-600">{info.getValue()}</span>
    },
    {
      accessorKey: 'shift',
      header: 'Shift',
      cell: info => {
        const shift = info.getValue() || {};
        const time = shift.startTime && shift.endTime ? `${shift.startTime}-${shift.endTime}` : 'Variable';
        return <ShiftBadge shift={shift.type} time={time} />;
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const row = info.row.original;
        const isActive = row.status === 'active';
        return (
          <div className="flex items-center gap-1">
            <IconButton 
               icon={Eye} 
               tooltip="View profile" 
               onClick={() => onViewProfile(row)} 
               variant="neutral-ghost"
            />
            <IconButton 
               icon={Pencil} 
               tooltip="Edit" 
               onClick={() => onEditStaff(row)} 
               variant="primary-ghost"
            />
            <IconButton
              icon={isActive ? PauseCircle : PlayCircle}
              tooltip={isActive ? 'Deactivate' : 'Activate'}
              variant={isActive ? 'danger-ghost' : 'success-ghost'}
              onClick={() => onToggleStatus(row)}
            />
          </div>
        );
      }
    }
  ], [onViewProfile, onEditStaff, onToggleStatus]);

  const table = useReactTable({
    data: staff,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border border-neutral-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id} 
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {staff.length === 0 && !isLoading && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-neutral-500">
                No staff members match the filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
