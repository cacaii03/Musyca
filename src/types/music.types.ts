export interface UserMusic {
  id: string;
  title: string;
  artist?: string;
  audioFile: File | null;
  audioData?: string; 
  imageFile?: File | null;
  imageData?: string; 
  duration?: number;
  dateAdded: number;
}

export interface MusicPlayerHandle {
  pause: () => void;
  playTrack: (id: string) => void;
  searchTrack?: (title: string) => void;
}