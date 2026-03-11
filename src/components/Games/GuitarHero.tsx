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
  lane: number;
  timestamp: number;
  active: boolean;
  y: number;
}

const GuitarHero: React.FC<GuitarHeroProps> = ({ music, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Generate notes based on song length
  useEffect(() => {
    const generatedNotes: Note[] = [];
    // Generate notes every 1-2 seconds for demo
    for (let i = 0; i < 60; i++) {
      generatedNotes.push({
        id: i,
        lane: Math.floor(Math.random() * 4),
        timestamp: i * 1.5 + Math.random(), // Notes at different times
        active: true,
        y: 0,
      });
    }
    setNotes(generatedNotes);
  }, []);
  
  useEffect(() => {
    if (music.audioData) {
      audioRef.current = new Audio(music.audioData);
      
      // When audio loads, get duration
      audioRef.current.onloadedmetadata = () => {
        console.log('Audio duration:', audioRef.current?.duration);
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [music]);
  
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
      startAnimation();
    } else if (audioRef.current) {
      audioRef.current.pause();
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isPlaying]);
  
  const startAnimation = () => {
    // Update time
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      gameLoopRef.current = requestAnimationFrame(updateTime);
    };
    gameLoopRef.current = requestAnimationFrame(updateTime);
    
    // Draw notes
    const draw = () => {
      drawNotes();
      animationRef.current = requestAnimationFrame(draw);
    };
    animationRef.current = requestAnimationFrame(draw);
  };
  
  const drawNotes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw lane lines
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      const x = i * (canvas.width / 4);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.strokeStyle = '#666';
      ctx.stroke();
    }
    
    // Draw hit zone line at bottom
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 80);
    ctx.lineTo(canvas.width, canvas.height - 80);
    ctx.stroke();
    
    // Draw notes
    const noteSpeed = 200; // pixels per second
    const hitZoneY = canvas.height - 80;
    
    notes.forEach(note => {
      if (!note.active) return;
      
      // Calculate note position based on time
      const timeDiff = note.timestamp - currentTime;
      if (timeDiff < -2) return; // Note passed
      if (timeDiff > 5) return; // Note too far in future
      
      // Y position from top (negative timeDiff means note is below hit zone)
      const y = hitZoneY - (timeDiff * noteSpeed);
      
      // Only draw if on screen
      if (y < -30 || y > canvas.height + 30) return;
      
      // Set color based on lane
      const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44'];
      ctx.fillStyle = colors[note.lane];
      
      // Draw note
      const x = note.lane * (canvas.width / 4) + 10;
      const width = (canvas.width / 4) - 20;
      
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y - 15, width, 30);
      
      // Add glow if near hit zone
      if (Math.abs(y - hitZoneY) < 30) {
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y - 15, width, 30);
      }
      
      ctx.shadowBlur = 0;
    });
  };
  
  const handleLaneClick = (lane: number) => {
    const hitZoneY = canvasRef.current ? canvasRef.current.height - 80 : 0;
    const noteSpeed = 200;
    
    // Find notes in hit zone
    const hitNote = notes.find(note => {
      if (!note.active) return false;
      
      const timeDiff = note.timestamp - currentTime;
      const y = hitZoneY - (timeDiff * noteSpeed);
      
      return note.lane === lane && Math.abs(y - hitZoneY) < 30;
    });
    
    if (hitNote) {
      // Hit the note
      setNotes(notes.map(n => 
        n.id === hitNote.id ? { ...n, active: false } : n
      ));
      setScore(prev => prev + 100);
      setCombo(prev => prev + 1);
      
      // Visual feedback
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.globalAlpha = 0.5;
          ctx.fillRect(lane * (canvas.width / 4), canvas.height - 100, canvas.width / 4, 40);
          ctx.globalAlpha = 1;
        }
      }
    } else {
      // Miss
      setCombo(0);
    }
  };
  
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
            <p>Click the colored lanes when the notes reach the yellow line!</p>
            <p>Current song: {music.title} {music.artist && `- ${music.artist}`}</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GuitarHero;