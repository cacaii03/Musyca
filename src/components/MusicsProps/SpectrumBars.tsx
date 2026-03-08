import React, { useEffect, useRef, useCallback } from 'react';
import './SpectrumBars.css';

interface SpectrumBarsProps {
  barCount?: number;
  isPlaying?: boolean;
  audioElement?: HTMLAudioElement | null;
}

const SpectrumBars: React.FC<SpectrumBarsProps> = ({
  barCount = 20,
  isPlaying = false,
  audioElement,
}) => {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const sourceCacheRef = useRef(
    new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>()
  );
  const currentSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    barsRef.current = Array(barCount).fill(null);
  }, [barCount]);

  const setBarRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      barsRef.current[index] = el;
    },
    []
  );

  useEffect(() => {
    const resetBars = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          bar.style.height = '10%';
          bar.style.opacity = '0.4';
        }
      });
    };

    if (!isPlaying || !audioElement) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      resetBars();
      return;
    }

    if (!audioElement) return;

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current =
        new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    
    if (!analyserRef.current) {
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!analyser || !dataArray) return;

    let sourceNode = sourceCacheRef.current.get(audioElement);
    if (!sourceNode) {
      sourceNode = audioContext.createMediaElementSource(audioElement);
      sourceCacheRef.current.set(audioElement, sourceNode);
    }

    if (currentSourceRef.current && currentSourceRef.current !== sourceNode) {
      try {
        currentSourceRef.current.disconnect();
      } catch (e) {
        console.warn('Error disconnecting source:', e);
      }
    }

    try {
      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);
      currentSourceRef.current = sourceNode;
    } catch (e) {
      console.error('Error connecting audio nodes:', e);
      return;
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(console.error);
    }

    const animate = () => {
      const analyserNode = analyserRef.current;
      const dataArrayNode = dataArrayRef.current;
      const bars = barsRef.current;

      if (!analyserNode || !dataArrayNode) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      try {
        // Create a new Uint8Array to ensure type safety
        const frequencyData = new Uint8Array(dataArrayNode.length);
        analyserNode.getByteFrequencyData(frequencyData);
        
        const bufferLength = frequencyData.length;

        for (let i = 0; i < bars.length; i++) {
          const bar = bars[i];
          if (!bar) continue;
          const bandIndex = Math.floor((i / bars.length) * bufferLength);
          const value = frequencyData[bandIndex] || 0;
          bar.style.height = `${10 + (value / 255) * 90}%`;
          bar.style.opacity = `${0.4 + (value / 255) * 0.6}`;
        }

        // Update the ref with new data
        dataArrayRef.current = frequencyData;
      } catch (e) {
        console.warn('Error in animation loop:', e);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.disconnect();
        } catch (e) {
          console.warn('Error disconnecting source during cleanup:', e);
        }
        currentSourceRef.current = null;
      }
      resetBars();
    };
  }, [isPlaying, audioElement]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.disconnect();
        } catch (e) {
          console.warn('Error disconnecting source during final cleanup:', e);
        }
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (e) {
          console.warn('Error disconnecting analyser during final cleanup:', e);
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((e) => 
          console.error('Failed to close AudioContext', e)
        );
      }
    };
  }, []);

  return (
    <div className="spectrum-container">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          ref={setBarRef(i)}
          className="spectrum-bar"
          style={{
            animation: isPlaying ? 'none' : `bounce 1s infinite ease-in-out ${i * 0.05}s`,
            background: 'linear-gradient(180deg, #320336 0%, #ef05df 100%)',
          }}
        />
      ))}
    </div>
  );
};

export default SpectrumBars;