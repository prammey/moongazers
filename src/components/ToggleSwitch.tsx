'use client';

interface ToggleSwitchProps {
  leftLabel: string;
  rightLabel: string;
  isRightSelected: boolean;
  onToggle: () => void;
  className?: string;
}

export default function ToggleSwitch({ 
  leftLabel, 
  rightLabel, 
  isRightSelected, 
  onToggle,
  className = ""
}: ToggleSwitchProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span 
        className={`text-sm font-medium transition-colors ${
          !isRightSelected ? 'text-gray-500' : 'text-gray-500'
        }`}
        style={{ 
          color: !isRightSelected ? '#27a4da' : '#6b7280'
        }}
      >
        {leftLabel}
      </span>
      
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
        style={{
          backgroundColor: isRightSelected ? '#27a4da' : '#e5e7eb',
          boxShadow: `0 0 0 2px ${isRightSelected ? '#27a4da' : 'transparent'}`
        }}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isRightSelected ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      <span 
        className={`text-sm font-medium transition-colors ${
          isRightSelected ? 'text-gray-500' : 'text-gray-500'
        }`}
        style={{ 
          color: isRightSelected ? '#27a4da' : '#6b7280'
        }}
      >
        {rightLabel}
      </span>
    </div>
  );
}