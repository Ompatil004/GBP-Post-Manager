import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

export default function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]} text-sm transition-all duration-200 my-3 shadow-sm`}
    >
      {icons[type]}
      <div className="flex-1 font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
          aria-label="Close message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
