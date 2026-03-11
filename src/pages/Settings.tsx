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
import './Settings.css';

// Background options
const backgroundOptions = [
  { value: 'MBG1', label: 'Midnight Blue 1', color: '#1a2a3a' },
  { value: 'MBG2', label: 'Forest Green 2', color: '#2a3a2a' },
  { value: 'MBG3', label: 'Royal Purple 3', color: '#3a2a3a' },
  { value: 'MBG4', label: 'Sunset Orange 4', color: '#3a2a2a' },
  { value: 'MBG5', label: 'Ocean Teal 5', color: '#2a3a3a' },
];

const Settings: React.FC = () => {
  const [volume, setVolume] = useState(80);
  const [selectedBackground, setSelectedBackground] = useState('MBG1');
  const [autoSave, setAutoSave] = useState(true);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [musicCount, setMusicCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');

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
    
    setSaveStatus('Settings saved!');
    setTimeout(() => setSaveStatus(''), 2000);
    
    // Apply background to root element
    const bgColor = backgroundOptions.find(b => b.value === selectedBackground)?.color || '#1a2a3a';
    document.documentElement.style.setProperty('--settings-bg', bgColor);
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

  // Get background preview color
  const getBgPreview = () => {
    const option = backgroundOptions.find(b => b.value === selectedBackground);
    return option ? option.color : '#1a2a3a';
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
            
            <IonList className="settings-list">
              <IonItem>
                <IonLabel>
                  <h3>Select Background</h3>
                  <p>Choose your preferred theme</p>
                </IonLabel>
                <IonSelect
                  value={selectedBackground}
                  onIonChange={e => setSelectedBackground(e.detail.value)}
                  interface="action-sheet"
                  className="background-select"
                >
                  {backgroundOptions.map(option => (
                    <IonSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              
              {/* Background Preview */}
              <div className="background-preview">
                <div 
                  className="preview-box" 
                  style={{ backgroundColor: getBgPreview() }}
                >
                  <span>Preview</span>
                </div>
                <div className="preview-grid">
                  {backgroundOptions.map(option => (
                    <div 
                      key={option.value}
                      className={`preview-option ${selectedBackground === option.value ? 'selected' : ''}`}
                      style={{ backgroundColor: option.color }}
                      onClick={() => setSelectedBackground(option.value)}
                    >
                      {option.value}
                    </div>
                  ))}
                </div>
              </div>
            </IonList>
          </div>

          {/* Save Button */}
          <div className="save-button-container">
            <IonButton 
              expand="block" 
              onClick={saveSettings}
              className="save-button"
            >
              Save Settings
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