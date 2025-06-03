import * as youtubeService from "../youtubeService";
import * as spotifyService from "../spotifyService";
import { Mapping } from "@shared/types";
import { spotifyToTrackUI, txtToTrack, youtubeToTrackUI } from "../../../../shared/typeConverters";
import { getSpotifyTrackFromAI, getYoutubeTrackFromAI } from "./aiQuery";

export const txtToSpotifyTransfer = async (userId: number, txtContent: string): Promise<Mapping[]> => {
    const lines = txtContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    const spotifyAccessToken = await spotifyService.getAccessToken(userId);

    const trackPromises = lines.map(async line => {
        const queryResult = await spotifyService.searchTrack(line, spotifyAccessToken);
        if (queryResult) return { sourceTrack: txtToTrack(line), destinationTrack: spotifyToTrackUI(queryResult) };
        const aiResult = await getSpotifyTrackFromAI(line, spotifyAccessToken);
        return { sourceTrack: txtToTrack(line), destinationTrack: aiResult ? spotifyToTrackUI(aiResult) : null };
    })

    return await Promise.all(trackPromises);
}


export const txtToYoutubeTransfer = async (userId: number, txtContent: string): Promise<Mapping[]> => {
    const lines = txtContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    const youtubeAccessToken = await youtubeService.getAccessToken(userId);
    const trackPromises = lines.map(async line => {
        const queryResult = await youtubeService.searchTrack(line, youtubeAccessToken);
        if (queryResult) return { sourceTrack: txtToTrack(line), destinationTrack: youtubeToTrackUI(queryResult) };
        const aiResult = await getYoutubeTrackFromAI(line, youtubeAccessToken);
        return { sourceTrack: txtToTrack(line), destinationTrack: aiResult ? youtubeToTrackUI(aiResult) : null };
    })

    return await Promise.all(trackPromises);
};

