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
  const [isLoaded, setIsLoaded] = useState(false);

  const backgrounds = [
    { id: 'MBG1', gif: bg1 },
    { id: 'MBG2', gif: bg2 },
    { id: 'MBG3', gif: bg3 },
    { id: 'MBG4', gif: bg4 },
    { id: 'MBG5', gif: bg5 },
  ];

  // Load saved background from localStorage on mount - run only once
  useEffect(() => {
    console.log('Loading background from localStorage...');
    const savedBg = localStorage.getItem('settings_background');
    console.log('Saved background:', savedBg);
    
    if (savedBg) {
      setCurrentBackground(savedBg);
      const bg = backgrounds.find(b => b.id === savedBg);
      if (bg) {
        setBackgroundImage(bg.gif);
        console.log('Set background to:', savedBg);
      }
    }
    setIsLoaded(true);
  }, []);

  // Update background when current changes and save to localStorage
  useEffect(() => {
    // Only run after initial load to prevent overwriting
    if (!isLoaded) return;
    
    console.log('Background changed to:', currentBackground);
    const bg = backgrounds.find(b => b.id === currentBackground);
    if (bg) {
      setBackgroundImage(bg.gif);
      localStorage.setItem('settings_background', currentBackground);
      console.log('Saved to localStorage:', currentBackground);
    }
  }, [currentBackground, isLoaded]);

  return (
    <BackgroundContext.Provider value={{ 
      currentBackground, 
      setCurrentBackground, 
      backgroundImage 
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />
      
      {children}
    </BackgroundContext.Provider>
  );
};