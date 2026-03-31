import React from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SLOT_TYPES = {
  consultation: { bg: 'bg-primary-100', border: 'border-l-2 border-primary-500', text: 'text-primary-700', label: 'Consultation' },
  ward_round: { bg: 'bg-teal-50', border: 'border-l-2 border-teal-500', text: 'text-teal-700', label: 'Ward Round' },
  surgery: { bg: 'bg-rose-50', border: 'border-l-2 border-rose-500', text: 'text-rose-700', label: 'Surgery' },
  off: { bg: 'bg-neutral-100', border: 'border-l-2 border-neutral-300', text: 'text-neutral-600', label: 'Off' }
};

// Calculate duration in minutes between "HH:MM" and "HH:MM"
const getDuration = (start, end) => {
  if (!start || !end) return 60; // Default 1 hr
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
};

export default function WeeklyScheduleViewer({ schedule = [] }) {
  // Map schedule to a dictionary by day
  const scheduleMap = DAYS.reduce((acc, day) => {
    const dayData = schedule.find(s => s.day === day);
    acc[day] = dayData ? dayData.slots : [];
    return acc;
  }, {});

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
      <div className="grid grid-cols-7 divide-x divide-neutral-200 bg-neutral-50 border-b border-neutral-200">
        {DAYS.map(day => (
           <div key={`header-${day}`} className="py-2 text-center text-sm font-medium text-neutral-600">
             {day}
           </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-neutral-200 bg-white min-h-[300px]">
        {DAYS.map(day => {
          const slots = scheduleMap[day];
          const hasSlots = slots && slots.length > 0;
          
          return (
            <div key={`col-${day}`} className="p-1 flex flex-col gap-1">
              {!hasSlots ? (
                <div className="h-full w-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-neutral-100 rounded text-neutral-400 text-xs text-center">
                  Day off
                </div>
              ) : (
                slots.map((slot, idx) => {
                  const duration = getDuration(slot.startTime, slot.endTime);
                  const pxHeight = Math.max(32, duration); // 1px = 1 minute as requested
                  const type = SLOT_TYPES[slot.type] || SLOT_TYPES.consultation;
                  
                  return (
                    <div 
                      key={idx}
                      className={`w-full rounded-r p-1.5 flex flex-col overflow-hidden ${type.bg} ${type.border}`}
                      style={{ height: `${pxHeight}px`, minHeight: '32px' }}
                    >
                      <span className={`text-[10px] font-medium leading-tight truncate ${type.text}`}>
                        {type.label}
                      </span>
                      <span className="text-[9px] text-neutral-500 leading-tight">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
