import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonActionSheet,
} from '@ionic/react';
import { ellipsisVertical, trash, create, close, play, pause } from 'ionicons/icons';
import { UserMusic } from '../../types/music.types';
import './MusicItem.css';

interface MusicItemProps {
  music: UserMusic;
  isCentered: boolean;
  isPlaying: boolean;
  onCardClick: () => void;
  onPlayPause: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

const MusicItem: React.FC<MusicItemProps> = ({
  music,
  isCentered,
  isPlaying,
  onCardClick,
  onPlayPause,
  onDelete,
  onEdit,
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const handlePlayButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayPause();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(true);
  };

  return (
    <div className="music-card-wrapper" style={{ position: 'relative' }}>
      <IonCard
        className={`music-card ${isCentered ? 'snap-center' : ''}`}
        onClick={onCardClick}
        data-id={music.id}
      >
        <div
          className="music-image-bg"
          style={{
            backgroundImage: music.imageData
              ? `url(${music.imageData})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <IonCardHeader className="overlay-header">
            <IonCardTitle>{music.title}</IonCardTitle>
            {music.artist && <p className="music-artist">{music.artist}</p>}
          </IonCardHeader>
        </div>
      </IonCard>

      {isCentered && (
        <>
          <IonButton
            className="music-menu-button"
            fill="clear"
            onClick={handleMenuClick}
          >
            <IonIcon icon={ellipsisVertical} />
          </IonButton>

          <IonButton
            className="music-play-button"
            fill="clear"
            onClick={handlePlayButtonClick}
          >
            <IonIcon icon={isPlaying ? pause : play} />
          </IonButton>
        </>
      )}

      <IonActionSheet
        isOpen={showActions}
        onDidDismiss={() => setShowActions(false)}
        buttons={[
          {
            text: 'Edit',
            icon: create,
            handler: () => {
              if (onEdit) {
                onEdit();
              }
              setShowActions(false);
            },
          },
          {
            text: 'Delete',
            icon: trash,
            role: 'destructive',
            handler: () => {
              onDelete();
              setShowActions(false);
            },
          },
          {
            text: 'Cancel',
            icon: close,
            role: 'cancel',
          },
        ]}
      />
    </div>
  );
};

export default MusicItem;