import * as youtubeService from "../youtubeService";
import * as spotifyService from "../spotifyService";
import dotenv from "dotenv";

dotenv.config();

interface YoutubeSpotifyMap {
    track: youtubeService.YoutubeTrack;
    result: spotifyService.SpotifyTrack | null;
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

const mapYoutubeTrackToSpotifyTrack = async (track: youtubeService.YoutubeTrack, spotifyAccessToken: string): Promise<YoutubeSpotifyMap> => {
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
        result = await spotifyService.searchTrack(query, spotifyAccessToken);
        if (result) {
            break;
        }
    }

    if (!result) {
        try {
            const aiResult = await getSpotifyTrackFromAI(track, spotifyAccessToken);
            result = aiResult;
        }
        catch (error) {
            console.warn(`No AI result for Youtube track ${track.name}.`);
        }
    }

    return { track, result };
};

const youtubeToSpotifyMapper = async (normalizedPlaylist: youtubeService.YoutubePlaylist, spotifyAccessToken: string): Promise<YoutubeSpotifyMap[]> => {
    const mappingPromises = normalizedPlaylist.tracks.map(track => mapYoutubeTrackToSpotifyTrack(track, spotifyAccessToken));
    return await Promise.all(mappingPromises);

    // for testing AI purposes
    //return normalizedPlaylist.tracks.map(track => ({ track, result: null }));
};

const getSpotifyTrackFromAI = async (track: youtubeService.YoutubeTrack, accessToken: string, fallbackModel: string = "deepseek/deepseek-r1-0528-qwen3-8b:free"):
    Promise<spotifyService.SpotifyTrack> => {
    const prompt = buildPromptYoutubeToSpotify(track);

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

    if (!content || content === "") {
        throw new Error(`AI fallback found no Spotify equivalent for track "${track.name}"`);
    }

    const spotifyResult = await spotifyService.searchTrack(content, accessToken);
    if (!spotifyResult) {
        throw new Error(`AI fallback found no Spotify equivalent for track "${track.name}"`);
    }

    return spotifyResult;
};

const buildPromptYoutubeToSpotify = (track: youtubeService.YoutubeTrack): string => {
    return `Knowing Youtube track name ${track.name}. Give me the song in the format artist songName.`;
};
