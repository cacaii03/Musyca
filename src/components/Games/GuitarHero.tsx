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
  hit: boolean;
  missed: boolean;
}

interface HitEffect {
  id: number;
  lane: number;
  perfect: boolean;
  x: number;
  y: number;
  active: boolean;
}

const GuitarHero: React.FC<GuitarHeroProps> = ({ music, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showMissText, setShowMissText] = useState(false);
  const [missLane, setMissLane] = useState(-1);
  const [hitCount, setHitCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTimeRef = useRef<number>(0);
  const effectIdRef = useRef<number>(0);
  
  useEffect(() => {
    if (music.audioData) {
      audioRef.current = new Audio(music.audioData);
      
      audioRef.current.onloadedmetadata = () => {
        console.log('Audio loaded, duration:', audioRef.current?.duration);
        generateRhythmNotes(audioRef.current?.duration || 180);
        drawNotes(0);
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
  
  const generateRhythmNotes = (songDuration: number) => {
    const generatedNotes: Note[] = [];
    const bpm = 120;
    const beatDuration = 60 / bpm;
    
    for (let time = 0; time < songDuration; time += beatDuration) {
      const beat = Math.floor(time / beatDuration);
      
      generatedNotes.push({
        id: generatedNotes.length,
        lane: Math.floor(Math.random() * 4),
        timestamp: time,
        active: true,
        hit: false,
        missed: false,
      });
      
      if (beat % 2 === 0) {
        generatedNotes.push({
          id: generatedNotes.length,
          lane: Math.floor(Math.random() * 4),
          timestamp: time + 0.2,
          active: true,
          hit: false,
          missed: false,
        });
      }
      
      if (beat % 4 === 0) {
        for (let i = 0; i < 2; i++) {
          generatedNotes.push({
            id: generatedNotes.length,
            lane: (Math.floor(Math.random() * 4) + i) % 4,
            timestamp: time,
            active: true,
            hit: false,
            missed: false,
          });
        }
      }
      
      if (beat % 3 === 0) {
        generatedNotes.push({
          id: generatedNotes.length,
          lane: Math.floor(Math.random() * 4),
          timestamp: time + 0.35,
          active: true,
          hit: false,
          missed: false,
        });
      }
    }
    
    for (let i = 0; i < 20; i++) {
      generatedNotes.push({
        id: generatedNotes.length,
        lane: Math.floor(Math.random() * 4),
        timestamp: songDuration + i * 0.5,
        active: true,
        hit: false,
        missed: false,
      });
    }
    
    generatedNotes.sort((a, b) => a.timestamp - b.timestamp);
    setNotes(generatedNotes);
    setHitCount(0);
    setMissedCount(0);
    console.log(`Generated ${generatedNotes.length} notes for ${songDuration}s song`);
  };
  
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      if (!gameStarted) {
        setGameStarted(true);
      }
      audioRef.current.play();
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    } else if (audioRef.current) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (audioRef.current) {
        drawNotes(audioRef.current.currentTime);
      }
    }
  }, [isPlaying]);
  
  const animate = () => {
    if (!audioRef.current) {
      drawNotes(0);
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    const currentTime = audioRef.current.currentTime;
    
    setNotes(prev => {
      let missed = false;
      const updated = prev.map(note => {
        if (note.active && !note.hit && !note.missed && currentTime > note.timestamp + 0.3) {
          missed = true;
          setMissedCount(c => c + 1);
          return { ...note, missed: true, active: false };
        }
        return note;
      });
      
      if (missed) {
        setCombo(0);
      }
      
      return updated;
    });
    
    drawNotes(currentTime);
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  const drawNotes = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw lane lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      const x = i * (canvas.width / 4);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.strokeStyle = '#444';
      ctx.stroke();
    }
    
    // Draw lane labels
    ctx.fillStyle = '#666';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('G', canvas.width/8, 40);
    ctx.fillText('R', canvas.width/8*3, 40);
    ctx.fillText('B', canvas.width/8*5, 40);
    ctx.fillText('Y', canvas.width/8*7, 40);
    
    // Draw hit zone
    const hitZoneY = canvas.height - 80;
    
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, hitZoneY);
    ctx.lineTo(canvas.width, hitZoneY);
    ctx.stroke();
    
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255, 170, 0, 0.2)';
    ctx.fillRect(0, hitZoneY - 5, canvas.width, 10);
    
    // Draw click area indicator
    ctx.shadowBlur = 5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, hitZoneY - 30, canvas.width, 30);
    
    // Draw notes
    const noteSpeed = 200;
    
    const visibleNotes = notes.filter(n => {
      if (!n.active) return false;
      const timeUntilHit = n.timestamp - time;
      return timeUntilHit > -2 && timeUntilHit < 5;
    });
    
    visibleNotes.forEach(note => {
      const timeUntilHit = note.timestamp - time;
      const y = hitZoneY - (timeUntilHit * noteSpeed);
      
      if (y < -50 || y > canvas.height + 50) return;
      
      const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44'];
      const laneColor = colors[note.lane];
      
      const x = note.lane * (canvas.width / 4) + 10;
      const width = (canvas.width / 4) - 20;
      const height = 25;
      
      const distanceToHit = Math.abs(y - hitZoneY);
      if (distanceToHit < 40) {
        ctx.shadowColor = laneColor;
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowColor = laneColor;
        ctx.shadowBlur = 10;
      }
      
      const gradient = ctx.createLinearGradient(x, y - height/2, x + width, y + height/2);
      gradient.addColorStop(0, laneColor);
      gradient.addColorStop(1, 'white');
      ctx.fillStyle = gradient;
      
      ctx.beginPath();
      ctx.roundRect(x, y - height/2, width, height, 12);
      ctx.fill();
      
      if (distanceToHit < 30) {
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
      }
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♪', x + width/2, y);
    });
    
    // Draw hit effects
    hitEffects.forEach(effect => {
      if (!effect.active) return;
      
      const time = Date.now() / 200;
      const ringSize = 30 + Math.sin(time) * 10;
      
      ctx.shadowBlur = 30;
      ctx.shadowColor = effect.perfect ? '#ffd700' : '#ffaa00';
      
      ctx.strokeStyle = effect.perfect ? '#ffd700' : '#ffaa00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, ringSize, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = effect.perfect ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 170, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 20;
      ctx.fillStyle = effect.perfect ? '#ffd700' : '#ffaa00';
      ctx.font = effect.perfect ? 'bold 24px Arial' : 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const bounceY = effect.y - 40 + Math.sin(time * 5) * 5;
      ctx.fillText(effect.perfect ? 'PERFECT!' : 'HIT!', effect.x, bounceY);
    });
    
    // Draw miss animation
    if (showMissText && missLane >= 0) {
      const x = missLane * (canvas.width / 4) + (canvas.width / 8);
      const time = Date.now() / 100;
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff4444';
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const bounceY = hitZoneY - 40 + Math.sin(time) * 10;
      ctx.fillText('MISS!', x, bounceY);
      
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(missLane * (canvas.width / 4), hitZoneY - 25, canvas.width / 4, 50);
    }
    
    // Draw combo with animation
    if (combo > 1) {
      const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff9800';
      ctx.fillStyle = '#ff9800';
      ctx.font = `bold ${Math.floor(28 * pulse)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(`${combo}x COMBO!`, canvas.width/2, 60);
    }
    
    // Draw time and score
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#888';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${time.toFixed(1)}s / ${audioRef.current?.duration.toFixed(1) || '0'}s`, 10, 20);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 20);
    
    ctx.shadowBlur = 0;
  };
  
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
    if (!audioRef.current || !isPlaying) return;
    
    const currentTime = audioRef.current.currentTime;
    const hitWindow = 0.15;
    const hitZoneY = canvasRef.current ? canvasRef.current.height - 80 : 0;
    
    const availableNotes = notes.filter(n => 
      n.lane === lane && 
      n.active && 
      !n.hit && 
      !n.missed &&
      Math.abs(n.timestamp - currentTime) < 0.5
    );
    
    if (availableNotes.length > 0) {
      const closestNote = availableNotes.reduce((prev, curr) => 
        Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime) ? curr : prev
      );
      
      const timeDiff = Math.abs(closestNote.timestamp - currentTime);
      const isPerfect = timeDiff < hitWindow;
      const points = isPerfect ? 200 : 100;
      
      setNotes(prev => prev.map(n => 
        n.id === closestNote.id ? { ...n, hit: true, active: false } : n
      ));
      
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      setHitCount(prev => prev + 1);
      setMaxCombo(prev => Math.max(prev, combo + 1));
      
      const canvas = canvasRef.current;
      if (canvas) {
        const x = lane * (canvas.width / 4) + (canvas.width / 8);
        const newEffect: HitEffect = {
          id: effectIdRef.current++,
          lane,
          perfect: isPerfect,
          x,
          y: hitZoneY,
          active: true,
        };
        
        setHitEffects(prev => [...prev, newEffect]);
        
        setTimeout(() => {
          setHitEffects(prev => prev.filter(e => e.id !== newEffect.id));
        }, 500);
      }
      
      const laneElement = document.querySelector(`.lane:nth-child(${lane + 1}) .hit-area`);
      if (laneElement) {
        laneElement.classList.add('hit-flash');
        setTimeout(() => {
          laneElement.classList.remove('hit-flash');
        }, 150);
      }
      
    } else {
      setCombo(0);
      setShowMissText(true);
      setMissLane(lane);
      
      setTimeout(() => {
        setShowMissText(false);
        setMissLane(-1);
      }, 300);
      
      const canvas = canvasRef.current;
      if (canvas) {
        const x = lane * (canvas.width / 4) + (canvas.width / 8);
        const missEffect: HitEffect = {
          id: effectIdRef.current++,
          lane,
          perfect: false,
          x,
          y: hitZoneY,
          active: true,
        };
        
        setHitEffects(prev => [...prev, missEffect]);
        
        setTimeout(() => {
          setHitEffects(prev => prev.filter(e => e.id !== missEffect.id));
        }, 300);
      }
    }
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const resetGame = () => {
    setIsPlaying(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHitCount(0);
    setMissedCount(0);
    setHitEffects([]);
    setShowMissText(false);
    setMissLane(-1);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      generateRhythmNotes(audioRef.current.duration || 180);
      drawNotes(0);
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
          <IonTitle>Guitar Hero</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handlePlayPause}>
              <IonIcon icon={isPlaying ? pause : play} />
            </IonButton>
            <IonButton onClick={resetGame}>
              Reset
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
            <div className="stats">
              <span className="score">⭐ {score}</span>
              <span className="combo">🔥 {combo}x</span>
              <span className="max-combo">🏆 {maxCombo}x</span>
            </div>
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
            <div className="stats-panel">
              <div className="stat-item hits">
                <span className="stat-label">HITS</span>
                <span className="stat-value">{hitCount}</span>
              </div>
              <div className="stat-item misses">
                <span className="stat-label">MISS</span>
                <span className="stat-value">{missedCount}</span>
              </div>
              <div className="stat-item left">
                <span className="stat-label">LEFT</span>
                <span className="stat-value">{notes.filter(n => n.active).length}</span>
              </div>
            </div>
            <p className="instruction-text">🎸 Click lanes when notes hit the line!</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

declare global {
  interface CanvasRenderingContext2D {
    roundRect(x: number, y: number, w: number, h: number, r: number): CanvasRenderingContext2D;
  }
}

export default GuitarHero;