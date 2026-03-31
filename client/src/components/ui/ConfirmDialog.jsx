import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false
}) {
  const getButtonStyles = () => {
    if (confirmVariant === 'danger') {
      return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
    }
    return 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={!isLoading ? onCancel : undefined}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
            >
              <div className="p-6">
                <h2 id="dialog-title" className="text-lg font-semibold text-neutral-900 mb-2">
                  {title}
                </h2>
                <p id="dialog-description" className="text-sm text-neutral-500 mb-6">
                  {description}
                </p>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm flex items-center gap-2 ${getButtonStyles()} disabled:opacity-50`}
                  >
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
