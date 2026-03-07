import React from 'react';

export default function Notification({ message, type }) {
  const bgMap = {
    emergency: 'from-red-500/20 to-orange-500/20 border-red-500/40',
    success: 'from-green-500/20 to-emerald-500/20 border-green-500/40',
    info: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40',
    error: 'from-red-500/20 to-red-600/20 border-red-500/40',
  };

  const iconMap = {
    emergency: '🚨',
    success: '✅',
    info: 'ℹ️',
    error: '❌',
  };

  return (
    <div className={`toast-enter glass rounded-xl px-4 py-3 bg-gradient-to-r ${bgMap[type] || bgMap.info} border shadow-2xl max-w-sm`}>
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">{iconMap[type] || iconMap.info}</span>
        <p className="text-sm font-medium text-white/90 leading-snug">{message}</p>
      </div>
    </div>
  );
}
