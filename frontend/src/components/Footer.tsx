import React from 'react';

interface FooterProps {
  darkMode?: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode = false }) => {
  return (
    <footer className={`py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
      <p className="mb-2">© {new Date().getFullYear()} Smart AC Assistant • Created by Aditya Kulkarni • Powered by AI</p>
      <p className="text-xs opacity-75">This model was created for study purposes to showcase AI and machine learning skills.</p>
    </footer>
  );
};

export default Footer;