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

    const spotifyAccessToken = await spotifyService.getAccessToken(userId);
    const { foundTracks, notFoundTracks } = await youtubeToSpotifyMapper(normalizedPlaylist, spotifyAccessToken);
    if (notFoundTracks.length !== 0) {
        const { aiFoundTracks, stillNotFoundTracks } = await getAllSpotifyTracksFromAI(notFoundTracks, spotifyAccessToken);
        aiFoundTracks.forEach(track => foundTracks.push(track));
        return { foundTracks, notFoundTracks: stillNotFoundTracks };
    }
    return { foundTracks, notFoundTracks };
}

export const youtubeToTxtTransfer = async (userId: number, playlistId: string): Promise<string> => {
    const youtubePlaylist = await youtubeService.getPlaylistById(userId, playlistId);
    const { foundTracks, notFoundTracks } = await youtubeToSpotifyTransfer(userId, playlistId);

    const lines: string[] = [];

    foundTracks.forEach(track => {
        const artists = track.artistsNames.join(", ");
        lines.push(`${artists} - ${track.name}`);
    });

    if (notFoundTracks.length > 0 && foundTracks.length > 0) {
        lines.push("");
    }

    notFoundTracks.forEach(track => {
        lines.push(`// youtube only: ${track.channelName} - ${track.name}`);
    });

    return lines.join("\n");
};


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

const mapYoutubeTrackToSpotifyTrack = async (
    track: youtubeService.YoutubeTrack,
    spotifyAccessToken: string
): Promise<spotifyService.SpotifyTrack> => {
    const getFirstWords = (text: string, count: number): string => {
        return text?.split(/\s+/).slice(0, count).join(" ") || "";
    };
    const strategies = [
        `${track.name} ${track.channelName}`,
        `${track.name}`,
        `${track.name} ${getFirstWords(track.description, 3)}`
    ];

    for (const query of strategies) {
        const result = await spotifyService.searchTrack(query, spotifyAccessToken);

        if (!result) {
            continue;
        }
        return result;
    }

    throw new Error(`No Spotify results found for "${track.name}" after all strategies`);
};

const youtubeToSpotifyMapper = async (normalizedPlaylist: youtubeService.YoutubePlaylist, spotifyAccessToken: string):
    Promise<{ foundTracks: spotifyService.SpotifyTrack[]; notFoundTracks: youtubeService.YoutubeTrack[]; }> => {
    const foundTracks: spotifyService.SpotifyTrack[] = [];
    const notFoundTracks: youtubeService.YoutubeTrack[] = [];

    await Promise.all(
        normalizedPlaylist.tracks.map(async (track) => {
            try {
                const spTrack = await mapYoutubeTrackToSpotifyTrack(track, spotifyAccessToken);
                foundTracks.push(spTrack);
            } catch (error) {
                console.warn(`No result for YouTube track "${track.name}" by channel "${track.channelName}"`);
                notFoundTracks.push(track);
            }
        })
    );

    return { foundTracks, notFoundTracks };
};

const getAllSpotifyTracksFromAI = async (tracks: youtubeService.YoutubeTrack[], accessToken: string):
    Promise<{ aiFoundTracks: spotifyService.SpotifyTrack[], stillNotFoundTracks: youtubeService.YoutubeTrack[] }> => {
    const aiFoundTracks: spotifyService.SpotifyTrack[] = [];
    const stillNotFoundTracks: youtubeService.YoutubeTrack[] = [];

    await Promise.all(
        tracks.map(async (track) => {
            try {
                const spTrack = await getSpotifyTrackFromAI(track.name, track.channelName, accessToken);
                aiFoundTracks.push(spTrack);
            } catch (error) {
                console.warn(`Still no AI result for track "${track.name}"`);
                stillNotFoundTracks.push(track);
            }
        })
    );

    return { aiFoundTracks: aiFoundTracks, stillNotFoundTracks };
};

const getSpotifyTrackFromAI = async (trackName: string, channelName: string, accessToken: string, fallbackModel: string = "mistralai/mixtral-8x7b"):
    Promise<spotifyService.SpotifyTrack> => {
    const prompt = buildPromptYoutubeToSpotify(trackName, channelName);

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

    const spotifyId = extractSpotifyIdFromText(content);
    if (!spotifyId) {
        throw new Error(`AI fallback failed for YouTube track "${trackName}"`);
    }

    return await spotifyService.getTrackDetails(spotifyId, accessToken);
};

const buildPromptYoutubeToSpotify = (trackName: string, channelName: string): string => {
    return `Find a relevant Spotify link for the song "${trackName}" from the YouTube channel "${channelName}". Return only the full Spotify track URL. Do not send anything if you don't find it.`;
};

const extractSpotifyIdFromText = (text: string): string | null => {
    const match = text.match(/(?:https?:\/\/)?(?:open\.spotify\.com\/track\/)([\w\d]{22})/);
    return match ? match[1] : null;
};
