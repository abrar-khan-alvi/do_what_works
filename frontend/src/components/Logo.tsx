import React from 'react';
import logo from '../assets/logo.png';

export const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <img src={logo} alt="Do What Works" className="w-40 h-auto" />
    </div>
  );
};
