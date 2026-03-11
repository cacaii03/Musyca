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
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Generate notes based on song length
  useEffect(() => {
    const generatedNotes: Note[] = [];
    // Generate notes at different timestamps
    for (let i = 0; i < 30; i++) {
      generatedNotes.push({
        id: i,
        lane: Math.floor(Math.random() * 4),
        timestamp: i * 2 + Math.random(), // Notes every 2-3 seconds
        active: true,
        y: 0,
      });
    }
    // Sort by timestamp
    generatedNotes.sort((a, b) => a.timestamp - b.timestamp);
    setNotes(generatedNotes);
  }, []);
  
  useEffect(() => {
    if (music.audioData) {
      audioRef.current = new Audio(music.audioData);
      
      audioRef.current.onloadedmetadata = () => {
        console.log('Audio duration:', audioRef.current?.duration);
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [music]);
  
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      // Start audio
      audioRef.current.play();
      startTimeRef.current = performance.now() / 1000 - currentTime;
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    } else if (audioRef.current) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isPlaying]);
  
  const animate = () => {
    if (!audioRef.current) return;
    
    // Update current time from audio
    setCurrentTime(audioRef.current.currentTime);
    
    // Draw notes
    drawNotes(audioRef.current.currentTime);
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(animate);
  };
  
  const drawNotes = (time: number) => {
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
    const noteSpeed = 150; // pixels per second
    const hitZoneY = canvas.height - 80;
    
    notes.forEach(note => {
      if (!note.active) return;
      
      // Calculate time until note should be hit
      const timeUntilHit = note.timestamp - time;
      
      // Only show notes that are within visible range (5 seconds before to 2 seconds after)
      if (timeUntilHit < -2 || timeUntilHit > 5) return;
      
      // Calculate Y position: notes start from top and move down to hit zone
      // When timeUntilHit = 5 (5 seconds before hit), y = 0 (top)
      // When timeUntilHit = 0 (hit time), y = hitZoneY
      const y = hitZoneY - (timeUntilHit * noteSpeed);
      
      // Set color based on lane
      const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44'];
      ctx.fillStyle = colors[note.lane];
      
      // Draw note (rounded rectangle)
      const x = note.lane * (canvas.width / 4) + 15;
      const width = (canvas.width / 4) - 30;
      const height = 20;
      
      // Add glow effect
      ctx.shadowColor = colors[note.lane];
      ctx.shadowBlur = Math.abs(timeUntilHit) < 0.5 ? 20 : 10;
      
      // Draw note
      ctx.beginPath();
      ctx.roundRect(x, y - height/2, width, height, 10);
      ctx.fill();
      
      // Add highlight if near hit zone
      if (Math.abs(timeUntilHit) < 0.3) {
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'white';
        ctx.fill();
      }
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };
  
  // Helper function for rounded rectangles
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };
  
  const handleLaneClick = (lane: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;
    
    const currentAudioTime = audioRef.current.currentTime;
    const hitThreshold = 0.2; // 200ms window
    
    // Find notes in hit zone
    const hitNote = notes.find(note => {
      if (!note.active) return false;
      
      const timeDiff = Math.abs(note.timestamp - currentAudioTime);
      return note.lane === lane && timeDiff < hitThreshold;
    });
    
    if (hitNote) {
      // Hit the note
      setNotes(prev => prev.map(n => 
        n.id === hitNote.id ? { ...n, active: false } : n
      ));
      setScore(prev => prev + 100);
      setCombo(prev => prev + 1);
      
      // Visual feedback
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(lane * (canvas.width / 4), canvas.height - 100, canvas.width / 4, 40);
        ctx.globalAlpha = 1;
        
        // Reset after 100ms
        setTimeout(() => {
          if (canvasRef.current) {
            drawNotes(audioRef.current?.currentTime || 0);
          }
        }, 100);
      }
    } else {
      // Miss
      setCombo(0);
    }
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
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
          <IonTitle>Guitar Hero</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handlePlayPause}>
              <IonIcon icon={isPlaying ? pause : play} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className="game-container">
          <div className="game-header">
            <div className="song-info">
              {music.title} {music.artist && `- ${music.artist}`}
            </div>
            <div className="score">Score: {score}</div>
            <div className="combo">Combo: {combo}x</div>
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
            <p>Click the colored lanes when notes reach the yellow line!</p>
            <p>🎸 Perfect hit = 100 points | Miss = break combo</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

// Add the roundRect method to CanvasRenderingContext2D
declare global {
  interface CanvasRenderingContext2D {
    roundRect(x: number, y: number, w: number, h: number, r: number): CanvasRenderingContext2D;
  }
}

export default GuitarHero;