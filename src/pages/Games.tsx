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
import { play, musicalNotes, gameController} from 'ionicons/icons';
import { MusicStorage } from '../services/musicStorage';
import { UserMusic } from '../types/music.types';
import GuitarHero from '../components/Games/GuitarHero';
import DrumHero from '../components/Games/DrumHero';
import './Games.css';

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

  const playDrumHero = (music: UserMusic) => {
    setSelectedSong(music);
    setSelectedGame('drums');
  };

  const handleExit = () => {
    setSelectedSong(null);
    setSelectedGame(null);
  };

  // If a song is selected for Guitar Hero
  if (selectedSong && selectedGame === 'guitarhero') {
    return <GuitarHero music={selectedSong} onExit={handleExit} />;
  }

  // If a song is selected for Drum Hero
  if (selectedSong && selectedGame === 'drums') {
    return <DrumHero music={selectedSong} onExit={handleExit} />;
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

  // If Drum Hero is selected but no song yet
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
            <h2>Choose a song to play Drum Hero:</h2>
            {musicItems.length === 0 ? (
              <p>No songs available. Add some music first!</p>
            ) : (
              <IonGrid>
                <IonRow>
                  {musicItems.map((music) => (
                    <IonCol size="12" sizeMd="6" key={music.id}>
                      <IonCard button onClick={() => playDrumHero(music)}>
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
                            Play Drum Hero
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
            <IonCol size="12" sizeMd="6">
              <IonCard button onClick={() => setSelectedGame('guitarhero')} className="game-card">
                <div className="game-card-image guitar-hero-bg">
                  <IonIcon icon={musicalNotes} className="game-icon" />
                </div>
                <IonCardHeader>
                  <IonCardTitle>Guitar Hero</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Play along with your music! Press A,S,D,F when notes hit the line.
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeMd="6">
              <IonCard button onClick={() => setSelectedGame('drums')} className="game-card">
                <div className="game-card-image drum-hero-bg">
                  <IonIcon icon={gameController} className="game-icon" />
                </div>
                <IonCardHeader>
                  <IonCardTitle>Drum Hero</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Play the drums! Hit the glowing drums when they light up.
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