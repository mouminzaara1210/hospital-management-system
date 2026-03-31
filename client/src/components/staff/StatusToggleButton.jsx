import React from 'react';

export default function StatusToggleButton({ value, onChange }) {
  const options = [
    { value: 'active', label: 'Active', activeClass: 'text-green-700 shadow-sm bg-white' },
    { value: 'inactive', label: 'Inactive', activeClass: 'text-red-700 shadow-sm bg-white' },
    { value: 'on_leave', label: 'On Leave', activeClass: 'text-amber-700 shadow-sm bg-white' },
  ];

  return (
    <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200 w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200
            ${value === opt.value 
              ? opt.activeClass 
              : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200'}
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
