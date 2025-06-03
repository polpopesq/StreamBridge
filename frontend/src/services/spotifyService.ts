import { Playlist, SpotifyPlaylist, TrackUI } from "@shared/types";
import { BACKEND_URL } from "../constants"
import { spotifyToPlaylist } from "../../../shared/typeConverters";

export const SpotifyService = {
    getUser: async (): Promise<{ spotify_user_id: string; spotify_display_name: string } | null> => {
        try {
            const res = await fetch(`${BACKEND_URL}/spotify/me`, { credentials: "include" });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    getUserPlaylists: async (): Promise<Playlist[] | null> => {
        try {
            const res = await fetch(`${BACKEND_URL}/spotify/playlists`, { credentials: "include" });
            const data: SpotifyPlaylist[] = await res.json();
            const normalizedPlaylists = data.map(playlist => spotifyToPlaylist(playlist));
            return normalizedPlaylists;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    searchSpotifyTracks: async (query: string): Promise<TrackUI[]> => {
        try {
            const res = await fetch(`${BACKEND_URL}/spotify/search?query=${encodeURIComponent(query)}`, {
                credentials: "include"
            });
            const data: TrackUI[] = await res.json();
            return data;
        } catch (error) {
            console.error("Eroare la căutarea în Spotify:", error);
            return [];
        }
    }
};
