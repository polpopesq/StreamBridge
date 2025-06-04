import { YoutubePlaylist, Playlist, TrackUI, YoutubeTrack } from "@shared/types";
import { BACKEND_URL } from "../constants"
import { youtubeToPlaylist, youtubeToTrackUI } from "../../../shared/typeConverters";

export const YoutubeService = {
    getUser: async (): Promise<{ youtube_user_id: string; youtube_display_name: string } | null> => {
        try {
            const res = await fetch(`${BACKEND_URL}/youtube/me`, { credentials: "include" });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error("Eroare la fetch user YouTube:", error);
            return null;
        }
    },

    getUserPlaylists: async (): Promise<Playlist[] | null> => {
        try {
            const res = await fetch(`${BACKEND_URL}/youtube/playlists`, { credentials: "include" });
            const data: YoutubePlaylist[] = await res.json();
            const normalizedPlaylists = data.map(playlist => youtubeToPlaylist(playlist));
            return normalizedPlaylists;
        } catch (error) {
            console.error("Eroare la fetch playlists YouTube:", error);
            return null;
        }
    },

    searchYoutubeTracks: async (query: string): Promise<TrackUI[]> => {
        try {
            const res = await fetch(`${BACKEND_URL}/youtube/search?query=${encodeURIComponent(query)}`, {
                credentials: "include"
            });
            const data: YoutubeTrack[] = await res.json();
            return data.map((track: YoutubeTrack) => youtubeToTrackUI(track));
        } catch (error) {
            console.error("Eroare la căutarea în YouTube:", error);
            return [];
        }
    }
};

