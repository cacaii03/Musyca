import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { play } from 'ionicons/icons';
import { MusicStorage } from '../services/musicStorage';
import { UserMusic } from '../types/music.types';
import GuitarHero from '../components/Games/GuitarHero';
import DrumKit from '../components/Games/DrumKit';
import PianoKit from '../components/Games/PianoKit';
import './Games.css';

// Import your PNG images
import guitarImage from '../components/MusicsProps/guitar.png';
import drumImage from '../components/MusicsProps/drum.png';
import pianoImage from '../components/MusicsProps/piano.png';

const Games: React.FC = () => {
  const [musicItems, setMusicItems] = useState<UserMusic[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<UserMusic | null>(null);

  useEffect(() => {
    loadMusic();
  }, []);

  const loadMusic = async () => {
    const music = await MusicStorage.getAllMusic();
    setMusicItems(music);
  };

  const playGuitarHero = (music: UserMusic) => {
    setSelectedSong(music);
    setSelectedGame('guitarhero');
  };

  const playDrumKit = (music: UserMusic) => {
    setSelectedSong(music);
    setSelectedGame('drums');
  };

  const playPianoKit = (music: UserMusic) => {
    setSelectedSong(music);
    setSelectedGame('piano');
  };

  const handleExit = () => {
    setSelectedSong(null);
    setSelectedGame(null);
  };

  // If a song is selected for Guitar Hero
  if (selectedSong && selectedGame === 'guitarhero') {
    return <GuitarHero music={selectedSong} onExit={handleExit} />;
  }

  // If a song is selected for Drum Kit
  if (selectedSong && selectedGame === 'drums') {
    return <DrumKit music={selectedSong} onExit={handleExit} />;
  }

  // If a song is selected for Piano Kit
  if (selectedSong && selectedGame === 'piano') {
    return <PianoKit music={selectedSong} onExit={handleExit} />;
  }

  // If Guitar Hero is selected but no song yet
  if (selectedGame === 'guitarhero') {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={() => setSelectedGame(null)}>
                Back to Games
              </IonButton>
            </IonButtons>
            <IonTitle>Select a Song</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '20px' }}>
            <h2>Choose a song to play Guitar Hero:</h2>
            {musicItems.length === 0 ? (
              <p>No songs available. Add some music first!</p>
            ) : (
              <IonGrid>
                <IonRow>
                  {musicItems.map((music) => (
                    <IonCol size="12" sizeMd="6" key={music.id}>
                      <IonCard button onClick={() => playGuitarHero(music)}>
                        <div
                          style={{
                            height: '100px',
                            backgroundImage: music.imageData ? `url(${music.imageData})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <IonCardHeader>
                          <IonCardTitle>{music.title}</IonCardTitle>
                          {music.artist && <p>{music.artist}</p>}
                        </IonCardHeader>
                        <IonCardContent>
                          <IonButton expand="block" color="primary">
                            <IonIcon icon={play} slot="start" />
                            Play Guitar Hero
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            )}
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // If Drum Kit is selected but no song yet
  if (selectedGame === 'drums') {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={() => setSelectedGame(null)}>
                Back to Games
              </IonButton>
            </IonButtons>
            <IonTitle>Select a Song</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '20px' }}>
            <h2>Choose a song to play along with:</h2>
            {musicItems.length === 0 ? (
              <p>No songs available. Add some music first!</p>
            ) : (
              <IonGrid>
                <IonRow>
                  {musicItems.map((music) => (
                    <IonCol size="12" sizeMd="6" key={music.id}>
                      <IonCard button onClick={() => playDrumKit(music)}>
                        <div
                          style={{
                            height: '100px',
                            backgroundImage: music.imageData ? `url(${music.imageData})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <IonCardHeader>
                          <IonCardTitle>{music.title}</IonCardTitle>
                          {music.artist && <p>{music.artist}</p>}
                        </IonCardHeader>
                        <IonCardContent>
                          <IonButton expand="block" color="secondary">
                            <IonIcon icon={play} slot="start" />
                            Play Along
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            )}
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // If Piano Kit is selected but no song yet
  if (selectedGame === 'piano') {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={() => setSelectedGame(null)}>
                Back to Games
              </IonButton>
            </IonButtons>
            <IonTitle>Select a Song</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '20px' }}>
            <h2>Choose a song to play along with:</h2>
            {musicItems.length === 0 ? (
              <p>No songs available. Add some music first!</p>
            ) : (
              <IonGrid>
                <IonRow>
                  {musicItems.map((music) => (
                    <IonCol size="12" sizeMd="6" key={music.id}>
                      <IonCard button onClick={() => playPianoKit(music)}>
                        <div
                          style={{
                            height: '100px',
                            backgroundImage: music.imageData ? `url(${music.imageData})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <IonCardHeader>
                          <IonCardTitle>{music.title}</IonCardTitle>
                          {music.artist && <p>{music.artist}</p>}
                        </IonCardHeader>
                        <IonCardContent>
                          <IonButton expand="block" color="tertiary">
                            <IonIcon icon={play} slot="start" />
                            Play Along
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            )}
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Main games menu
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Games</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <h1>Choose a Game</h1>
        
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonCard button onClick={() => setSelectedGame('guitarhero')} className="game-card">
                <div 
                  className="game-card-image" 
                  style={{ 
                    backgroundImage: `url(${guitarImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '200px'
                  }}
                >
                  <div className="game-overlay">
                    <h3>Guitar Hero</h3>
                  </div>
                </div>
                <IonCardContent>
                  Play along with your music! Press A,S,D,F when notes hit the line.
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeMd="4">
              <IonCard button onClick={() => setSelectedGame('drums')} className="game-card">
                <div 
                  className="game-card-image" 
                  style={{ 
                    backgroundImage: `url(${drumImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '200px'
                  }}
                >
                  <div className="game-overlay">
                    <h3>Drum Kit</h3>
                  </div>
                </div>
                <IonCardContent>
                  Professional drum kit. Click or use keys (Q,W,E,R,T,Y,A,S,D) to play along.
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="4">
              <IonCard button onClick={() => setSelectedGame('piano')} className="game-card">
                <div 
                  className="game-card-image" 
                  style={{ 
                    backgroundImage: `url(${pianoImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '200px'
                  }}
                >
                  <div className="game-overlay">
                    <h3>Piano Kit</h3>
                  </div>
                </div>
                <IonCardContent>
                  Play piano along with your music. White keys: A,S,D,F,G,H,J,K,L | Black keys: W,E,T,Y,U,O,P
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Games;