import { BACKEND_URL } from "../constants"

export const getUser = async (): Promise<{ spotify_user_id: string, spotify_display_name: string } | null> => {
    try {
        const result = await fetch(`${BACKEND_URL}/spotify/me`, {
            credentials: "include"
        });
        const data = await result.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}
