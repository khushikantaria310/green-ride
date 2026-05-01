import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, ...props }: InputProps) => {
  return (
    <div className="w-full space-y-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-status-muted font-bold ml-4">
        {label}
      </label>
      <input 
        {...props}
        className="w-full bg-status-card border border-status-border rounded-2xl px-6 py-4 text-white focus:border-status-blue outline-none transition-all placeholder:text-status-muted/30 font-sans"
      />
    </div>
  );
};
