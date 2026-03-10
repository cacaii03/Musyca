import React, { useState, useRef, useEffect, forwardRef } from 'react';
import {
  IonContent,
  IonButton,
  IonCard,
  IonIcon,
  IonFab,
  IonFabButton,
  IonAlert,
  IonPage,        
  IonHeader,     
  IonToolbar,     
  IonTitle,      
} from '@ionic/react';
import { add} from 'ionicons/icons';
import { MusicStorage } from '../services/musicStorage';
import { UserMusic, MusicPlayerHandle } from '../types/music.types';
import MusicPlayButton from '../components/MusicsProps/MusicPlayButton';
import MusicSpectrum from '../components/MusicsProps/MusicSpectrum';
import MusicPrevious from '../components/MusicsProps/MusicPrevious';
import MusicNext from '../components/MusicsProps/MusicNext';
import MusicRepeatToggle from '../components/MusicsProps/MusicRepeatToggle';
import SpectrumBars from '../components/MusicsProps/SpectrumBars';
import MusicShuffleButton from '../components/MusicsProps/MusicShuffleButton';
import AddMusicModal from '../components/MusicsProps/AddMusicModal';
import MusicItem from '../components/MusicsProps/MusicItem';
import './UserMusics.css';

interface UserMusicsProps {
  isMicActive?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onPlayRequest?: () => void;
}

