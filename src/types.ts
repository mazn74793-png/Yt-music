export interface Song {
  youtubeId: string;
  title: string;
  artists: {
    name: string;
    id?: string;
  }[];
  album?: string;
  thumbnailUrl?: string;
  duration?: {
    label: string;
    totalSeconds: number;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  createdAt: number;
}

export interface AppState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  history: Song[];
  playlists: Playlist[];
  library: Song[];
}
