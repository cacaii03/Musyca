import React, { useState, useRef, useEffect, forwardRef } from 'react';
import {
  IonContent,
  IonCard,
  IonIcon,
  IonFab,
  IonFabButton,
  IonAlert,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
  IonBadge,
} from '@ionic/react';
import { add } from 'ionicons/icons';
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
import EditMusicModal from '../components/MusicsProps/EditMusicModal';
import MusicItem from '../components/MusicsProps/MusicItem';
import './UserMusics.css';

interface UserMusicsProps {
  isMicActive?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onPlayRequest?: () => void;
}

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const UserMusics = forwardRef<MusicPlayerHandle, UserMusicsProps>(
  ({ isMicActive, onPlayStateChange, onPlayRequest }, ref) => {
    const [musicItems, setMusicItems] = useState<UserMusic[]>([]);
    const [filteredItems, setFilteredItems] = useState<UserMusic[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingMusic, setEditingMusic] = useState<UserMusic | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [showDownloadAlert, setShowDownloadAlert] = useState(false);
    const [downloadedMusic, setDownloadedMusic] = useState<string>('');
    const [downloadError, setDownloadError] = useState<string>('');
    
    // Player state
    const [centeredCard, setCenteredCard] = useState<string | null>(null);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(0);
    const [isRepeat, setIsRepeat] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [searchText, setSearchText] = useState('');

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
      try {
        const music = await MusicStorage.getAllMusic();
        setMusicItems(music);
        setFilteredItems(music);
        
        // Set first card as centered if available
        if (music.length > 0 && !centeredCard) {
          setCenteredCard(music[0].id);
        }
      } catch (error) {
        console.error('Error loading music:', error);
      }
    };

    // Handle audio elements
    useEffect(() => {
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
        setSearchText(title);
        handleSearch(title);
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

    const handleEditMusic = (id: string) => {
      const music = musicItems.find(m => m.id === id);
      if (music) {
        setEditingMusic(music);
        setShowEditModal(true);
      }
    };

    const handleUpdateMusic = async (id: string, title: string, artist: string, imageFile?: File | null) => {
      try {
        await MusicStorage.updateMusicWithImage(id, title, artist, imageFile);
        await loadMusic();
        console.log('Music updated successfully');
      } catch (error) {
        console.error('Error updating music:', error);
        throw error;
      }
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

    const handleDownloadMusic = async (music: UserMusic) => {
      try {
        await MusicStorage.downloadMusic(music);
        setDownloadedMusic(music.title);
        setDownloadError('');
        setShowDownloadAlert(true);
      } catch (error) {
        console.error('Error downloading music:', error);
        setDownloadedMusic(music.title);
        setDownloadError('Failed to download. Please try again.');
        setShowDownloadAlert(true);
      }
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
      setSearchText(query);
      
      if (!query.trim()) {
        setFilteredItems(musicItems);
      } else {
        const filtered = musicItems.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.artist?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredItems(filtered);
        
        // If there's a match and no centered card or the centered card is not in filtered results
        if (filtered.length > 0) {
          const centeredStillExists = centeredCard && filtered.some(item => item.id === centeredCard);
          
          if (!centeredStillExists) {
            // Center the first result
            handleCardClick(filtered[0].id);
          }
        }
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
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Musyca</IonTitle>
            {searchText && (
              <IonBadge color="primary" slot="end" style={{ marginRight: '10px' }}>
                {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
              </IonBadge>
            )}
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar
              value={searchText}
              onIonInput={e => handleSearch(e.detail.value || '')}
              onIonClear={() => handleSearch('')}
              placeholder="Search by title or artist"
              animated
              showCancelButton="focus"
              cancelButtonText="Clear"
            />
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
                    onEdit={() => handleEditMusic(item.id)}
                    onDownload={() => handleDownloadMusic(item)}
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

          <AddMusicModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveMusic}
          />

          <EditMusicModal
            isOpen={showEditModal}
            music={editingMusic}
            onClose={() => {
              setShowEditModal(false);
              setEditingMusic(null);
            }}
            onSave={handleUpdateMusic}
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

          {/* Download Success/Error Alert */}
          <IonAlert
            isOpen={showDownloadAlert}
            onDidDismiss={() => setShowDownloadAlert(false)}
            header={downloadError ? 'Download Failed' : 'Download Complete'}
            message={downloadError || `${downloadedMusic} has been downloaded successfully!`}
            buttons={['OK']}
          />
        </IonContent>
      </IonPage>
    );
  }
);

UserMusics.displayName = 'UserMusics';

export default UserMusics;