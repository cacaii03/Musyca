import React, { createContext, useState, useContext, useEffect } from 'react';

// Import backgrounds directly
import bg1 from '../assets/backgrounds/MBG1.gif';
import bg2 from '../assets/backgrounds/MBG2.gif';
import bg3 from '../assets/backgrounds/MBG3.gif';
import bg4 from '../assets/backgrounds/MBG4.gif';
import bg5 from '../assets/backgrounds/MBG5.gif';

interface BackgroundContextType {
  currentBackground: string;
  setCurrentBackground: (bg: string) => void;
  backgroundImage: string;
  backgrounds: { id: string; gif: string; description: string }[];
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
  const [backgroundImage, setBackgroundImage] = useState(bg1);

  const backgrounds = [
    { id: 'MBG1', gif: bg1, description: 'Dynamic blue waves - Default theme' },
    { id: 'MBG2', gif: bg2, description: 'Calming green forest animation' },
    { id: 'MBG3', gif: bg3, description: 'Elegant purple nebula' },
    { id: 'MBG4', gif: bg4, description: 'Warm sunset glow animation' },
    { id: 'MBG5', gif: bg5, description: 'Fresh ocean waves' },
  ];

  useEffect(() => {
    // Load saved background from localStorage
    const savedBg = localStorage.getItem('settings_background');
    if (savedBg) {
      setCurrentBackground(savedBg);
      const bg = backgrounds.find(b => b.id === savedBg);
      if (bg) setBackgroundImage(bg.gif);
    }
  }, []);

  useEffect(() => {
    // Update background when current changes
    const bg = backgrounds.find(b => b.id === currentBackground);
    if (bg) setBackgroundImage(bg.gif);
    
    // Save to localStorage
    localStorage.setItem('settings_background', currentBackground);
  }, [currentBackground]);

  return (
    <BackgroundContext.Provider value={{ 
      currentBackground, 
      setCurrentBackground, 
      backgroundImage,
      backgrounds 
    }}>
      {/* Fixed background div */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -2,
        transition: 'background-image 0.3s ease'
      }} />
      
      {/* Dark overlay for better readability */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />
      
      {children}
    </BackgroundContext.Provider>
  );
};