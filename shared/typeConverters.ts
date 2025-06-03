import { TrackUI, SpotifyTrack, YoutubeTrack, SpotifyPlaylist, YoutubePlaylist, Playlist } from "./types"

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

export const txtToTrack = (txt: string): TrackUI => {
    return {
        id: crypto.randomUUID(),
        name: txt.trim(),
        artists: [""]
    }
}