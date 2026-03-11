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
import { arrowBack, play, pause } from 'ionicons/icons';
import { UserMusic } from '../../types/music.types';
import './PianoKit.css';

interface PianoKitProps {
  music: UserMusic;
  onExit: () => void;
}

const PianoKit: React.FC<PianoKitProps> = ({ music, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Piano keys configuration - 2 octaves from C4 to B5
  const whiteKeys = [
    { note: 'C4', name: 'C', x: 60, key: 'a', freq: 261.63 },
    { note: 'D4', name: 'D', x: 120, key: 's', freq: 293.66 },
    { note: 'E4', name: 'E', x: 180, key: 'd', freq: 329.63 },
    { note: 'F4', name: 'F', x: 240, key: 'f', freq: 349.23 },
    { note: 'G4', name: 'G', x: 300, key: 'g', freq: 392.00 },
    { note: 'A4', name: 'A', x: 360, key: 'h', freq: 440.00 },
    { note: 'B4', name: 'B', x: 420, key: 'j', freq: 493.88 },
    { note: 'C5', name: 'C', x: 480, key: 'k', freq: 523.25 },
    { note: 'D5', name: 'D', x: 540, key: 'l', freq: 587.33 },
    { note: 'E5', name: 'E', x: 600, key: ';', freq: 659.25 },
  ];

  const blackKeys = [
    { note: 'C#4', name: 'C#', x: 90, key: 'w', freq: 277.18 },
    { note: 'D#4', name: 'D#', x: 150, key: 'e', freq: 311.13 },
    { note: 'F#4', name: 'F#', x: 270, key: 't', freq: 369.99 },
    { note: 'G#4', name: 'G#', x: 330, key: 'y', freq: 415.30 },
    { note: 'A#4', name: 'A#', x: 390, key: 'u', freq: 466.16 },
    { note: 'C#5', name: 'C#', x: 510, key: 'o', freq: 554.37 },
    { note: 'D#5', name: 'D#', x: 570, key: 'p', freq: 622.25 },
  ];

  // Key mapping
  const keyMap: { [key: string]: { type: 'white' | 'black', index: number } } = {
    'a': { type: 'white', index: 0 },
    's': { type: 'white', index: 1 },
    'd': { type: 'white', index: 2 },
    'f': { type: 'white', index: 3 },
    'g': { type: 'white', index: 4 },
    'h': { type: 'white', index: 5 },
    'j': { type: 'white', index: 6 },
    'k': { type: 'white', index: 7 },
    'l': { type: 'white', index: 8 },
    ';': { type: 'white', index: 9 },
    'w': { type: 'black', index: 0 },
    'e': { type: 'black', index: 1 },
    't': { type: 'black', index: 2 },
    'y': { type: 'black', index: 3 },
    'u': { type: 'black', index: 4 },
    'o': { type: 'black', index: 5 },
    'p': { type: 'black', index: 6 },
  };

  // Load music
  useEffect(() => {
    if (music.audioData) {
      audioRef.current = new Audio(music.audioData);
      audioRef.current.loop = true;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [music]);

  // Handle music play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Realistic piano sound using multiple oscillators and envelope
  const playPianoNote = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Main oscillator (fundamental)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      
      // Second oscillator for richness
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      
      // Third oscillator for brightness
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      
      // Master gain
      const masterGain = ctx.createGain();
      
      // Set oscillator types
      osc1.type = 'triangle'; // Fundamental
      osc2.type = 'sine';     // Richness
      osc3.type = 'sawtooth';  // Brightness
      
      // Set frequencies (slightly detuned for realism)
      osc1.frequency.value = freq;
      osc2.frequency.value = freq * 2.01; // Octave with slight detune
      osc3.frequency.value = freq * 4.02; // Two octaves with detune
      
      // Volume levels
      gain1.gain.value = 0.5;
      gain2.gain.value = 0.3;
      gain3.gain.value = 0.2;
      
      // Attack and decay (piano envelope)
      const now = ctx.currentTime;
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.8, now + 0.01); // Fast attack
      masterGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5); // Slow decay
      
      // Connect oscillators
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);
      
      gain1.connect(masterGain);
      gain2.connect(masterGain);
      gain3.connect(masterGain);
      
      masterGain.connect(ctx.destination);
      
      // Start and stop
      osc1.start();
      osc2.start();
      osc3.start();
      
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.4);
      osc3.stop(now + 1.3);
      
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keyMap) {
        e.preventDefault();
        const map = keyMap[key];
        
        if (map.type === 'white') {
          const pianoKey = whiteKeys[map.index];
          setActiveKey(`white-${map.index}`);
          playPianoNote(pianoKey.freq);
        } else {
          const pianoKey = blackKeys[map.index];
          setActiveKey(`black-${map.index}`);
          playPianoNote(pianoKey.freq);
        }
        
        setTimeout(() => setActiveKey(null), 300);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleKeyClick = (type: 'white' | 'black', index: number, freq: number) => {
    setActiveKey(`${type}-${index}`);
    playPianoNote(freq);
    setTimeout(() => setActiveKey(null), 300);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 700 / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    
    // Check black keys first (they're on top)
    for (let i = 0; i < blackKeys.length; i++) {
      const key = blackKeys[i];
      if (x >= key.x - 20 && x <= key.x + 20) {
        handleKeyClick('black', i, key.freq);
        return;
      }
    }
    
    // Then check white keys
    for (let i = 0; i < whiteKeys.length; i++) {
      const key = whiteKeys[i];
      if (x >= key.x - 25 && x <= key.x + 25) {
        handleKeyClick('white', i, key.freq);
        return;
      }
    }
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = document.getElementById('piano-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      ctx.clearRect(0, 0, 700, 400);
      
      // Draw elegant piano background
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, '#2c3e50');
      gradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 700, 400);
      
      // Draw white keys
      whiteKeys.forEach((key, index) => {
        const isActive = activeKey === `white-${index}`;
        
        // Key shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        
        // White key with gradient
        const keyGradient = ctx.createLinearGradient(key.x - 25, 50, key.x + 25, 350);
        if (isActive) {
          keyGradient.addColorStop(0, '#ffffaa');
          keyGradient.addColorStop(1, '#ffff66');
        } else {
          keyGradient.addColorStop(0, '#ffffff');
          keyGradient.addColorStop(1, '#f0f0f0');
        }
        
        ctx.fillStyle = keyGradient;
        ctx.fillRect(key.x - 25, 50, 50, 300);
        
        // Key border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(key.x - 25, 50, 50, 300);
        
        // Key label (note name)
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(key.name, key.x, 320);
        
        // Key hint (keyboard key)
        ctx.fillStyle = isActive ? '#ffaa00' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(key.key.toUpperCase(), key.x, 360);
      });
      
      // Draw black keys
      blackKeys.forEach((key, index) => {
        const isActive = activeKey === `black-${index}`;
        
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        
        // Black key with gradient
        const keyGradient = ctx.createLinearGradient(key.x - 15, 50, key.x + 15, 230);
        if (isActive) {
          keyGradient.addColorStop(0, '#6666ff');
          keyGradient.addColorStop(1, '#333399');
        } else {
          keyGradient.addColorStop(0, '#333333');
          keyGradient.addColorStop(1, '#111111');
        }
        
        ctx.fillStyle = keyGradient;
        ctx.fillRect(key.x - 15, 50, 30, 180);
        
        // Key label
        ctx.shadowBlur = 0;
        ctx.fillStyle = isActive ? '#ffffaa' : '#aaa';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(key.name, key.x, 140);
        
        // Key hint
        ctx.fillStyle = isActive ? '#ffaa00' : '#888';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(key.key.toUpperCase(), key.x, 190);
      });
      
      // Draw piano brand and decorations
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.font = 'italic 20px "Times New Roman"';
      ctx.textAlign = 'right';
      ctx.fillText('Grand Piano', 680, 380);
      
      // Draw subtle key dividers
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i < whiteKeys.length; i++) {
        ctx.beginPath();
        ctx.moveTo(whiteKeys[i].x - 25, 50);
        ctx.lineTo(whiteKeys[i].x - 25, 350);
        ctx.stroke();
      }
      
      requestAnimationFrame(draw);
    };
    
    draw();
  }, [activeKey]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={onExit}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>GRAND PIANO</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setIsPlaying(!isPlaying)}>
              <IonIcon icon={isPlaying ? pause : play} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className="piano-kit">
          <div className="player-bar">
            <span className="song-title">{music.title} {music.artist && `- ${music.artist}`}</span>
            <span className="play-status">{isPlaying ? '🔊 PLAYING' : '🔇 PAUSED'}</span>
          </div>
          
          <canvas
            id="piano-canvas"
            width={700}
            height={400}
            onClick={handleCanvasClick}
            className="piano-canvas"
          />
          
          <div className="key-guide">
            <p className="main-guide">🎹 White Keys: A S D F G H J K L ; | Black Keys: W E T Y U O P</p>
            <p className="note">Realistic grand piano sound • 2 octaves • Click or use keyboard</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PianoKit;