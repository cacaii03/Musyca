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
import backgroundsData from '../data/backgrounds.json';
import './Settings.css';

interface Background {
  id: string;
  color: string;
  gradient: string[];
  description: string;
}

const Settings: React.FC = () => {
  const [volume, setVolume] = useState(80);
  const [selectedBackground, setSelectedBackground] = useState('MBG1');
  const [autoSave, setAutoSave] = useState(true);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [musicCount, setMusicCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');

  // Background options from JSON
  const backgroundOptions: Background[] = backgroundsData.backgrounds;

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem('settings_volume');
    const savedBackground = localStorage.getItem('settings_background');
    const savedAutoSave = localStorage.getItem('settings_autosave');
    
    if (savedVolume) setVolume(parseInt(savedVolume));
    if (savedBackground) setSelectedBackground(savedBackground);
    if (savedAutoSave) setAutoSave(savedAutoSave === 'true');
    
    loadMusicCount();

    // Apply saved background on load
    const savedBg = localStorage.getItem('settings_background');
    if (savedBg) {
      applyBackground(savedBg);
    }
  }, []);

  const loadMusicCount = async () => {
    const music = await MusicStorage.getAllMusic();
    setMusicCount(music.length);
  };

  const applyBackground = (bgId: string) => {
    const bg = backgroundOptions.find(b => b.id === bgId);
    if (bg) {
      document.documentElement.style.setProperty('--settings-bg', bg.color);
      document.documentElement.style.setProperty('--settings-bg-start', bg.gradient[0]);
      document.documentElement.style.setProperty('--settings-bg-end', bg.gradient[1]);
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('settings_volume', volume.toString());
    localStorage.setItem('settings_background', selectedBackground);
    localStorage.setItem('settings_autosave', autoSave.toString());
    
    applyBackground(selectedBackground);
    
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

  // Get background preview color
  const getBgPreview = () => {
    const option = backgroundOptions.find(b => b.id === selectedBackground);
    return option ? option.color : '#1a2a3a';
  };

  // Get background description
  const getBgDescription = () => {
    const option = backgroundOptions.find(b => b.id === selectedBackground);
    return option ? option.description : '';
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
                  <p>{getBgDescription()}</p>
                </IonLabel>
                <IonSelect
                  value={selectedBackground}
                  onIonChange={e => setSelectedBackground(e.detail.value)}
                  interface="action-sheet"
                  className="background-select"
                >
                  {backgroundOptions.map(option => (
                    <IonSelectOption key={option.id} value={option.id}>
                      {option.id}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              
              {/* Background Preview */}
              <div className="background-preview">
                <div 
                  className="preview-box" 
                  style={{ 
                    background: `linear-gradient(135deg, ${getBgPreview()}, #0a1a2a)`
                  }}
                >
                  <span>{selectedBackground}</span>
                </div>
                <div className="preview-grid">
                  {backgroundOptions.map(option => (
                    <div 
                      key={option.id}
                      className={`preview-option ${selectedBackground === option.id ? 'selected' : ''}`}
                      style={{ 
                        background: `linear-gradient(135deg, ${option.color}, #0a1a2a)`
                      }}
                      onClick={() => setSelectedBackground(option.id)}
                    >
                      {option.id}
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