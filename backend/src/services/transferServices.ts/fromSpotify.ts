import * as spotifyService from "../spotifyService";
import * as youtubeService from "../youtubeService";
import dotenv from "dotenv";

dotenv.config();

export const spotifyToYoutubeTransfer = async (userId: number, playlistId: string):
    Promise<{ foundTracks: youtubeService.YoutubeTrack[], notFoundTracks: spotifyService.SpotifyTrack[] }> => {
    const spotifyPlaylist = await spotifyService.getPlaylistById(userId, playlistId);
    const youtubeAccessToken = await youtubeService.getAccessToken(userId);

    const { foundTracks, notFoundTracks } = await spotifyToYoutubeMapper(spotifyPlaylist, youtubeAccessToken);
    if (notFoundTracks.length !== 0) {
        console.log("Falling back to AI...");
        const { aifoundTracks, stillNotFoundTracks } = await getAllYoutubeTracksFromAI(notFoundTracks, youtubeAccessToken);
        aifoundTracks.forEach(track => foundTracks.push(track));
        return { foundTracks, notFoundTracks: stillNotFoundTracks };
    }
    return { foundTracks, notFoundTracks };
}

export const spotifyToTxtTransfer = async (userId: number, playlistId: string): Promise<string> => {
    const spotifyPlaylist = await spotifyService.getPlaylistById(userId, playlistId);

    const lines = spotifyPlaylist.tracks.map(track => {
        const artists = track.artistsNames.join(", ");
        return `${artists} - ${track.name}`;
    });

    return lines.join("\n");
};

const mapSpotifyTrackToYoutubeTrack = async (
    track: spotifyService.SpotifyTrack,
    youtubeAccessToken: string
): Promise<youtubeService.YoutubeTrack> => {
    const query = `${track.name} ${track.artistsNames.join(" ")}`;
    const result = await youtubeService.searchTrack(query, youtubeAccessToken);

    if (!result) {
        throw new Error(`No YouTube results found for "${track.name}".`);
    }
    return result;
};

const spotifyToYoutubeMapper = async (ogPlaylist: spotifyService.SpotifyPlaylist, youtubeAccessToken: string):
    Promise<{
        foundTracks: youtubeService.YoutubeTrack[],
        notFoundTracks: spotifyService.SpotifyTrack[]
    }> => {
    const foundTracks: youtubeService.YoutubeTrack[] = [];
    const notFoundTracks: spotifyService.SpotifyTrack[] = [];

    await Promise.all(
        ogPlaylist.tracks.map(async (track) => {
            try {
                const ytTrack = await mapSpotifyTrackToYoutubeTrack(track, youtubeAccessToken);
                foundTracks.push(ytTrack);
            } catch (error) {
                console.warn(`No result for track "${track.name}" by [${track.artistsNames.join(", ")}]`);
                notFoundTracks.push(track);
            }
        })
    );

    return { foundTracks, notFoundTracks };
};

const getAllYoutubeTracksFromAI = async (tracks: spotifyService.SpotifyTrack[], accessToken: string,):
    Promise<{ aifoundTracks: youtubeService.YoutubeTrack[], stillNotFoundTracks: spotifyService.SpotifyTrack[] }> => {
    const aifoundTracks: youtubeService.YoutubeTrack[] = [];
    const stillNotFoundTracks: spotifyService.SpotifyTrack[] = [];

    await Promise.all(
        tracks.map(async (track) => {
            try {
                const ytTrack = await getYoutubeTrackFromAI(track.name, track.artistsNames, accessToken);
                aifoundTracks.push(ytTrack);
            } catch (error) {
                console.warn(`Still no AI result for track "${track.name}" by [${track.artistsNames.join(", ")}]`);
                stillNotFoundTracks.push(track);
            }
        })
    );

    return { aifoundTracks, stillNotFoundTracks };
}

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