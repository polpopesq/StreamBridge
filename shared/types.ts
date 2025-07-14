export type PlatformKey = 'spotify' | 'youtube' | 'txt';

export interface TrackUI {
    id: string;
    name: string;
    artists: string[];
}

export interface Playlist {
    id: string;
    name: string;
    tracks: TrackUI[];
    imageUrl: string;
    public: boolean;
}

export interface SpotifyTrack extends Omit<TrackUI, "id"> {
    spotifyId: string;
}

export interface SpotifyPlaylist extends Omit<Playlist, "tracks"> {
    tracks: SpotifyTrack[];
}

export interface YoutubeTrack {
    name: string;
    channelName: string;
    youtubeId: string;
    description: string;
}

export interface YoutubePlaylist extends Omit<Playlist, "tracks"> {
    tracks: YoutubeTrack[];
}

export interface Mapping {
    sourceTrack: TrackUI,
    destinationTrack: TrackUI | null
}

export interface TransferData {
    sourcePlatform: PlatformKey | null;
    selectedPlaylist: Playlist | null;
    destinationPlatform: PlatformKey | null;
}

export interface FrontendUser {
    id: number,
    email: string,
    isAdmin: boolean
}

export interface MatchedSong {
    id: number;
    source_platform: string;
    destination_platform: string;
    source_id: string;
    destination_id: string;
    source_name: string;
    destination_name: string;
}

export interface NonMatchedSong {
    id: number;
    source_platform: string;
    destination_platform: string;
    source_id: string;
    source_name: string
}

export interface Transfer {
    sourcePlatform: string,
    destinationPlatform: string,
    sourceId: string,
    destinationId: string,
    status: string,
    createdAt: string
}

export interface ProfileData {
    email: string;
    isYoutubeConnected: boolean;
    isSpotifyConnected: boolean;
    isAdmin: boolean;
    transfers: Transfer[]
}