import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SLOT_TYPES = [
  { value: 'consultation', label: 'Consultation', bg: 'bg-primary-100', text: 'text-primary-700', border: 'border-l-2 border-primary-500' },
  { value: 'ward_round', label: 'Ward Round', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-l-2 border-teal-500' },
  { value: 'surgery', label: 'Surgery', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-l-2 border-rose-500' },
  { value: 'off', label: 'Off', bg: 'bg-neutral-100', text: 'text-neutral-600', border: 'border-l-2 border-neutral-300' }
];

const hasOverlap = (slots, newStart, newEnd) => {
  return slots.some(slot => 
    (newStart >= slot.startTime && newStart < slot.endTime) ||
    (newEnd > slot.startTime && newEnd <= slot.endTime) ||
    (newStart <= slot.startTime && newEnd >= slot.endTime)
  );
};

export default function WeeklyScheduleEditor({ value, onChange, error }) {
  // schedule structure: [{day: 'Mon', slots: [{startTime, endTime, type}]}]
  const schedule = Array.isArray(value) ? value : [];
  
  const [activeDay, setActiveDay] = useState(null);
  const [newSlot, setNewSlot] = useState({ startTime: '09:00', endTime: '10:00', type: 'consultation' });
  const [slotError, setSlotError] = useState('');

  const handleAddSlot = (day) => {
    setSlotError('');
    if (newSlot.startTime >= newSlot.endTime) {
       setSlotError('End time must be after start time.');
       return;
    }

    const daySchedule = schedule.find(s => s.day === day);
    const existingSlots = daySchedule ? daySchedule.slots : [];

    if (hasOverlap(existingSlots, newSlot.startTime, newSlot.endTime)) {
      setSlotError('This slot overlaps with an existing slot.');
      return;
    }

    // copy slots and add new one
    const updatedSlots = [...existingSlots, { ...newSlot }].sort((a,b) => a.startTime.localeCompare(b.startTime));
    
    // update parent state
    const newSchedule = schedule.filter(s => s.day !== day);
    newSchedule.push({ day, slots: updatedSlots });
    onChange(newSchedule);
    
    // reset mode
    setActiveDay(null);
  };

  const handleRemoveSlot = (day, slotIndex) => {
    const daySchedule = schedule.find(s => s.day === day);
    if (!daySchedule) return;

    const updatedSlots = daySchedule.slots.filter((_, idx) => idx !== slotIndex);
    const newSchedule = schedule.filter(s => s.day !== day);
    if (updatedSlots.length > 0) {
      newSchedule.push({ day, slots: updatedSlots });
    }
    onChange(newSchedule);
  };

  return (
    <div className="w-full">
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {slotError && <div className="text-sm text-red-600 mb-2">{slotError}</div>}
      
      <div className="grid grid-cols-7 border border-neutral-200 rounded-lg overflow-hidden bg-white">
        {/* Header Row */}
        {DAYS.map(day => (
          <div key={`header-${day}`} className="py-2 text-center text-sm font-medium bg-neutral-50 border-r border-b border-neutral-200">
            {day}
          </div>
        ))}

        {/* Slots Row */}
        {DAYS.map(day => {
          const dayData = schedule.find(s => s.day === day);
          const slots = dayData ? dayData.slots : [];

          return (
             <div 
               key={`col-${day}`} 
               className="p-1 min-h-[150px] border-r border-neutral-200 group relative flex flex-col gap-1 hover:bg-neutral-50"
             >
               {slots.map((slot, idx) => {
                 const typeDef = SLOT_TYPES.find(t => t.value === slot.type) || SLOT_TYPES[0];
                 return (
                   <div key={idx} className={`relative p-1.5 rounded-r text-[10px] ${typeDef.bg} ${typeDef.border} overflow-hidden group/slot`}>
                      <div className="flex justify-between items-start">
                        <span className={`font-medium ${typeDef.text}`}>{typeDef.label}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSlot(day, idx)}
                          className={`opacity-0 group-hover/slot:opacity-100 hover:text-red-500`}
                        >
                           <X size={10} />
                        </button>
                      </div>
                      <span className="text-neutral-500 font-mono mt-0.5 block">
                        {slot.startTime} - {slot.endTime}
                      </span>
                   </div>
                 );
               })}

               {/* Click to add slot trigger */}
               {activeDay !== day ? (
                  <button 
                    type="button"
                    onClick={() => { setActiveDay(day); setSlotError(''); }}
                    className="mt-1 w-full flex items-center justify-center p-2 border border-dashed border-neutral-300 rounded text-neutral-400 hover:text-primary-600 hover:border-primary-300 transition-colors opacity-0 group-hover:opacity-100"
                  >
                     <Plus size={16} />
                  </button>
               ) : (
                 <div className="mt-1 p-2 bg-white border shadow-sm rounded flex flex-col gap-2 z-10 relative">
                    <select 
                      className="text-xs p-1 border rounded"
                      value={newSlot.type}
                      onChange={e => setNewSlot({...newSlot, type: e.target.value})}
                    >
                      {SLOT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <div className="flex gap-1">
                       <input 
                         type="time" 
                         className="w-full text-xs p-1 border rounded font-mono"
                         value={newSlot.startTime}
                         onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
                       />
                       <input 
                         type="time" 
                         className="w-full text-xs p-1 border rounded font-mono"
                         value={newSlot.endTime}
                         onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
                       />
                    </div>
                    <div className="flex gap-1">
                      <button 
                        type="button" 
                        onClick={() => handleAddSlot(day)}
                        className="flex-1 bg-primary-600 text-white text-xs py-1 rounded hover:bg-primary-700"
                      >Add</button>
                      <button 
                        type="button"
                        onClick={() => setActiveDay(null)}
                        className="flex-1 bg-neutral-100 text-neutral-600 text-xs py-1 rounded hover:bg-neutral-200"
                      >Cancel</button>
                    </div>
                 </div>
               )}
             </div>
          );
        })}
      </div>
    </div>
  );
}
