import { BACKEND_URL } from "../constants"

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

    getUserPlaylists: async (): Promise<any[] | null> => {
        try {
            const res = await fetch(`${BACKEND_URL}/spotify/playlists`, { credentials: "include" });
            const data = await res.json();
            console.log("Playlists Spotify:", data);
            return data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
};
