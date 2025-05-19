//Information useful for the UI only
export interface TrackUI {
    name: string;
    artistsNames: string[];
}

export interface Playlist {
    id: string;
    name: string;
    tracks: TrackUI[];
    imageUrl: string;
    public: boolean;
}