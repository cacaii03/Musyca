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
import { play, musicalNotes, gameController } from 'ionicons/icons';
import { MusicStorage } from '../services/musicStorage';
import { UserMusic } from '../types/music.types';
import GuitarHero from '../components/Games/GuitarHero';
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
  };

  if (selectedSong) {
    return <GuitarHero music={selectedSong} onExit={() => setSelectedSong(null)} />;
  }

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
                          <IonButton expand="block">
                            <IonIcon icon={play} slot="start" />
                            Play
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
                  Play along with your music! Tap the notes as they fall.
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeMd="6">
              <IonCard button className="game-card coming-soon">
                <div className="game-card-image">
                  <IonIcon icon={gameController} className="game-icon" />
                  <div className="coming-soon-overlay">Coming Soon</div>
                </div>
                <IonCardHeader>
                  <IonCardTitle>Rhythm Master</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  A new rhythm game experience coming soon!
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