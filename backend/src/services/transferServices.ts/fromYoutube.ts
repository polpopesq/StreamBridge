import * as youtubeService from "../youtubeService";
import * as spotifyService from "../spotifyService";
import { SpotifyTrack, YoutubeTrack, YoutubePlaylist } from "@shared/types";
import dotenv from "dotenv";
import { getSpotifyTrackFromAI } from "./aiQuery";

dotenv.config();

interface YoutubeSpotifyMap {
    track: YoutubeTrack;
    result: SpotifyTrack | null;
};

export const youtubeToSpotifyTransfer = async (userId: number, playlistId: string):
    Promise<YoutubeSpotifyMap[]> => {
    const youtubePlaylist = await youtubeService.getPlaylistById(userId, playlistId);
    const normalizedPlaylist = {
        ...youtubePlaylist,
        tracks: normalizeTracks(youtubePlaylist.tracks)
    }

    const spotifyAccessToken = await spotifyService.getAccessToken(userId);
    return await youtubeToSpotifyMapper(normalizedPlaylist, spotifyAccessToken);
}

export const youtubeToTxtTransfer = async (userId: number, playlistId: string): Promise<string> => {
    const youtubePlaylist = await youtubeService.getPlaylistById(userId, playlistId);
    const lines = youtubePlaylist.tracks.map(track => `${track.channelName} - ${track.name}`);

    return lines.join("\n");
};

const normalizeTracks = (tracks: YoutubeTrack[]): YoutubeTrack[] => {
    const cleanTitle = (title: string): string => {
        let cleaned = title.replace(/\(.*?\)|\[.*?\]/g, "");
        cleaned = cleaned.replace(/\b(feat\.?|ft\.?|featuring|official|video|audio|lyrics|HD|HQ|remix|full|explicit|clean)\b/gi, "");
        cleaned = cleaned.replace(/\s*(x|&)\s*/gi, " ");
        cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
        return cleaned;
    };

    const cleanChannelName = (channelName: string): string => {
        return channelName
            .replace(/\s*-?\s*Topic$/i, "")   // ex: "Coldplay - Topic" -> "Coldplay"
            .replace(/\s*VEVO$/i, "")        // ex: "AdeleVEVO" -> "Adele"
            .trim();
    };


    return tracks.map(track => {
        const cleanedTitle = cleanTitle(track.name);
        const cleanedChannel = cleanChannelName(track.channelName);

        return {
            ...track,
            name: cleanedTitle,
            channelName: cleanedChannel
        };
    })
}

const mapYoutubeTrackToSpotifyTrack = async (track: YoutubeTrack, spotifyAccessToken: string): Promise<YoutubeSpotifyMap> => {
    const getFirstWords = (text: string, count: number): string => {
        return text?.split(/\s+/).slice(0, count).join(" ") || "";
    };
    const strategies = [
        `${track.name} ${track.channelName}`,
        `${track.name}`,
        `${track.name} ${getFirstWords(track.description, 3)}`
    ];

    let result = null;
    for (const query of strategies) {
        result = await spotifyService.searchTracks(query, spotifyAccessToken, 1);
        if (result) {
            result = result[0];
            break;
        }
    }

    if (!result) {
        const prompt = buildPromptYoutubeToSpotify(track);

        const aiResult = await getSpotifyTrackFromAI(prompt, spotifyAccessToken);
        if (!aiResult) console.warn(`No AI result for track ${track.name}`);
        result = aiResult;
    }
    return { track, result };
};

const youtubeToSpotifyMapper = async (normalizedPlaylist: YoutubePlaylist, spotifyAccessToken: string): Promise<YoutubeSpotifyMap[]> => {
    const mappingPromises = normalizedPlaylist.tracks.map(track => mapYoutubeTrackToSpotifyTrack(track, spotifyAccessToken));
    return await Promise.all(mappingPromises);

    // for testing AI purposes
    //return normalizedPlaylist.tracks.map(track => ({ track, result: null }));
};

const buildPromptYoutubeToSpotify = (track: YoutubeTrack): string => {
    return `Knowing Youtube track name ${track.name}. Give me the song in the format artist songName.`;
};