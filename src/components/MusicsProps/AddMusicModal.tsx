import React, { useState, useRef, useEffect } from 'react';
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
  IonText,
  IonLoading,
} from '@ionic/react';
import { close, image, musicalNote } from 'ionicons/icons';
import { v4 as uuidv4 } from 'uuid';
import { UserMusic } from '../../types/music.types';
import './AddMusicModal.css';

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (music: UserMusic) => void;
}

const AddMusicModal: React.FC<AddMusicModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        setError('');
      } else {
        setError('Please select a valid audio file');
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        // Create preview using URL.createObjectURL for better performance
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setError('');
      } else {
        setError('Please select a valid image file');
      }
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setAudioFile(null);
    setImageFile(null);
    // Clean up preview URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setError('');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a song title');
      return;
    }

    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64 if it exists
      let imageData: string | undefined;
      if (imageFile) {
        imageData = await fileToBase64(imageFile);
      }

      const newMusic: UserMusic = {
        id: uuidv4(),
        title: title.trim(),
        artist: artist.trim() || undefined,
        audioFile, // This is fine - UserMusic has audioFile: File | null
        imageData, // Use imageData instead of imageFile to match the type
        dateAdded: Date.now(),
      };

      await onSave(newMusic);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving music:', error);
      setError('Failed to save music');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Music</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="add-music-content">
        <IonLoading isOpen={loading} message="Saving music..." />

        {error && (
          <IonText color="danger" className="ion-padding">
            <p>{error}</p>
          </IonText>
        )}

        <div className="ion-padding">
          {/* Image Preview */}
          <div className="image-preview-container">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">
                <IonIcon icon={image} />
              </div>
            )}
          </div>

          {/* Form Fields */}
          <IonItem>
            <IonLabel position="stacked">Song Title *</IonLabel>
            <IonInput
              value={title}
              onIonChange={e => setTitle(e.detail.value || '')}
              placeholder="Enter song title"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Artist (Optional)</IonLabel>
            <IonInput
              value={artist}
              onIonChange={e => setArtist(e.detail.value || '')}
              placeholder="Enter artist name"
            />
          </IonItem>

          {/* Audio File Selection */}
          <div className="file-input-section">
            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioSelect}
              accept="audio/*"
              style={{ display: 'none' }}
            />
            
            <IonButton
              expand="block"
              onClick={() => audioInputRef.current?.click()}
              className="file-input-button"
            >
              <IonIcon icon={musicalNote} slot="start" />
              {audioFile ? audioFile.name : 'Select Audio File'}
            </IonButton>
            
            {audioFile && (
              <IonText color="success">
                <small>✓ {audioFile.name}</small>
              </IonText>
            )}
          </div>

          {/* Image File Selection */}
          <div className="file-input-section">
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => imageInputRef.current?.click()}
              className="file-input-button"
            >
              <IonIcon icon={image} slot="start" />
              {imageFile ? 'Change Cover Image' : 'Add Cover Image (Optional)'}
            </IonButton>
            
            {imageFile && (
              <IonText color="success">
                <small>✓ {imageFile.name}</small>
              </IonText>
            )}
          </div>

          {/* Save Button */}
          <IonButton
            expand="block"
            onClick={handleSave}
            className="save-button"
            disabled={!title.trim() || !audioFile}
          >
            Save Music
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AddMusicModal;