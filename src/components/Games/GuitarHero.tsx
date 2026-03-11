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
  duration: number;
  active: boolean;
  hit: boolean;
  missed: boolean;
  holding?: boolean;
  holdProgress?: number;
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
  const [keyPressed, setKeyPressed] = useState<Set<number>>(new Set());
  const [pressedLanes, setPressedLanes] = useState<Set<number>>(new Set());
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTimeRef = useRef<number>(0);
  const effectIdRef = useRef<number>(0);
  const holdCheckRef = useRef<number | null>(null);
  const lastHitTimeRef = useRef<{ [key: number]: number }>({});
  
  // Keyboard mapping: A=0, S=1, D=2, F=3
  const keyMap: { [key: string]: number } = {
    'a': 0,
    's': 1,
    'd': 2,
    'f': 3,
  };
  
  // Add keyboard event listeners for press and release
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keyMap) {
        e.preventDefault();
        const lane = keyMap[key];
        setKeyPressed(prev => new Set(prev).add(lane));
        setPressedLanes(prev => new Set(prev).add(lane));
        handleLanePress(lane);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keyMap) {
        e.preventDefault();
        const lane = keyMap[key];
        setKeyPressed(prev => {
          const newSet = new Set(prev);
          newSet.delete(lane);
          return newSet;
        });
        setPressedLanes(prev => {
          const newSet = new Set(prev);
          newSet.delete(lane);
          return newSet;
        });
        handleLaneRelease(lane);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, notes]);
  
  // Add pressed class to lane elements
  useEffect(() => {
    [0, 1, 2, 3].forEach(lane => {
      const laneElement = document.querySelector(`.lane:nth-child(${lane + 1})`);
      if (laneElement) {
        if (pressedLanes.has(lane)) {
          laneElement.classList.add('pressed');
        } else {
          laneElement.classList.remove('pressed');
        }
      }
    });
  }, [pressedLanes]);
  
  // Add hold active class for notes being held
  useEffect(() => {
    const holdingLanes = new Set<number>();
    notes.forEach(note => {
      if (note.active && note.holding) {
        holdingLanes.add(note.lane);
      }
    });
    
    [0, 1, 2, 3].forEach(lane => {
      const laneElement = document.querySelector(`.lane:nth-child(${lane + 1}) .hit-area`);
      if (laneElement) {
        if (holdingLanes.has(lane)) {
          laneElement.classList.add('hold-active');
        } else {
          laneElement.classList.remove('hold-active');
        }
      }
    });
  }, [notes]);
  
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
      if (holdCheckRef.current) {
        clearInterval(holdCheckRef.current);
      }
    };
  }, [music]);
  
  const generateRhythmNotes = (songDuration: number) => {
    const generatedNotes: Note[] = [];
    const bpm = 120;
    const beatDuration = 60 / bpm;
    
    for (let time = 0; time < songDuration; time += beatDuration) {
      const beat = Math.floor(time / beatDuration);
      
      // Add patterns of notes
      if (beat % 2 === 0) {
        // Single notes
        if (Math.random() > 0.3) {
          generatedNotes.push({
            id: generatedNotes.length,
            lane: Math.floor(Math.random() * 4),
            timestamp: time,
            duration: 0,
            active: true,
            hit: false,
            missed: false,
          });
        }
      }
      
      if (beat % 4 === 0) {
        // Chords - multiple notes at same time
        const chordSize = 2 + Math.floor(Math.random() * 2); // 2-3 notes
        const usedLanes = new Set<number>();
        for (let i = 0; i < chordSize; i++) {
          let lane;
          do {
            lane = Math.floor(Math.random() * 4);
          } while (usedLanes.has(lane));
          usedLanes.add(lane);
          
          generatedNotes.push({
            id: generatedNotes.length,
            lane,
            timestamp: time,
            duration: 0,
            active: true,
            hit: false,
            missed: false,
          });
        }
      }
      
      // Add hold notes
      if (beat % 8 === 0 && Math.random() > 0.6) {
        const holdDuration = 0.8 + Math.random() * 1.2;
        generatedNotes.push({
          id: generatedNotes.length,
          lane: Math.floor(Math.random() * 4),
          timestamp: time + 0.3,
          duration: holdDuration,
          active: true,
          hit: false,
          missed: false,
          holding: false,
          holdProgress: 0,
        });
      }
      
      // Add rapid consecutive notes in same lane for practice
      if (beat % 16 === 0) {
        const lane = Math.floor(Math.random() * 4);
        for (let i = 0; i < 4; i++) {
          generatedNotes.push({
            id: generatedNotes.length,
            lane,
            timestamp: time + i * 0.25,
            duration: 0,
            active: true,
            hit: false,
            missed: false,
          });
        }
      }
    }
    
    // Add practice notes after song
    for (let i = 0; i < 40; i++) {
      if (i % 4 === 0) {
        // Chords in practice
        for (let j = 0; j < 3; j++) {
          generatedNotes.push({
            id: generatedNotes.length,
            lane: j,
            timestamp: songDuration + i * 0.5,
            duration: 0,
            active: true,
            hit: false,
            missed: false,
          });
        }
      } else {
        generatedNotes.push({
          id: generatedNotes.length,
          lane: Math.floor(Math.random() * 4),
          timestamp: songDuration + i * 0.3,
          duration: 0,
          active: true,
          hit: false,
          missed: false,
        });
      }
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
      
      // Start hold note checker
      holdCheckRef.current = window.setInterval(checkHolds, 50);
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
        drawNotes(audioRef.current.currentTime);
      }
    }
  }, [isPlaying]);
  
  const checkHolds = () => {
    if (!audioRef.current || !isPlaying) return;
    
    const currentTime = audioRef.current.currentTime;
    
    setNotes(prev => {
      let updated = [...prev];
      let scoreAdded = 0;
      
      updated = updated.map(note => {
        if (note.active && note.duration > 0 && note.holding) {
          const timeInNote = currentTime - note.timestamp;
          if (timeInNote > 0 && timeInNote < note.duration) {
            if (Math.floor(timeInNote * 10) > Math.floor((note.holdProgress || 0) * note.duration * 10)) {
              scoreAdded += 5;
            }
            return { ...note, holdProgress: timeInNote / note.duration };
          } else if (timeInNote >= note.duration) {
            scoreAdded += 100;
            setHitCount(h => h + 1);
            return { ...note, hit: true, active: false, holding: false };
          }
        }
        return note;
      });
      
      if (scoreAdded > 0) {
        setScore(s => s + scoreAdded);
      }
      
      return updated;
    });
  };
  
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
        if (note.active && !note.hit && !note.missed && 
            ((note.duration === 0 && currentTime > note.timestamp + 0.4) ||
             (note.duration > 0 && !note.holding && currentTime > note.timestamp + 0.4))) {
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
    
    // Draw click/key press area indicator with KEY LETTERS
    ctx.shadowBlur = 5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, hitZoneY - 30, canvas.width, 30);
    
    // Draw key letters on the clicker area
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', canvas.width/8, hitZoneY - 15);
    ctx.fillText('S', canvas.width/8*3, hitZoneY - 15);
    ctx.fillText('D', canvas.width/8*5, hitZoneY - 15);
    ctx.fillText('F', canvas.width/8*7, hitZoneY - 15);
    
    // Draw notes
    const noteSpeed = 200;
    
    const visibleNotes = notes.filter(n => {
      if (!n.active) return false;
      const timeUntilHit = n.timestamp - time;
      const previewTime = n.duration > 0 ? 6 : 5;
      return timeUntilHit > -2 && timeUntilHit < previewTime;
    });
    
    visibleNotes.forEach(note => {
      const timeUntilHit = note.timestamp - time;
      const y = hitZoneY - (timeUntilHit * noteSpeed);
      
      if (y < -50 || y > canvas.height + 100) return;
      
      const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44'];
      const laneColor = colors[note.lane];
      
      const x = note.lane * (canvas.width / 4) + 10;
      const width = (canvas.width / 4) - 20;
      
      if (note.duration > 0) {
        const height = 30;
        const holdLength = note.duration * noteSpeed;
        
        ctx.shadowColor = laneColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = laneColor;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, y - height/2, width, holdLength);
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 20;
        
        const gradient = ctx.createLinearGradient(x, y - height/2, x + width, y + height/2);
        gradient.addColorStop(0, laneColor);
        gradient.addColorStop(1, 'white');
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.roundRect(x, y - height/2, width, height, 12);
        ctx.fill();
        
        if (note.holding && note.holdProgress) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fillRect(x, y - height/2, width * note.holdProgress, height);
        }
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('HOLD', x + width/2, y + holdLength/2);
      } else {
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
      }
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
  
  const handleLanePress = (lane: number) => {
    if (!audioRef.current || !isPlaying) return;
    
    const currentTime = audioRef.current.currentTime;
    const hitWindow = 0.25; // Increased window for easier hits
    
    // Find ALL notes in this lane that can be hit at this moment
    const notesToHit = notes.filter(n => 
      n.lane === lane && 
      n.active && 
      !n.hit && 
      !n.missed &&
      Math.abs(n.timestamp - currentTime) < hitWindow
    );
    
    if (notesToHit.length > 0) {
      // Hit all eligible notes in this lane (for rapid consecutive notes)
      notesToHit.forEach(note => {
        if (note.duration === 0) {
          // Tap note
          const timeDiff = Math.abs(note.timestamp - currentTime);
          const isPerfect = timeDiff < 0.12;
          const points = isPerfect ? 150 : 75; // Slightly reduced but more forgiving
          
          setNotes(prev => prev.map(n => 
            n.id === note.id ? { ...n, hit: true, active: false } : n
          ));
          
          setScore(s => s + points);
          setCombo(c => c + 1);
          setHitCount(h => h + 1);
          setMaxCombo(m => Math.max(m, combo + 1));
          
          addHitEffect(lane, isPerfect);
          lastHitTimeRef.current[lane] = currentTime;
          
        } else if (note.duration > 0 && !note.holding) {
          // Start hold note
          setNotes(prev => prev.map(n => 
            n.id === note.id ? { ...n, holding: true } : n
          ));
          
          setScore(s => s + 30);
          addHitEffect(lane, false);
        }
      });
    }
  };
  
  const handleLaneRelease = (lane: number) => {
    if (!audioRef.current || !isPlaying) return;
    
    const currentTime = audioRef.current.currentTime;
    
    setNotes(prev => {
      const updated = prev.map(note => {
        if (note.lane === lane && note.active && note.holding) {
          const timeInNote = currentTime - note.timestamp;
          if (timeInNote < note.duration * 0.7) {
            setMissedCount(m => m + 1);
            setCombo(0);
            return { ...note, missed: true, active: false, holding: false };
          }
        }
        return note;
      });
      return updated;
    });
  };
  
  const handleLaneClick = (lane: number) => {
    handleLanePress(lane);
  };
  
  const addHitEffect = (lane: number, perfect: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const x = lane * (canvas.width / 4) + (canvas.width / 8);
    const hitZoneY = canvas.height - 80;
    
    const newEffect: HitEffect = {
      id: effectIdRef.current++,
      lane,
      perfect,
      x,
      y: hitZoneY,
      active: true,
    };
    
    setHitEffects(prev => [...prev, newEffect]);
    
    setTimeout(() => {
      setHitEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, 500);
    
    const laneElement = document.querySelector(`.lane:nth-child(${lane + 1}) .hit-area`);
    if (laneElement) {
      laneElement.classList.add('hit-flash');
      setTimeout(() => {
        laneElement.classList.remove('hit-flash');
      }, 150);
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
    setPressedLanes(new Set());
    setKeyPressed(new Set());
    lastHitTimeRef.current = {};
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
                  onMouseDown={() => handleLaneClick(lane)}
                  onTouchStart={() => handleLaneClick(lane)}
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
            <p className="instruction-text">
               Press keys together for chords | Hold for long notes
            </p>
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