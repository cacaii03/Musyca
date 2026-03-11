import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { arrowBack, pause, play } from 'ionicons/icons';
import { UserMusic } from '../../types/music.types';
import './GuitarHero.css';

interface GuitarHeroProps {
  music: UserMusic;
  onExit: () => void;
}

interface Note {
  id: number;
  lane: number; // 0-3 for 4 lanes
  timestamp: number; // in seconds
  active: boolean;
}

const GuitarHero: React.FC<GuitarHeroProps> = ({ music, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameLoopRef = useRef<number | null>(null); // Fixed: proper type for requestAnimationFrame
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate fake notes for demo
  useEffect(() => {
    const generatedNotes: Note[] = [];
    for (let i = 0; i < 50; i++) {
      generatedNotes.push({
        id: i,
        lane: Math.floor(Math.random() * 4),
        timestamp: i * 2, // Note every 2 seconds
        active: true,
      });
    }
    setNotes(generatedNotes);
  }, []);
  
  useEffect(() => {
    if (music.audioData) {
      audioRef.current = new Audio(music.audioData);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [music]);
  
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
      startGameLoop();
    } else if (audioRef.current) {
      audioRef.current.pause();
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
  }, [isPlaying]);
  
  const startGameLoop = () => {
    const update = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      gameLoopRef.current = requestAnimationFrame(update);
    };
    gameLoopRef.current = requestAnimationFrame(update);
  };
  
  const handleLaneClick = (lane: number) => {
    // Check if there's a note at current time in this lane
    const hitNote = notes.find(
      note => 
        note.lane === lane && 
        Math.abs(note.timestamp - currentTime) < 0.5 &&
        note.active
    );
    
    if (hitNote) {
      // Hit the note
      setNotes(notes.map(n => 
        n.id === hitNote.id ? { ...n, active: false } : n
      ));
      setScore(score + 100);
      setCombo(combo + 1);
    } else {
      // Miss
      setCombo(0);
    }
  };
  
  // Render game
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={onExit}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Guitar Hero - {music.title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setIsPlaying(!isPlaying)}>
              <IonIcon icon={isPlaying ? pause : play} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className="game-container">
          <div className="game-header">
            <div className="score">Score: {score}</div>
            <div className="combo">Combo: {combo}x</div>
            <div className="time">Time: {currentTime.toFixed(1)}s</div>
          </div>
          
          <div className="game-canvas-container">
            <canvas
              ref={canvasRef}
              className="game-canvas"
              width={400}
              height={600}
            />
            
            <div className="lane-indicators">
              {[0, 1, 2, 3].map(lane => (
                <div
                  key={lane}
                  className="lane"
                  onClick={() => handleLaneClick(lane)}
                >
                  <div className="hit-area" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="game-instructions">
            <p>Click the colored lanes when the notes reach the bottom!</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GuitarHero;