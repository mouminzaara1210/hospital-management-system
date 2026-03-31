import React from 'react';

export default function ToggleSwitch({ checked, onChange, disabled, id, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onKeyDown={e => e.key === ' ' && onChange(!checked)}
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${checked ? 'bg-primary-600' : 'bg-neutral-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className={`
        absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow pointer-events-none
        transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      `} />
    </button>
  );
}
