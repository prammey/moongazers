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
          color: !isRightSelected ? '#2563eb' : '#6b7280'
        }}
      >
        {leftLabel}
      </span>
      
      <button
        type="button"
        role="switch"
        aria-checked={isRightSelected}
        aria-label={`${leftLabel} or ${rightLabel}: ${isRightSelected ? rightLabel : leftLabel}`}
        onClick={onToggle}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-black transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        style={{
          backgroundColor: isRightSelected ? '#2563eb' : '#e5e7eb'
        }}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white border border-black transition-transform ${
            isRightSelected ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      
      <span 
        className={`text-sm font-medium transition-colors ${
          isRightSelected ? 'text-gray-500' : 'text-gray-500'
        }`}
        style={{ 
          color: isRightSelected ? '#2563eb' : '#6b7280'
        }}
      >
        {rightLabel}
      </span>
    </div>
  );
}