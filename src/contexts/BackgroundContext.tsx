import React, { createContext, useState, useContext, useEffect } from 'react';

interface BackgroundContextType {
  currentBackground: string;
  setCurrentBackground: (bg: string) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBackground, setCurrentBackground] = useState('MBG1');

  useEffect(() => {
    // Load saved background from localStorage
    const savedBg = localStorage.getItem('settings_background');
    if (savedBg) {
      setCurrentBackground(savedBg);
    }
  }, []);

  useEffect(() => {
    // Update body class when background changes
    document.body.className = document.body.className
      .replace(/bg-MBG[1-5]/g, '')
      .trim();
    document.body.classList.add(`bg-${currentBackground}`);
  }, [currentBackground]);

  return (
    <BackgroundContext.Provider value={{ currentBackground, setCurrentBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
};