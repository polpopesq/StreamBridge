import * as youtubeService from "../youtubeService";
import * as spotifyService from "../spotifyService";
import { Mapping, TrackUI } from "@shared/types";
import { spotifyToTrackUI, youtubeToTrackUI } from "../../../../shared/typeConverters";
import { getSpotifyTrackFromAI, getYoutubeTrackFromAI } from "./aiQuery";

export const txtToSpotifyTransfer = async (userId: number, tracks: TrackUI[]): Promise<Mapping[]> => {
    const spotifyAccessToken = await spotifyService.getAccessToken(userId);

    const trackPromises = tracks.map(async track => {
        const trackArtists = track.artists.length === 0 ? "" : track.artists.join(", ");
        const queryString = track.name + trackArtists === "" ? "" : ` - ${trackArtists}`;
        const queryResult = await spotifyService.searchTracks(queryString, spotifyAccessToken, 1);
        if (queryResult) return { sourceTrack: track, destinationTrack: spotifyToTrackUI(queryResult[0]) };
        const aiResult = await getSpotifyTrackFromAI(queryString, spotifyAccessToken);
        return { sourceTrack: track, destinationTrack: aiResult ? spotifyToTrackUI(aiResult) : null };
    })

    return await Promise.all(trackPromises);
}

export const txtToYoutubeTransfer = async (userId: number, tracks: TrackUI[]): Promise<Mapping[]> => {
    const youtubeAccessToken = await youtubeService.getAccessToken(userId);
    const trackPromises = tracks.map(async track => {
        const trackArtists = track.artists.length === 0 ? "" : track.artists.join(", ");
        const queryString = track.name + trackArtists === "" ? "" : ` - ${trackArtists}`;
        const queryResult = await youtubeService.searchTracks(queryString, youtubeAccessToken, 1);
        if (queryResult) return { sourceTrack: track, destinationTrack: youtubeToTrackUI(queryResult[0]) };
        const aiResult = await getYoutubeTrackFromAI(queryString, youtubeAccessToken);
        return { sourceTrack: track, destinationTrack: aiResult ? youtubeToTrackUI(aiResult) : null };
    })

    return await Promise.all(trackPromises);
};

