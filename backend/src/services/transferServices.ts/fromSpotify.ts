import * as spotifyService from "../spotifyService";
import * as youtubeService from "../youtubeService";
import { SpotifyTrack, YoutubeTrack } from "@shared/types";
import dotenv from "dotenv";
import { getYoutubeTrackFromAI } from "./aiQuery";
import { checkDbMapping } from "./index";


dotenv.config();

interface SpotifyYoutubeMap {
    track: SpotifyTrack;
    result: YoutubeTrack | null;
};

export const spotifyToYoutubeTransfer = async (userId: number, playlistId: string):
    Promise<SpotifyYoutubeMap[]> => {
    const spotifyPlaylist = await spotifyService.getPlaylistById(userId, playlistId);
    const youtubeAccessToken = await youtubeService.getAccessToken(userId);

    return await spotifyToYoutubeMapper(spotifyPlaylist.tracks, youtubeAccessToken);
}

export const spotifyToTxtTransfer = async (userId: number, playlistId: string): Promise<string> => {
    const spotifyPlaylist = await spotifyService.getPlaylistById(userId, playlistId);

    const lines = spotifyPlaylist.tracks.map(track => {
        const artists = track.artists.join(", ");
        return `${artists} - ${track.name}`;
    });

    return lines.join("\n");
};

const mapSpotifyTrackToYoutubeTrack = async (track: SpotifyTrack, youtubeAccessToken: string): Promise<SpotifyYoutubeMap> => {
    const destinationId = await checkDbMapping("spotify", "youtube", track.spotifyId);
    if (destinationId) {
        const result = await youtubeService.getYoutubeVideoDetails(destinationId, youtubeAccessToken);
        return { track, result };
    }
    const query = `${track.name} ${track.artists.join(" ")}`;
    const youtubeQuery = await youtubeService.searchTracks(query, youtubeAccessToken, 1);
    let result = youtubeQuery ? youtubeQuery[0] : null;

    if (!result) {
        try {
            const prompt = buildPromptSpotifyToYoutube(track.name, track.artists);
            const aiResult = await getYoutubeTrackFromAI(prompt, youtubeAccessToken);
            result = aiResult;
        }
        catch (error) {
            console.warn(`No Youtube track found with AI for ${track.name}`);
        }
    }

    return { track, result };
};

const spotifyToYoutubeMapper = async (ogTracks: SpotifyTrack[], youtubeAccessToken: string): Promise<SpotifyYoutubeMap[]> => {
    const mappingPromises = ogTracks.map(track => mapSpotifyTrackToYoutubeTrack(track, youtubeAccessToken));

    return await Promise.all(mappingPromises);
};

const buildPromptSpotifyToYoutube = (trackName: string, artistsNames: string[]): string => {
    return `Find a relevant YouTube video for the song "${trackName}" by ${artistsNames.join(", ")}. Return only the full YouTube link. Do not send anything if you don't find it.`;
};