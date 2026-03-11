import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonRange,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonIcon,
  IonButton,
  IonAlert,
} from '@ionic/react';
import { 
  trashBin, 
  volumeHigh, 
  colorPalette,
  checkmarkCircle 
} from 'ionicons/icons';
import { MusicStorage } from '../services/musicStorage';
import { useBackground } from '../contexts/BackgroundContext';
import backgroundsData from '../data/backgrounds.json';
import './Settings.css';

// Import background images directly
import bg1 from '../assets/backgrounds/MBG1.gif';
import bg2 from '../assets/backgrounds/MBG2.gif';
import bg3 from '../assets/backgrounds/MBG3.gif';
import bg4 from '../assets/backgrounds/MBG4.gif';
import bg5 from '../assets/backgrounds/MBG5.gif';

// Import thumbnails (or use the same GIFs if thumbnails don't exist)
import thumb1 from '../assets/backgrounds/MBG1.gif';
import thumb2 from '../assets/backgrounds/MBG2.gif';
import thumb3 from '../assets/backgrounds/MBG3.gif';
import thumb4 from '../assets/backgrounds/MBG4.gif';
import thumb5 from '../assets/backgrounds/MBG5.gif';

interface Background {
  id: string;
  gif: string;
  thumbnail: string;
  description: string;
}

const Settings: React.FC = () => {
  const [volume, setVolume] = useState(80);
  const [selectedBackground, setSelectedBackground] = useState('MBG1');
  const [autoSave, setAutoSave] = useState(true);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [musicCount, setMusicCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  
  const { setCurrentBackground } = useBackground();

  // Map imported images to background options
  const backgroundOptions: Background[] = [
    {
      id: 'MBG1',
      gif: bg1,
      thumbnail: thumb1,
      description: 'Dynamic blue waves - Default theme'
    },
    {
      id: 'MBG2',
      gif: bg2,
      thumbnail: thumb2,
      description: 'Calming green forest animation'
    },
    {
      id: 'MBG3',
      gif: bg3,
      thumbnail: thumb3,
      description: 'Elegant purple nebula'
    },
    {
      id: 'MBG4',
      gif: bg4,
      thumbnail: thumb4,
      description: 'Warm sunset glow animation'
    },
    {
      id: 'MBG5',
      gif: bg5,
      thumbnail: thumb5,
      description: 'Fresh ocean waves'
    },
  ];

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem('settings_volume');
    const savedBackground = localStorage.getItem('settings_background');
    const savedAutoSave = localStorage.getItem('settings_autosave');
    
    if (savedVolume) setVolume(parseInt(savedVolume));
    if (savedBackground) setSelectedBackground(savedBackground);
    if (savedAutoSave) setAutoSave(savedAutoSave === 'true');
    
    loadMusicCount();
  }, []);

  const loadMusicCount = async () => {
    const music = await MusicStorage.getAllMusic();
    setMusicCount(music.length);
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('settings_volume', volume.toString());
    localStorage.setItem('settings_background', selectedBackground);
    localStorage.setItem('settings_autosave', autoSave.toString());
    
    // Update background globally
    setCurrentBackground(selectedBackground);
    
    setSaveStatus('Settings saved!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Clear all music
  const clearAllMusic = async () => {
    try {
      const music = await MusicStorage.getAllMusic();
      for (const song of music) {
        await MusicStorage.deleteMusic(song.id);
      }
      await loadMusicCount();
      setShowClearAlert(false);
      setSaveStatus('All music cleared!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error clearing music:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="settings-content">
        <div className="settings-container">
          
          {/* Save Status */}
          {saveStatus && (
            <div className="save-status">
              <IonIcon icon={checkmarkCircle} />
              <span>{saveStatus}</span>
            </div>
          )}

          {/* Music Storage Section */}
          <div className="settings-section">
            <div className="section-header">
              <IonIcon icon={trashBin} />
              <h2>Music Storage</h2>
            </div>
            
            <IonList className="settings-list">
              <IonItem>
                <IonLabel>
                  <h3>Total Songs</h3>
                  <p>Number of songs in your library</p>
                </IonLabel>
                <IonNote slot="end" className="music-count">{musicCount}</IonNote>
              </IonItem>
              
              <IonItem>
                <IonLabel>
                  <h3>Auto-save Downloads</h3>
                  <p>Automatically save downloaded music</p>
                </IonLabel>
                <IonToggle 
                  slot="end" 
                  checked={autoSave}
                  onIonChange={e => setAutoSave(e.detail.checked)}
                />
              </IonItem>
              
              <IonItem button onClick={() => setShowClearAlert(true)} className="danger-item">
                <IonLabel color="danger">
                  <h3>Clear All Music</h3>
                  <p>Permanently delete all songs</p>
                </IonLabel>
                <IonIcon icon={trashBin} slot="end" color="danger" />
              </IonItem>
            </IonList>
          </div>

          {/* Volume Section */}
          <div className="settings-section">
            <div className="section-header">
              <IonIcon icon={volumeHigh} />
              <h2>Volume</h2>
            </div>
            
            <IonList className="settings-list">
              <IonItem>
                <IonLabel>
                  <h3>Master Volume</h3>
                  <p>Adjust overall sound level</p>
                </IonLabel>
                <div className="volume-control">
                  <span className="volume-value">{volume}%</span>
                  <IonRange
                    value={volume}
                    onIonChange={e => setVolume(e.detail.value as number)}
                    min={0}
                    max={100}
                    step={1}
                    pin={true}
                    snaps={true}
                  />
                </div>
              </IonItem>
            </IonList>
          </div>

          {/* Background Selection Section */}
          <div className="settings-section">
            <div className="section-header">
              <IonIcon icon={colorPalette} />
              <h2>Background Theme</h2>
            </div>
            
            <div className="background-grid">
              {backgroundOptions.map(option => (
                <div
                  key={option.id}
                  className={`background-option ${selectedBackground === option.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBackground(option.id)}
                >
                  <div 
                    className="background-preview"
                    style={{ 
                      backgroundImage: `url(${option.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="preview-overlay">
                      <span className="preview-id">{option.id}</span>
                    </div>
                  </div>
                  <p className="background-description">{option.description}</p>
                </div>
              ))}
            </div>

            <div className="selected-info">
              <p>Current: <strong>{selectedBackground}</strong> - {backgroundOptions.find(b => b.id === selectedBackground)?.description}</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="save-button-container">
            <IonButton 
              expand="block" 
              onClick={saveSettings}
              className="save-button"
            >
              Apply Background
            </IonButton>
          </div>

        </div>
      </IonContent>

      {/* Clear Music Alert */}
      <IonAlert
        isOpen={showClearAlert}
        onDidDismiss={() => setShowClearAlert(false)}
        header="Clear All Music"
        message={`Are you sure you want to delete all ${musicCount} songs? This action cannot be undone.`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Delete All',
            role: 'destructive',
            handler: clearAllMusic,
          },
        ]}
      />
    </IonPage>
  );
};

export default Settings;