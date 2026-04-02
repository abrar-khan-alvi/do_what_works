import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  return (
    <button
      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
        variant === 'primary' 
          ? 'bg-white text-black hover:bg-white/90' 
          : 'bg-transparent text-white border border-white/20 hover:bg-white/5'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
