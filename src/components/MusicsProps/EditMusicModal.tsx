import React, { useState, useEffect, useRef } from 'react';
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
  IonAvatar,
  IonText,
} from '@ionic/react';
import { close, image, camera } from 'ionicons/icons';
import { UserMusic } from '../../types/music.types';

interface EditMusicModalProps {
  isOpen: boolean;
  music: UserMusic | null;
  onClose: () => void;
  onSave: (id: string, title: string, artist: string, imageFile?: File | null) => Promise<void>;
}

const EditMusicModal: React.FC<EditMusicModalProps> = ({
  isOpen,
  music,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (music) {
      setTitle(music.title);
      setArtist(music.artist || '');
      // Set existing image preview if available
      setImagePreview(music.imageData || null);
      setImageFile(null);
    }
  }, [music]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setError('');
      } else {
        setError('Please select a valid image file');
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (music && title.trim()) {
      setIsSaving(true);
      setError('');
      try {
        await onSave(music.id, title.trim(), artist.trim(), imageFile);
        onClose();
      } catch (error) {
        console.error('Error saving:', error);
        setError('Failed to update music');
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
        {error && (
          <IonText color="danger" className="ion-padding">
            <p>{error}</p>
          </IonText>
        )}

        {/* Image Preview and Edit */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <IonAvatar style={{ width: '120px', height: '120px', margin: '0 auto' }}>
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Cover" 
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IonIcon icon={image} style={{ fontSize: '40px', color: 'white' }} />
                </div>
              )}
            </IonAvatar>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {/* Image edit buttons */}
            <div style={{ 
              position: 'absolute', 
              bottom: -10, 
              right: -10, 
              display: 'flex', 
              gap: '5px' 
            }}>
              <IonButton 
                size="small" 
                onClick={() => imageInputRef.current?.click()}
                style={{ '--padding-start': '8px', '--padding-end': '8px' }}
              >
                <IonIcon icon={camera} />
              </IonButton>
              
              {imagePreview && (
                <IonButton 
                  size="small" 
                  color="danger"
                  onClick={handleRemoveImage}
                  style={{ '--padding-start': '8px', '--padding-end': '8px' }}
                >
                  <IonIcon icon={close} />
                </IonButton>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
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
            {isSaving ? 'Updating...' : 'Update Music'}
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default EditMusicModal;