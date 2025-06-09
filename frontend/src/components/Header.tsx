import React from 'react';
import { AirVent } from 'lucide-react';

interface HeaderProps {
  darkMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ darkMode = false }) => {
  return (
    <header className="py-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <AirVent size={32} className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Smart AC Assistant
        </h1>
      </div>
      <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        AI-powered temperature optimization for your comfort
      </p>
    </header>
  );
};

export default Header;