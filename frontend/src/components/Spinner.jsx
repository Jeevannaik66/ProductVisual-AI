import React from 'react';

// Simple reusable spinner component. Use fullScreen to render centered full view or inline when false.
export default function Spinner({ fullScreen = true, size = 16, colorClass = 'border-blue-600' }) {
  const spinner = (
    <div
      className={`inline-block rounded-full animate-spin border-4 border-transparent border-t-current ${colorClass}`}
      style={{ width: `${size}px`, height: `${size}px`, borderTopColor: 'currentColor' }}
      aria-hidden="true"
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="p-2 rounded-full bg-transparent">
          <div className="w-16 h-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-800 border-t-blue-600 dark:border-t-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return spinner;
}
