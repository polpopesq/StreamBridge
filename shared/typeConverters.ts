import { TrackUI, SpotifyTrack, YoutubeTrack, SpotifyPlaylist, YoutubePlaylist, Playlist, MatchedSong, NonMatchedSong } from "./types"

export const youtubeToTrackUI = (youtubeTrack: YoutubeTrack): TrackUI => {
    return {
        id: youtubeTrack.youtubeId,
        name: youtubeTrack.name,
        artists: [youtubeTrack.channelName]
    }
}

export const spotifyToTrackUI = (spotifyTrack: SpotifyTrack): TrackUI => {
    return {
        id: spotifyTrack.spotifyId,
        name: spotifyTrack.name,
        artists: spotifyTrack.artists
    }
}

export const spotifyToPlaylist = (spotifyPlaylist: SpotifyPlaylist): Playlist => {
    const tracks = spotifyPlaylist.tracks.map(track => spotifyToTrackUI(track));

    return {
        id: spotifyPlaylist.id,
        name: spotifyPlaylist.name,
        tracks: tracks,
        imageUrl: spotifyPlaylist.imageUrl,
        public: spotifyPlaylist.public
    }
}

export const youtubeToPlaylist = (youtubePlaylist: YoutubePlaylist): Playlist => {
    const tracks = youtubePlaylist.tracks.map(track => youtubeToTrackUI(track));

    return {
        id: youtubePlaylist.id,
        name: youtubePlaylist.name,
        tracks: tracks,
        imageUrl: youtubePlaylist.imageUrl,
        public: youtubePlaylist.public
    }
}

export const mapRowToMatchedSong = (row: any): MatchedSong => {
    return {
        id: row.id,
        source_platform: row.source_platform,
        destination_platform: row.destination_platform,
        source_id: row.source_id,
        destination_id: row.destination_id,
        source_name: row.source_name,
        destination_name: row.destination_name
    };
};

export const mapRowToNonMatchedSong = (row: any): NonMatchedSong => {
    return {
        id: row.id,
        source_platform: row.source_platform,
        destination_platform: row.destination_platform,
        source_id: row.source_id,
        source_name: row.source_name
    };
};

export const mapRowsToMatchedSongs = (rows: any[]): MatchedSong[] => {
    return rows.map(mapRowToMatchedSong);
};

export const mapRowsToNonMatchedSongs = (rows: any[]): NonMatchedSong[] => {
    return rows.map(mapRowToNonMatchedSong);
};
