import React, { useState, useEffect } from 'react';

interface LoginPopupProps {
  darkMode?: boolean;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ darkMode = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className={`
          relative max-w-md w-full p-6 rounded-xl shadow-2xl
          transform transition-all duration-500
          animate-[fadeIn_0.5s_ease-out]
          ${darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
          }
        `}
      >
        <div 
          className={`
            absolute -top-3 -right-3 
            cursor-pointer p-2 rounded-full
            transition-all duration-300 hover:scale-110
            ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
          `}
          onClick={() => setIsVisible(false)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </div>

        <h3 
          className={`text-xl font-semibold mb-3 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          Coming Soon!
        </h3>
        
        <p 
          className={`mb-4 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          I'm actively developing a personalized login system that will enhance your experience with:
        </p>
        
        <ul 
          className={`
            list-disc list-inside space-y-2 mb-6
            ${darkMode ? 'text-gray-300' : 'text-gray-600'}
          `}
        >
          <li>Save your comfort preferences</li>
          <li>Get personalized temperature recommendations</li>
          <li>Track your energy savings</li>
          <li>Receive smart notifications</li>
        </ul>

        <div 
          className={`
            p-4 rounded-lg mb-4
            ${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-blue-50 text-gray-600'}
          `}
        >
          <p className="text-sm">
            <strong>Note:</strong> This is my study project showcasing AI and machine learning capabilities. I'm currently developing the login system to provide personalized comfort settings based on individual preferences and usage patterns.
          </p>
        </div>

        <div 
          className={`
            text-sm
            ${darkMode ? 'text-gray-400' : 'text-gray-500'}
          `}
        >
          Stay tuned for these exciting features!
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;