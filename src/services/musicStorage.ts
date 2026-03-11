import localforage from 'localforage';
import { UserMusic } from '../types/music.types';

const musicStore = localforage.createInstance({
  name: 'MusicPlayerApp',
  storeName: 'music_metadata',
});

const audioStore = localforage.createInstance({
  name: 'MusicPlayerApp',
  storeName: 'audio_files',
});

const imageStore = localforage.createInstance({
  name: 'MusicPlayerApp',
  storeName: 'image_files',
});

export const MusicStorage = {
  async saveMusic(music: UserMusic): Promise<void> {
    try {
      const musicId = music.id;
      
      // Store audio file
      if (music.audioFile) {
        const audioBuffer = await this.fileToBase64(music.audioFile);
        await audioStore.setItem(musicId, audioBuffer);
      } else if (music.audioData) {
        await audioStore.setItem(musicId, music.audioData);
      }
      
      // Store image file
      if (music.imageFile) {
        const imageBuffer = await this.fileToBase64(music.imageFile);
        await imageStore.setItem(musicId, imageBuffer);
      } else if (music.imageData) {
        await imageStore.setItem(musicId, music.imageData);
      }
      
      // Store metadata without the actual files
      const metadata = {
        id: music.id,
        title: music.title,
        artist: music.artist,
        audioFile: null,
        imageFile: null,
        audioData: undefined,
        imageData: undefined,
        duration: music.duration,
        dateAdded: music.dateAdded,
      };
      
      await musicStore.setItem(musicId, metadata);
    } catch (error) {
      console.error('Error saving music:', error);
      throw error;
    }
  },

  async getAllMusic(): Promise<UserMusic[]> {
    try {
      const metadata: UserMusic[] = [];
      await musicStore.iterate((value: any, key) => {
        metadata.push({ ...value, id: key });
      });
      
      // Load audio and image data for each entry
      for (const music of metadata) {
        const audioData = await audioStore.getItem<string>(music.id);
        const imageData = await imageStore.getItem<string>(music.id);
        
        if (audioData) {
          music.audioData = audioData;
        }
        if (imageData) {
          music.imageData = imageData;
        }
      }
      
      // Sort by date added (newest first)
      return metadata.sort((a, b) => b.dateAdded - a.dateAdded);
    } catch (error) {
      console.error('Error getting music:', error);
      return [];
    }
  },

  async getMusic(id: string): Promise<UserMusic | null> {
    try {
      const metadata = await musicStore.getItem<any>(id);
      if (!metadata) return null;
      
      const audioData = await audioStore.getItem<string>(id);
      const imageData = await imageStore.getItem<string>(id);
      
      return {
        ...metadata,
        id,
        audioData: audioData || undefined,
        imageData: imageData || undefined,
      };
    } catch (error) {
      console.error('Error getting music:', error);
      return null;
    }
  },

  async deleteMusic(id: string): Promise<void> {
    try {
      await musicStore.removeItem(id);
      await audioStore.removeItem(id);
      await imageStore.removeItem(id);
    } catch (error) {
      console.error('Error deleting music:', error);
      throw error;
    }
  },

  async updateMusic(id: string, updates: Partial<UserMusic>): Promise<void> {
    try {
      // Get existing metadata
      const existing = await musicStore.getItem<any>(id);
      if (!existing) throw new Error('Music not found');
      
      // Handle image update if imageFile is provided
      if (updates.imageFile !== undefined) {
        if (updates.imageFile) {
          // New image uploaded
          const imageBuffer = await this.fileToBase64(updates.imageFile);
          await imageStore.setItem(id, imageBuffer);
        } else if (updates.imageFile === null) {
          // Image removed
          await imageStore.removeItem(id);
        }
      }
      
      // Handle title/artist updates
      if (updates.title !== undefined || updates.artist !== undefined) {
        const updatedMetadata = {
          ...existing,
          title: updates.title !== undefined ? updates.title : existing.title,
          artist: updates.artist !== undefined ? updates.artist : existing.artist,
        };
        await musicStore.setItem(id, updatedMetadata);
      }
      
    } catch (error) {
      console.error('Error updating music:', error);
      throw error;
    }
  },

  async updateMusicWithImage(id: string, title: string, artist: string, imageFile?: File | null): Promise<void> {
    try {
      // Get existing metadata
      const existing = await musicStore.getItem<any>(id);
      if (!existing) throw new Error('Music not found');
      
      // Update metadata
      const updatedMetadata = {
        ...existing,
        title,
        artist: artist || undefined,
      };
      await musicStore.setItem(id, updatedMetadata);
      
      // Handle image update
      if (imageFile !== undefined) {
        if (imageFile) {
          // New image uploaded
          const imageBuffer = await this.fileToBase64(imageFile);
          await imageStore.setItem(id, imageBuffer);
        } else if (imageFile === null) {
          // Image removed
          await imageStore.removeItem(id);
        }
      }
      
    } catch (error) {
      console.error('Error updating music with image:', error);
      throw error;
    }
  },

  // NEW: Download music file
  async downloadMusic(music: UserMusic): Promise<void> {
    try {
      // Get the audio data if not already loaded
      let audioData = music.audioData;
      if (!audioData) {
        const storedAudio = await audioStore.getItem<string>(music.id);
        if (storedAudio) {
          audioData = storedAudio;
        }
      }
      
      if (!audioData) {
        throw new Error('Audio data not found');
      }
      
      // Extract the base64 data and determine file type
      const matches = audioData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid audio data format');
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      
      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Determine file extension from mime type
      let fileExtension = '.mp3';
      if (mimeType.includes('audio/mpeg')) fileExtension = '.mp3';
      else if (mimeType.includes('audio/wav')) fileExtension = '.wav';
      else if (mimeType.includes('audio/ogg')) fileExtension = '.ogg';
      else if (mimeType.includes('audio/m4a')) fileExtension = '.m4a';
      else if (mimeType.includes('audio/aac')) fileExtension = '.aac';
      else if (mimeType.includes('audio/flac')) fileExtension = '.flac';
      
      // Create filename
      const fileName = `${music.title}${music.artist ? ` - ${music.artist}` : ''}${fileExtension}`;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      console.log(`Downloaded: ${fileName}`);
      
    } catch (error) {
      console.error('Error downloading music:', error);
      throw error;
    }
  },

  // Helper: Download by ID
  async downloadMusicById(id: string): Promise<void> {
    try {
      const music = await this.getMusic(id);
      if (!music) {
        throw new Error('Music not found');
      }
      await this.downloadMusic(music);
    } catch (error) {
      console.error('Error downloading music by ID:', error);
      throw error;
    }
  },

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },

  base64ToBlobUrl(base64: string, type: string): string {
    try {
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 data');
      }
      
      const mimeType = matches[1] || type;
      const base64Data = matches[2];
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      return '';
    }
  }
};