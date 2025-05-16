import { Playlist } from "@shared/types";
import { BACKEND_URL } from "../constants"

export const YtService = {
    getUser: async (): Promise<{ youtube_user_id: string; youtube_display_name: string } | null> => {
        try {
            const res = await fetch(`${BACKEND_URL}/ytmusic/me`, { credentials: "include" });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error("Eroare la fetch user YouTube:", error);
            return null;
        }
    },

    getUserPlaylists: async (): Promise<any[] | null> => {
        try {
            const res = await fetch(`${BACKEND_URL}/ytmusic/playlists`, { credentials: "include" });
            const data = await res.json();

            console.log("Playlists YouTube:", data);

            return data;
        } catch (error) {
            console.error("Eroare la fetch playlists YouTube:", error);
            return null;
        }
    }
};

