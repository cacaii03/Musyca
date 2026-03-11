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
import './DrumHero.css';

interface DrumHeroProps {
  music: UserMusic;
  onExit: () => void;
}

interface DrumNote {
  id: number;
  drum: string; // 'kick', 'snare', 'hihat', 'tom1', 'tom2', 'crash', 'ride'
  timestamp: number;
  active: boolean;
  hit: boolean;
  missed: boolean;
}

interface HitEffect {
  id: number;
  drum: string;
  x: number;
  y: number;
  active: boolean;
}

const DrumHero: React.FC<DrumHeroProps> = ({ music, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [notes, setNotes] = useState<DrumNote[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [activeDrum, setActiveDrum] = useState<string | null>(null);
  const [glowingDrums, setGlowingDrums] = useState<Set<string>>(new Set());
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectIdRef = useRef<number>(0);
  const holdCheckRef = useRef<number | null>(null);
  
  // Keyboard mapping for drums
  const keyMap: { [key: string]: string } = {
    'q': 'crash',
    'w': 'ride',
    'e': 'tom1',
    'r': 'tom2',
    'a': 'hihat',
    's': 'snare',
    'd': 'kick',
    'f': 'kick', // Alternative
  };
  
  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keyMap) {
        e.preventDefault();
        const drum = keyMap[key];
        setActiveDrum(drum);
        handleDrumHit(drum);
        
        setTimeout(() => {
          setActiveDrum(null);
        }, 150);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, notes]);
  
  useEffect(() => {
    if (music.audioData) {
      audioRef.current = new Audio(music.audioData);
      
      audioRef.current.onloadedmetadata = () => {
        console.log('Audio loaded, duration:', audioRef.current?.duration);
        generateDrumPattern(audioRef.current?.duration || 180);
        drawDrums(0);
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
      if (holdCheckRef.current) {
        clearInterval(holdCheckRef.current);
      }
    };
  }, [music]);
  
  const generateDrumPattern = (songDuration: number) => {
    const generatedNotes: DrumNote[] = [];
    const bpm = 120;
    const beatDuration = 60 / bpm;
    
    const drums = ['kick', 'snare', 'hihat', 'tom1', 'tom2', 'crash', 'ride'];
    
    for (let time = 0; time < songDuration; time += beatDuration) {
      const beat = Math.floor(time / beatDuration);
      
      // Basic rock beat pattern
      if (beat % 4 === 0) {
        // Kick on 1 and 3
        generatedNotes.push({
          id: generatedNotes.length,
          drum: 'kick',
          timestamp: time,
          active: true,
          hit: false,
          missed: false,
        });
      }
      
      if (beat % 4 === 2) {
        // Kick on 3
        generatedNotes.push({
          id: generatedNotes.length,
          drum: 'kick',
          timestamp: time,
          active: true,
          hit: false,
          missed: false,
        });
      }
      
      if (beat % 2 === 1) {
        // Snare on 2 and 4
        generatedNotes.push({
          id: generatedNotes.length,
          drum: 'snare',
          timestamp: time,
          active: true,
          hit: false,
          missed: false,
        });
      }
      
      // Hi-hat on every 8th note
      if (beat % 1 === 0) {
        generatedNotes.push({
          id: generatedNotes.length,
          drum: 'hihat',
          timestamp: time,
          active: true,
          hit: false,
          missed: false,
        });
      }
      
      // Fill patterns
      if (beat % 8 === 7) {
        // Drum fill on last beat of bar
        generatedNotes.push({
          id: generatedNotes.length,
          drum: 'tom1',
          timestamp: time,
          active: true,
          hit: false,
          missed: false,
        });
        generatedNotes.push({
          id: generatedNotes.length,
          drum: 'tom2',
          timestamp: time + 0.2,
          active: true,
          hit: false,
          missed: false,
        });
      }
      
      // Crash cymbal on new sections
      if (beat % 16 === 0 && beat > 0) {
        generatedNotes.push({
          id: generatedNotes.length,
          drum: 'crash',
          timestamp: time,
          active: true,
          hit: false,
          missed: false,
        });
      }
    }
    
    // Add practice patterns after song
    for (let i = 0; i < 30; i++) {
      const drum = drums[Math.floor(Math.random() * drums.length)];
      generatedNotes.push({
        id: generatedNotes.length,
        drum,
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
    console.log(`Generated ${generatedNotes.length} drum notes`);
  };
  
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      if (!gameStarted) {
        setGameStarted(true);
      }
      audioRef.current.play();
      animationRef.current = requestAnimationFrame(animate);
      
      // Check for upcoming notes to glow drums
      holdCheckRef.current = window.setInterval(checkUpcomingNotes, 100);
    } else if (audioRef.current) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (holdCheckRef.current) {
        clearInterval(holdCheckRef.current);
        holdCheckRef.current = null;
      }
      if (audioRef.current) {
        drawDrums(audioRef.current.currentTime);
      }
    }
  }, [isPlaying]);
  
  const checkUpcomingNotes = () => {
    if (!audioRef.current || !isPlaying) return;
    
    const currentTime = audioRef.current.currentTime;
    const upcomingGlow = new Set<string>();
    
    notes.forEach(note => {
      if (note.active && !note.hit && !note.missed) {
        const timeUntilHit = note.timestamp - currentTime;
        if (timeUntilHit > 0 && timeUntilHit < 0.5) {
          upcomingGlow.add(note.drum);
        }
      }
    });
    
    setGlowingDrums(upcomingGlow);
  };
  
  const animate = () => {
    if (!audioRef.current) {
      drawDrums(0);
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
    
    drawDrums(currentTime);
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  const drawDrums = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw drum set background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw drum set parts with glow effects
    
    // Kick drum (bass) - bottom center
    drawDrum(ctx, centerX, centerY + 100, 80, 40, '#8B4513', 'kick', time);
    
    // Snare drum - center
    drawDrum(ctx, centerX, centerY - 20, 70, 35, '#C0C0C0', 'snare', time);
    
    // Hi-hat - left
    drawDrum(ctx, centerX - 120, centerY - 40, 50, 25, '#FFD700', 'hihat', time);
    
    // Tom 1 - left upper
    drawDrum(ctx, centerX - 60, centerY - 100, 55, 30, '#4169E1', 'tom1', time);
    
    // Tom 2 - right upper
    drawDrum(ctx, centerX + 60, centerY - 100, 55, 30, '#4169E1', 'tom2', time);
    
    // Crash cymbal - left top
    drawCymbal(ctx, centerX - 100, centerY - 150, 60, '#FFA500', 'crash', time);
    
    // Ride cymbal - right top
    drawCymbal(ctx, centerX + 100, centerY - 150, 65, '#FFA500', 'ride', time);
    
    // Draw hit effects
    hitEffects.forEach(effect => {
      if (!effect.active) return;
      
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ffaa00';
      
      // Draw hit burst
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 40, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HIT!', effect.x, effect.y - 30);
    });
    
    // Draw combo
    if (combo > 1) {
      const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff9800';
      ctx.fillStyle = '#ff9800';
      ctx.font = `bold ${Math.floor(28 * pulse)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(`${combo}x COMBO!`, canvas.width/2, 50);
    }
    
    // Draw time
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#888';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${time.toFixed(1)}s / ${audioRef.current?.duration.toFixed(1) || '0'}s`, 10, 20);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 20);
    
    // Draw upcoming notes indicator
    if (glowingDrums.size > 0) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('✨ READY ✨', canvas.width/2, canvas.height - 30);
    }
  };
  
  const drawDrum = (
    ctx: CanvasRenderingContext2D, 
    x: number, y: number, 
    width: number, height: number, 
    color: string, 
    drumType: string,
    time: number
  ) => {
    const isActive = activeDrum === drumType;
    const isGlowing = glowingDrums.has(drumType);
    
    // Draw drum shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    // Draw drum body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, width/2, height/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw drum head
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.ellipse(x, y - 5, width/2.2, height/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw rim
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y - 5, width/2.2, height/3, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Glow effect for upcoming notes
    if (isGlowing) {
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(x, y, width/2 + 5, height/2 + 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Hit effect when active
    if (isActive) {
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 40;
      ctx.fillStyle = 'rgba(255, 170, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x, y, width/2 + 10, height/2 + 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw drum label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const labels: { [key: string]: string } = {
      'kick': 'KICK',
      'snare': 'SNARE',
      'hihat': 'HI-HAT',
      'tom1': 'TOM 1',
      'tom2': 'TOM 2',
    };
    
    if (labels[drumType]) {
      ctx.fillText(labels[drumType], x, y - 25);
    }
    
    // Draw key hint
    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    const keyHints: { [key: string]: string } = {
      'kick': 'D/F',
      'snare': 'S',
      'hihat': 'A',
      'tom1': 'E',
      'tom2': 'R',
      'crash': 'Q',
      'ride': 'W',
    };
    
    if (keyHints[drumType]) {
      ctx.fillText(keyHints[drumType], x, y + 30);
    }
  };
  
  const drawCymbal = (
    ctx: CanvasRenderingContext2D, 
    x: number, y: number, 
    size: number, 
    color: string, 
    cymbalType: string,
    time: number
  ) => {
    const isActive = activeDrum === cymbalType;
    const isGlowing = glowingDrums.has(cymbalType);
    
    // Draw cymbal
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    
    // Main cymbal
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size/2, size/6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cymbal edge
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, size/2, size/6, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Center dome
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.arc(x, y - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect for upcoming notes
    if (isGlowing) {
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(x, y, size/2 + 5, size/6 + 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Hit effect when active
    if (isActive) {
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 40;
      ctx.fillStyle = 'rgba(255, 170, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x, y, size/2 + 10, size/6 + 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
    
    // Draw label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(cymbalType.toUpperCase(), x, y - 30);
    
    // Draw key hint
    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText(cymbalType === 'crash' ? 'Q' : 'W', x, y + 30);
  };
  
  const handleDrumHit = (drum: string) => {
    if (!audioRef.current || !isPlaying) return;
    
    const currentTime = audioRef.current.currentTime;
    const hitWindow = 0.25;
    
    const notesToHit = notes.filter(n => 
      n.drum === drum && 
      n.active && 
      !n.hit && 
      !n.missed &&
      Math.abs(n.timestamp - currentTime) < hitWindow
    );
    
    if (notesToHit.length > 0) {
      notesToHit.forEach(note => {
        const timeDiff = Math.abs(note.timestamp - currentTime);
        const isPerfect = timeDiff < 0.1;
        const points = isPerfect ? 150 : 75;
        
        setNotes(prev => prev.map(n => 
          n.id === note.id ? { ...n, hit: true, active: false } : n
        ));
        
        setScore(s => s + points);
        setCombo(c => c + 1);
        setHitCount(h => h + 1);
        setMaxCombo(m => Math.max(m, combo + 1));
        
        addHitEffect(drum);
      });
    } else {
      setCombo(0);
    }
  };
  
  const addHitEffect = (drum: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Find drum position (simplified - in real app you'd calculate based on drum type)
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    
    switch(drum) {
      case 'kick': y = canvas.height / 2 + 100; break;
      case 'snare': y = canvas.height / 2 - 20; break;
      case 'hihat': x = canvas.width / 2 - 120; y = canvas.height / 2 - 40; break;
      case 'tom1': x = canvas.width / 2 - 60; y = canvas.height / 2 - 100; break;
      case 'tom2': x = canvas.width / 2 + 60; y = canvas.height / 2 - 100; break;
      case 'crash': x = canvas.width / 2 - 100; y = canvas.height / 2 - 150; break;
      case 'ride': x = canvas.width / 2 + 100; y = canvas.height / 2 - 150; break;
    }
    
    const newEffect: HitEffect = {
      id: effectIdRef.current++,
      drum,
      x,
      y,
      active: true,
    };
    
    setHitEffects(prev => [...prev, newEffect]);
    
    setTimeout(() => {
      setHitEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, 300);
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
    setGlowingDrums(new Set());
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      generateDrumPattern(audioRef.current.duration || 180);
      drawDrums(0);
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
          <IonTitle>Drum Hero</IonTitle>
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
              width={600}
              height={500}
            />
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
            <div className="keyboard-hint">
              <div className="key-row">
                <span className="key">Q</span> <span className="label">Crash</span>
                <span className="key">W</span> <span className="label">Ride</span>
                <span className="key">E</span> <span className="label">Tom 1</span>
                <span className="key">R</span> <span className="label">Tom 2</span>
              </div>
              <div className="key-row">
                <span className="key">A</span> <span className="label">Hi-hat</span>
                <span className="key">S</span> <span className="label">Snare</span>
                <span className="key">D/F</span> <span className="label">Kick</span>
              </div>
            </div>
            <p className="instruction-text">🥁 Hit the glowing drums when they light up!</p>
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

export default DrumHero;