import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = ({ id, label, checked, onChange }: CheckboxProps) => {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-[18px] h-[18px] rounded flex items-center justify-center cursor-pointer transition-colors ${
          checked ? 'bg-[#e53935] border-[#e53935]' : 'border border-white/20 bg-transparent'
        }`}
        onClick={() => onChange?.(!checked)}
      >
        {checked && <Check size={14} className="text-white" />}
      </div>
      <label htmlFor={id} className="text-sm text-white/90 cursor-pointer select-none" onClick={() => onChange?.(!checked)}>
        {label}
      </label>
    </div>
  );
};
