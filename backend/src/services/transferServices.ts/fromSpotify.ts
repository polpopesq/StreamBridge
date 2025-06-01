import * as spotifyService from "../spotifyService";
import * as youtubeService from "../youtubeService";
import dotenv from "dotenv";

dotenv.config();

interface SpotifyYoutubeMap {
    track: spotifyService.SpotifyTrack;
    result: youtubeService.YoutubeTrack | null;
};

export const spotifyToYoutubeTransfer = async (userId: number, playlistId: string):
    Promise<SpotifyYoutubeMap[]> => {
    const spotifyPlaylist = await spotifyService.getPlaylistById(userId, playlistId);
    const youtubeAccessToken = await youtubeService.getAccessToken(userId);

    return await spotifyToYoutubeMapper(spotifyPlaylist, youtubeAccessToken);
}

export const spotifyToTxtTransfer = async (userId: number, playlistId: string): Promise<string> => {
    const spotifyPlaylist = await spotifyService.getPlaylistById(userId, playlistId);

    const lines = spotifyPlaylist.tracks.map(track => {
        const artists = track.artistsNames.join(", ");
        return `${artists} - ${track.name}`;
    });

    return lines.join("\n");
};

const mapSpotifyTrackToYoutubeTrack = async (track: spotifyService.SpotifyTrack, youtubeAccessToken: string): Promise<SpotifyYoutubeMap> => {
    const query = `${track.name} ${track.artistsNames.join(" ")}`;
    let result = await youtubeService.searchTrack(query, youtubeAccessToken);

    if (!result) {
        try {
            const aiResult = await getYoutubeTrackFromAI(track.name, track.artistsNames, youtubeAccessToken);
            result = aiResult;
        }
        catch (error) {
            console.warn(`No Youtube track found with AI for ${track.name}`);
        }
    }

    return { track, result };
};

const spotifyToYoutubeMapper = async (ogPlaylist: spotifyService.SpotifyPlaylist, youtubeAccessToken: string): Promise<SpotifyYoutubeMap[]> => {
    const mappingPromises = ogPlaylist.tracks.map(track => mapSpotifyTrackToYoutubeTrack(track, youtubeAccessToken));

    return await Promise.all(mappingPromises);
};

const getYoutubeTrackFromAI = async (trackName: string, artistsNames: string[], accessToken: string, fallbackModel: string = "mistralai/mixtral-8x7b"):
    Promise<youtubeService.YoutubeTrack> => {
    const prompt = buildPromptSpotifyToYoutube(trackName, artistsNames);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: fallbackModel,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        })
    });

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || "";

    const youtubeId = extractYoutubeIdFromText(content);
    if (!youtubeId) {
        throw new Error(`AI fallback failed for track "${trackName}"`);
    }

    return await youtubeService.getYoutubeVideoDetails(youtubeId, accessToken);

};

const buildPromptSpotifyToYoutube = (trackName: string, artistsNames: string[]): string => {
    return `Find a relevant YouTube video for the song "${trackName}" by ${artistsNames.join(", ")}. Return only the full YouTube link. Do not send anything if you don't find it.`;
};

const extractYoutubeIdFromText = (text: string): string | null => {
    const match = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
};