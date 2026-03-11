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
import './DrumKit.css';

interface DrumKitProps {
  music: UserMusic;
  onExit: () => void;
}

const DrumKit: React.FC<DrumKitProps> = ({ music, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeDrum, setActiveDrum] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Professional drum kit layout - larger drums, closer together like real kit
  const drums = [
    // Cymbals (top)
    { id: 'crash', name: 'CRASH', x: 150, y: 90, color: '#FFD700', key: 'Q', shape: 'crash' },
    { id: 'ride', name: 'RIDE', x: 550, y: 90, color: '#FFA500', key: 'W', shape: 'ride' },
    
    // Toms (clustered together)
    { id: 'tom1', name: 'TOM 1', x: 280, y: 160, color: '#DC143C', key: 'E', shape: 'tom' },
    { id: 'tom2', name: 'TOM 2', x: 380, y: 160, color: '#DC143C', key: 'R', shape: 'tom' },
    { id: 'tom3', name: 'TOM 3', x: 330, y: 220, color: '#DC143C', key: 'T', shape: 'tom' },
    
    // Hi-hat and Snare (center)
    { id: 'hihat', name: 'HI-HAT', x: 200, y: 220, color: '#FFD700', key: 'A', shape: 'hihat' },
    { id: 'snare', name: 'SNARE', x: 430, y: 240, color: '#C0C0C0', key: 'S', shape: 'snare' },
    
    // Floor tom
    { id: 'floor', name: 'FLOOR', x: 480, y: 310, color: '#8B4513', key: 'Y', shape: 'floor' },
    
    // Kick drum (bottom)
    { id: 'kick', name: 'KICK', x: 350, y: 420, color: '#8B4513', key: 'D', shape: 'kick' },
  ];
  
  // Key mapping
  const keyMap: { [key: string]: string } = {
    'q': 'crash', 'w': 'ride', 'e': 'tom1', 'r': 'tom2', 't': 'tom3', 'y': 'floor',
    'a': 'hihat', 's': 'snare', 'd': 'kick',
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
  
  // Professional drum sounds
  const playDrumSound = (drumId: string) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      switch(drumId) {
        case 'kick':
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kickOsc.type = 'triangle';
          kickOsc.frequency.setValueAtTime(80, ctx.currentTime);
          kickOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
          kickGain.gain.setValueAtTime(0.7, ctx.currentTime);
          kickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          kickOsc.connect(kickGain);
          kickGain.connect(ctx.destination);
          kickOsc.start();
          kickOsc.stop(ctx.currentTime + 0.2);
          break;
          
        case 'snare':
          const snareOsc = ctx.createOscillator();
          const snareGain = ctx.createGain();
          snareOsc.type = 'triangle';
          snareOsc.frequency.value = 200;
          
          const snareNoise = ctx.createBufferSource();
          const snareNoiseGain = ctx.createGain();
          const bufferSize = ctx.sampleRate * 0.2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          snareNoise.buffer = buffer;
          
          snareGain.gain.setValueAtTime(0.4, ctx.currentTime);
          snareGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          snareNoiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
          snareNoiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          
          snareOsc.connect(snareGain);
          snareNoise.connect(snareNoiseGain);
          snareGain.connect(ctx.destination);
          snareNoiseGain.connect(ctx.destination);
          
          snareOsc.start();
          snareNoise.start();
          snareOsc.stop(ctx.currentTime + 0.15);
          snareNoise.stop(ctx.currentTime + 0.15);
          break;
          
        case 'hihat':
          const hihatOsc = ctx.createOscillator();
          const hihatGain = ctx.createGain();
          hihatOsc.type = 'square';
          hihatOsc.frequency.value = 800;
          hihatGain.gain.setValueAtTime(0.2, ctx.currentTime);
          hihatGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          hihatOsc.connect(hihatGain);
          hihatGain.connect(ctx.destination);
          hihatOsc.start();
          hihatOsc.stop(ctx.currentTime + 0.1);
          break;
          
        case 'tom1':
        case 'tom2':
        case 'tom3':
        case 'floor':
          const tomOsc = ctx.createOscillator();
          const tomGain = ctx.createGain();
          tomOsc.type = 'sine';
          
          let freq = 200;
          if (drumId === 'tom1') freq = 280;
          if (drumId === 'tom2') freq = 220;
          if (drumId === 'tom3') freq = 180;
          if (drumId === 'floor') freq = 140;
          
          tomOsc.frequency.value = freq;
          tomGain.gain.setValueAtTime(0.5, ctx.currentTime);
          tomGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          tomOsc.connect(tomGain);
          tomGain.connect(ctx.destination);
          tomOsc.start();
          tomOsc.stop(ctx.currentTime + 0.25);
          break;
          
        case 'crash':
        case 'ride':
          const crashNoise = ctx.createBufferSource();
          const crashGain = ctx.createGain();
          const crashFilter = ctx.createBiquadFilter();
          crashFilter.type = 'bandpass';
          crashFilter.frequency.value = 2000;
          crashFilter.Q.value = 2;
          
          const crashBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
          const crashData = crashBuffer.getChannelData(0);
          for (let i = 0; i < crashBuffer.length; i++) {
            crashData[i] = Math.random() * 2 - 1;
          }
          crashNoise.buffer = crashBuffer;
          
          crashGain.gain.setValueAtTime(0.3, ctx.currentTime);
          crashGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          
          crashNoise.connect(crashFilter);
          crashFilter.connect(crashGain);
          crashGain.connect(ctx.destination);
          
          crashNoise.start();
          crashNoise.stop(ctx.currentTime + 0.6);
          break;
      }
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
        const drumId = keyMap[key];
        setActiveDrum(drumId);
        playDrumSound(drumId);
        setTimeout(() => setActiveDrum(null), 150);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const handleDrumClick = (drumId: string) => {
    setActiveDrum(drumId);
    playDrumSound(drumId);
    setTimeout(() => setActiveDrum(null), 150);
  };
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 700 / rect.width;
    const scaleY = 500 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    for (const drum of drums) {
      const dist = Math.sqrt((drum.x - x) ** 2 + (drum.y - y) ** 2);
      if (dist < 50) {
        handleDrumClick(drum.id);
        break;
      }
    }
  };
  
  // Canvas drawing
  useEffect(() => {
    const canvas = document.getElementById('drum-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      ctx.clearRect(0, 0, 700, 500);
      
      // Draw wooden floor
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#3a2a1a' : '#2a1a0a';
        ctx.fillRect(i * 35, 380, 35, 120);
      }
      
      // Draw stage shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 360, 700, 140);
      
      // Draw each drum - LARGER sizes
      drums.forEach(drum => {
        const isActive = activeDrum === drum.id;
        
        // Shadow for depth
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 5;
        
        if (drum.shape === 'crash' || drum.shape === 'ride') {
          // Cymbals - larger
          ctx.shadowColor = isActive ? '#ffff00' : 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = isActive ? 40 : 15;
          
          ctx.fillStyle = drum.color;
          ctx.beginPath();
          ctx.ellipse(drum.x, drum.y, 42, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Stand
          ctx.fillStyle = '#888';
          ctx.fillRect(drum.x - 3, drum.y + 5, 6, 30);
          
          // Center dome
          ctx.fillStyle = '#FFA500';
          ctx.beginPath();
          ctx.arc(drum.x, drum.y - 3, 10, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (drum.shape === 'hihat') {
          // Hi-hat - larger
          ctx.shadowColor = isActive ? '#ffff00' : 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = isActive ? 40 : 15;
          
          ctx.fillStyle = drum.color;
          ctx.beginPath();
          ctx.ellipse(drum.x, drum.y - 10, 38, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#EDC240';
          ctx.beginPath();
          ctx.ellipse(drum.x, drum.y, 35, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#888';
          ctx.fillRect(drum.x - 3, drum.y + 5, 6, 35);
        }
        else if (drum.shape === 'kick') {
          // Kick drum - much larger
          ctx.shadowColor = isActive ? '#ffff00' : 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = isActive ? 40 : 15;
          
          ctx.fillStyle = drum.color;
          ctx.beginPath();
          ctx.ellipse(drum.x, drum.y, 60, 32, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#654321';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(drum.x, drum.y, 57, 29, 0, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = '#A0522D';
          ctx.beginPath();
          ctx.ellipse(drum.x, drum.y - 3, 45, 22, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        else {
          // Toms and snare - larger drums
          ctx.shadowColor = isActive ? '#ffff00' : 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = isActive ? 40 : 15;
          
          let size = 42;
          if (drum.shape === 'floor') size = 48;
          if (drum.id === 'snare') size = 45;
          
          ctx.fillStyle = drum.color;
          ctx.beginPath();
          ctx.arc(drum.x, drum.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#654321';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(drum.x, drum.y - 2, size - 3, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = '#f5f5f5';
          ctx.beginPath();
          ctx.arc(drum.x, drum.y - 3, size - 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Snare wires
          if (drum.id === 'snare') {
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
              ctx.beginPath();
              ctx.moveTo(drum.x - 25, drum.y + 15 + i);
              ctx.lineTo(drum.x + 25, drum.y + 15 + i);
              ctx.stroke();
            }
          }
        }
        
        // Key hint - simple
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(drum.key.toUpperCase(), drum.x, drum.y - 30);
      });
      
      requestAnimationFrame(draw);
    };
    
    draw();
  }, [activeDrum]);
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={onExit}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>DRUM KIT</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setIsPlaying(!isPlaying)}>
              <IonIcon icon={isPlaying ? pause : play} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className="drum-kit">
          <div className="player-bar">
            <span className="song-title">{music.title} {music.artist && `- ${music.artist}`}</span>
            <span className="play-status">{isPlaying ? '🔊 PLAYING' : '🔇 PAUSED'}</span>
          </div>
          
          <canvas
            id="drum-canvas"
            width={700}
            height={500}
            onClick={handleCanvasClick}
            className="drum-canvas"
          />
          
          <div className="key-guide">
            <p>Q:Crash | W:Ride | E:Tom1 | R:Tom2 | T:Tom3 | Y:Floor | A:Hi-hat | S:Snare | D:Kick</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DrumKit;