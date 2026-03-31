import React from 'react';
import { Clock } from 'lucide-react';

const shiftColors = {
  morning:   "bg-amber-50   text-amber-700   border-amber-200",
  afternoon: "bg-sky-50     text-sky-700     border-sky-200",
  night:     "bg-violet-50  text-violet-700  border-violet-200",
  rotating:  "bg-neutral-50 text-neutral-600 border-neutral-200",
};

const shiftLabel = {
  morning:   "Morning",
  afternoon: "Afternoon",
  night:     "Night",
  rotating:  "Rotating",
};

export default function ShiftBadge({ shift, time }) {
  if (!shift) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${shiftColors[shift]}`}>
      <Clock size={10} />
      {shiftLabel[shift]}  ·  {time}
    </span>
  );
}
