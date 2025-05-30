import * as youtubeService from "../youtubeService";
import * as spotifyService from "../spotifyService";
import dotenv from "dotenv";

dotenv.config();

export const youtubeToSpotifyTransfer = async (userId: number, playlistId: string):
    Promise<{ foundTracks: spotifyService.SpotifyTrack[], notFoundTracks: youtubeService.YoutubeTrack[] }> => {
    const playlist = await youtubeService.getPlaylistById(userId, playlistId);
    const normalizedPlaylist = {
        ...playlist,
        tracks: normalizeTracks(playlist.tracks)
    }

    const spotifyAccessToken = await spotifyService.getAccessToken(userId); \
    const { foundTracks, notFoundTracks } = await youtubeToSpotifyMapper(normalizedPlaylist, spotifyAccessToken);
}

const normalizeTracks = (tracks: youtubeService.YoutubeTrack[]): youtubeService.YoutubeTrack[] => {
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

const youtubeToSpotifyMapper = async (normalizedPlaylist: youtubeService.YoutubePlaylist, spotifyAccessToken: string):
    Promise<{ foundTracks: spotifyService.SpotifyTrack[], notFoundTracks: youtubeService.YoutubeTrack[] }> => {

}

const buildPromptYoutubeToSpotify = (track: youtubeService.YoutubeTrack): string => {
    return `Find a relevant Spotify track for the Youtube video "${track.name}", posted on channel ${track.channelName}, with the description ${track.description}. Return only the full Spotify link.`;
};