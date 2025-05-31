import * as youtubeService from "../youtubeService";
import * as spotifyService from "../spotifyService";

interface ParsedTrack {
    artists: string[];
    name: string;
}

export const parseTxtToTracks = (txtContent: string): { tracks: ParsedTrack[], errors: string[] } => {
    const lines = txtContent
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const tracks: ParsedTrack[] = [];
    const errors: string[] = [];

    const validLineRegex = /^.+ - .+$/;

    for (const line of lines) {
        if (validLineRegex.test(line)) {
            const [artistsPart, namePart] = line.split(" - ");
            const artists = artistsPart.split(",").map(a => a.trim()).filter(a => a.length > 0);
            const name = namePart.trim();

            if (artists.length === 0 || name.length === 0) {
                errors.push(line);
                continue;
            }

            tracks.push({
                artists,
                name,
            });
        } else {
            errors.push(line);
        }
    }

    return {
        tracks,
        errors
    };
};


export const txtToSpotifyTransfer = async (userId: number, txtContent: string):
    Promise<{ foundTracks: spotifyService.SpotifyTrack[], notFoundTracks: string[] }> => {
    const { tracks, errors } = parseTxtToTracks(txtContent);
    const accessToken = await spotifyService.getAccessToken(userId);

    const matchedTracks: spotifyService.SpotifyTrack[] = [];
    const nonMatchedTracks: string[] = [];

    for (const parsedTrack of tracks) {
        try {
            const queryString = `${parsedTrack.artists.join(", ")}  ${parsedTrack.name}`;
            const result = await spotifyService.searchTrack(queryString, accessToken);
            if (result) {
                matchedTracks.push(result);
            } else {
                nonMatchedTracks.push(queryString);
            }
        } catch (error) {
            console.warn(`Could not find "${parsedTrack.name}" on Spotify:`, error);
        }
    }

    for (const nonParsedTrack of errors) {
        try {
            const result = await spotifyService.searchTrack(nonParsedTrack, accessToken);
            if (result) {
                matchedTracks.push(result);
            } else {
                nonMatchedTracks.push(nonParsedTrack);
            }
        } catch (error) {
            console.warn(`Could not find "${nonParsedTrack}" on Spotify:`, error);
        }
    }

    return { foundTracks: matchedTracks, notFoundTracks: nonMatchedTracks };
};


export const txtToYoutubeTransfer = async (userId: number, txtContent: string):
    Promise<{ foundTracks: youtubeService.YoutubeTrack[], notFoundTracks: string[] }> => {
    const { tracks, errors } = parseTxtToTracks(txtContent);
    const allTracks = [...tracks, ...errors];
    const accessToken = await youtubeService.getAccessToken(userId);

    const matchedTracks: youtubeService.YoutubeTrack[] = [];
    const nonMatchedTracks: string[] = [];

    for (const trackString of allTracks) {
        try {
            let queryString = "";
            if (typeof trackString === "string") {
                queryString = trackString;
            } else {
                queryString = `${trackString.artists.join(", ")} ${trackString.name}`;
            }
            const result = await youtubeService.searchTrack(queryString, accessToken);
            if (result) {
                matchedTracks.push(result);
            } else {
                nonMatchedTracks.push(queryString);
            }
        } catch (error) {
            console.warn(`Could not find "${trackString}" on YouTube:`, error);
        }
    }

    return { foundTracks: matchedTracks, notFoundTracks: nonMatchedTracks };
};
