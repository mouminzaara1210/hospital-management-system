import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function UnsavedChangesBar({ isDirty, reset, onSave, isSaving }) {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-t border-neutral-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
        >
          <span className="text-sm font-medium text-neutral-800 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500" />
            You have unsaved changes
          </span>
          <div className="flex gap-3">
            <button 
               type="button" 
               onClick={reset}
               className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
               Discard
            </button>
            <button 
               type="button" 
               onClick={onSave}
               disabled={isSaving}
               className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
               {isSaving && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
               Save Changes
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
