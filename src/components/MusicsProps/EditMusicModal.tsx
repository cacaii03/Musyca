import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { UserMusic } from '../../types/music.types';

interface EditMusicModalProps {
  isOpen: boolean;
  music: UserMusic | null;
  onClose: () => void;
  onSave: (id: string, title: string, artist: string) => Promise<void>; // Make async
}

const EditMusicModal: React.FC<EditMusicModalProps> = ({
  isOpen,
  music,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (music) {
      setTitle(music.title);
      setArtist(music.artist || '');
    }
  }, [music]);

  const handleSave = async () => {
    if (music && title.trim()) {
      setIsSaving(true);
      try {
        await onSave(music.id, title.trim(), artist.trim());
        onClose();
      } catch (error) {
        console.error('Error saving:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Music</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Title</IonLabel>
          <IonInput
            value={title}
            onIonChange={e => setTitle(e.detail.value || '')}
            placeholder="Enter song title"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Artist</IonLabel>
          <IonInput
            value={artist}
            onIonChange={e => setArtist(e.detail.value || '')}
            placeholder="Enter artist name"
          />
        </IonItem>
        <div style={{ marginTop: '20px' }}>
          <IonButton 
            expand="block" 
            onClick={handleSave} 
            disabled={!title.trim() || isSaving}
          >
            {isSaving ? 'Updating...' : 'Update'}
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default EditMusicModal;