const UserMusics = forwardRef<MusicPlayerHandle, UserMusicsProps>(
  ({ isMicActive, onPlayStateChange, onPlayRequest }, ref) => {
    const [musicItems, setMusicItems] = useState<UserMusic[]>([]);
    const [filteredItems, setFilteredItems] = useState<UserMusic[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    
    // Player state
    const [centeredCard, setCenteredCard] = useState<string | null>(null);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(0);
    const [isRepeat, setIsRepeat] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isVolumeOpen, setIsVolumeOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
    const isProgrammaticScroll = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Load music on mount
    useEffect(() => {
      loadMusic();
    }, []);

    const loadMusic = async () => {
      const music = await MusicStorage.getAllMusic();
      setMusicItems(music);
      setFilteredItems(music);
      
      // Set first card as centered if available
      if (music.length > 0 && !centeredCard) {
        setCenteredCard(music[0].id);
      }
    };

    // Handle audio elements
    useEffect(() => {
      // Cleanup function
      return () => {
        audioRefs.current.forEach((audio) => {
          audio.pause();
          audio.src = '';
        });
        audioRefs.current.clear();
      };
    }, []);

    // Update progress
    useEffect(() => {
      const audio = currentPlayingId ? audioRefs.current.get(currentPlayingId) : null;
      if (!audio) return;

      const updateProgress = () => {
        if (audio.duration) {
          setCurrentProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }, [currentPlayingId]);

    // Handle audio ending
    useEffect(() => {
      const handleEnded = () => {
        if (!currentPlayingId) return;

        if (isRepeat) {
          const audio = audioRefs.current.get(currentPlayingId);
          if (audio) {
            audio.currentTime = 0;
            audio.play().catch(console.error);
          }
        } else {
          handleNext();
        }
      };

      audioRefs.current.forEach((audio) => {
        audio.addEventListener('ended', handleEnded);
      });

      return () => {
        audioRefs.current.forEach((audio) => {
          audio.removeEventListener('ended', handleEnded);
        });
      };
    }, [currentPlayingId, isRepeat]);

    // Handle mic active
    useEffect(() => {
      if (isMicActive && isPlaying) {
        const audio = currentPlayingId ? audioRefs.current.get(currentPlayingId) : null;
        if (audio) {
          audio.pause();
          setIsPlaying(false);
          onPlayStateChange?.(false);
        }
      }
    }, [isMicActive]);

    // Scroll handling
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleScroll = () => {
        if (isProgrammaticScroll.current) return;

        const containerCenter = container.offsetWidth / 2;
        const cards = Array.from(container.querySelectorAll('.music-card'));

        let closestCardId: string | null = null;
        let closestDistance = Infinity;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const distance = Math.abs(containerCenter - cardCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestCardId = card.getAttribute('data-id');
          }
        });

        if (closestCardId && closestCardId !== centeredCard) {
          setCenteredCard(closestCardId);
        }
      };

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }, [centeredCard]);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      pause: () => {
        if (currentPlayingId) {
          const audio = audioRefs.current.get(currentPlayingId);
          audio?.pause();
          setIsPlaying(false);
          onPlayStateChange?.(false);
        }
      },
      playTrack: (id: string) => {
        const track = musicItems.find(item => item.id === id);
        if (track) {
          handleCardClick(id);
          setTimeout(() => handlePlayPause(id), 500);
        }
      },
      searchTrack: (title: string) => {
        setSearchQuery(title);
        const match = musicItems.find(item =>
          item.title.toLowerCase().includes(title.toLowerCase())
        );
        if (match) {
          handleCardClick(match.id);
        }
      }
    }));

    const handleSaveMusic = async (music: UserMusic) => {
      await MusicStorage.saveMusic(music);
      await loadMusic();
    };

    const handleDeleteMusic = async (id: string) => {
      setDeleteTarget(id);
      setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
      if (deleteTarget) {
        // Stop playing if deleting current track
        if (currentPlayingId === deleteTarget) {
          const audio = audioRefs.current.get(deleteTarget);
          audio?.pause();
          audioRefs.current.delete(deleteTarget);
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }

        await MusicStorage.deleteMusic(deleteTarget);
        await loadMusic();
        setDeleteTarget(null);
      }
      setShowDeleteAlert(false);
    };

    const handlePlayPause = async (id: string) => {
      let audio = audioRefs.current.get(id);

      if (!audio) {
        const music = musicItems.find(m => m.id === id);
        if (!music?.audioData) return;

        audio = new Audio(music.audioData);
        audioRefs.current.set(id, audio);
      }

      try {
        if (onPlayRequest && !isPlaying) {
          onPlayRequest();
        }

        if (currentPlayingId === id) {
          if (isPlaying) {
            await audio.pause();
            setIsPlaying(false);
          } else {
            await audio.play();
            setIsPlaying(true);
          }
        } else {
          // Pause current
          if (currentPlayingId) {
            const currentAudio = audioRefs.current.get(currentPlayingId);
            if (currentAudio) {
              await currentAudio.pause();
              currentAudio.currentTime = 0;
            }
          }

          audio.currentTime = 0;
          await audio.play();
          setCurrentPlayingId(id);
          setIsPlaying(true);
          onPlayStateChange?.(true);
        }
      } catch (error) {
        console.error('Playback failed:', error);
        setIsPlaying(false);
      }
    };

    const handleCardClick = (id: string) => {
      const container = containerRef.current;
      if (!container) return;

      const card = container.querySelector(`.music-card[data-id="${id}"]`);
      if (!card) return;

      const containerWidth = container.offsetWidth;
      const cardRect = card.getBoundingClientRect();
      const cardLeft = cardRect.left + container.scrollLeft;
      const cardWidth = cardRect.width;
      const scrollTo = cardLeft - (containerWidth / 2) + (cardWidth / 2);

      isProgrammaticScroll.current = true;

      container.scrollTo({
        left: scrollTo,
        behavior: 'smooth',
      });

      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);

      setCenteredCard(id);
    };

    const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredItems(musicItems);
      } else {
        const filtered = musicItems.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.artist?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredItems(filtered);
      }
    };

    const handlePrevious = () => {
      if (!centeredCard || filteredItems.length === 0) return;

      const currentIndex = filteredItems.findIndex(item => item.id === centeredCard);
      if (currentIndex > 0) {
        const prevId = filteredItems[currentIndex - 1].id;
        handleCardClick(prevId);
        setTimeout(() => handlePlayPause(prevId), 300);
      }
    };

    const handleNext = () => {
      if (!centeredCard || filteredItems.length === 0) return;

      if (isShuffle) {
        const availableIds = filteredItems
          .map(item => item.id)
          .filter(id => id !== centeredCard);

        if (availableIds.length > 0) {
          const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
          handleCardClick(randomId);
          setTimeout(() => handlePlayPause(randomId), 300);
        }
        return;
      }

      const currentIndex = filteredItems.findIndex(item => item.id === centeredCard);
      if (currentIndex < filteredItems.length - 1) {
        const nextId = filteredItems[currentIndex + 1].id;
        handleCardClick(nextId);
        setTimeout(() => handlePlayPause(nextId), 300);
      }
    };

    const handleRestart = () => {
      if (currentPlayingId) {
        const audio = audioRefs.current.get(currentPlayingId);
        if (audio) {
          audio.currentTime = 0;
          setCurrentProgress(0);
          if (isPlaying) {
            audio.play().catch(console.error);
          }
        }
      }
    };

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
      setScrollLeft(containerRef.current?.scrollLeft || 0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();
      const x = e.pageX - (containerRef.current.offsetLeft || 0);
      const walk = (x - startX) * 2;
      containerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      setIsDragging(true);
      setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
      setScrollLeft(containerRef.current?.scrollLeft || 0);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();
      const x = e.touches[0].pageX - (containerRef.current.offsetLeft || 0);
      const walk = (x - startX) * 2;
      containerRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
      <IonPage> 
        <IonHeader> 
          <IonToolbar>
            <IonTitle>Musyca</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonContent fullscreen>
          <div
            className={`music-container ${isDragging ? 'grabbing' : ''}`}
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <div className="music-scroll-row">
              <div style={{ minWidth: 'calc(50vw - 40%)' }} />

              {filteredItems.map((item) => (
                <div key={item.id} className="music-col">
                  <MusicItem
                    music={item}
                    isCentered={centeredCard === item.id}
                    isPlaying={currentPlayingId === item.id && isPlaying}
                    onCardClick={() => handleCardClick(item.id)}
                    onPlayPause={() => handlePlayPause(item.id)}
                    onDelete={() => handleDeleteMusic(item.id)}
                    onEdit={() => {
                      console.log('Edit:', item.id);
                    }}
                  />
                </div>
              ))}

              <div style={{ minWidth: 'calc(50vw - 40%)' }} />
            </div>
          </div>
          {filteredItems.length > 0 && (
            <IonCard className="music-player-card">
              <div className="ion-padding">
                <div style={{ marginBottom: '10px' }}>
                  <SpectrumBars
                    barCount={30}
                    isPlaying={isPlaying}
                    audioElement={
                      currentPlayingId ? audioRefs.current.get(currentPlayingId) || null : null
                    }
                  />
                </div>

                <div style={{ marginTop: '-20px' }}>
                  <MusicSpectrum
                    progress={currentProgress}
                    onSeek={(newProgress) => {
                      const audio = currentPlayingId ? audioRefs.current.get(currentPlayingId) : null;
                      if (audio) {
                        audio.currentTime = (newProgress / 100) * audio.duration;
                      }
                    }}
                    disabled={!currentPlayingId}
                  />
                </div>

                <div className="player-controls">
                  <MusicShuffleButton
                    onRestart={handleRestart}
                    isShuffle={isShuffle}
                    onToggleShuffle={() => setIsShuffle(prev => !prev)}
                    disabled={isRepeat}
                  />

                  <MusicPrevious
                    onClick={handlePrevious}
                    disabled={!centeredCard || filteredItems.findIndex(item => item.id === centeredCard) <= 0}
                  />

                  <MusicPlayButton
                    isPlaying={currentPlayingId !== null && isPlaying}
                    onPlayPause={() => centeredCard && handlePlayPause(centeredCard)}
                    disabled={!centeredCard}
                  />

                  <MusicNext
                    onClick={handleNext}
                    disabled={!centeredCard || filteredItems.findIndex(item => item.id === centeredCard) >= filteredItems.length - 1}
                  />

                  <MusicRepeatToggle
                    isRepeat={isRepeat}
                    onToggle={() => {
                      setIsRepeat(!isRepeat);
                      if (!isRepeat) {
                        setIsShuffle(false);
                      }
                    }}
                  />
                </div>
              </div>
            </IonCard>
          )}
          {filteredItems.length === 0 && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '200px',
              textAlign: 'center',
              padding: '20px'
            }}>
              <p>No music found. Click the + button to add your first song!</p>
            </div>
          )}

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => setShowAddModal(true)}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          {/* Add Music Modal */}
          <AddMusicModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveMusic}
          />

          {/* Delete Confirmation Alert */}
          <IonAlert
            isOpen={showDeleteAlert}
            onDidDismiss={() => setShowDeleteAlert(false)}
            header="Confirm Delete"
            message="Are you sure you want to delete this song?"
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
              },
              {
                text: 'Delete',
                role: 'destructive',
                handler: confirmDelete,
              },
            ]}
          />
        </IonContent>
      </IonPage>
    );
  }
);

UserMusics.displayName = 'UserMusics';

export default UserMusics;