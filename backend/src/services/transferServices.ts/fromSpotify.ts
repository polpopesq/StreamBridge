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
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${youtubeAccessToken}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Error searching track "${query}":`, errorText);
        throw new Error(`YouTube search API returned ${res.status}`);
    }

    const data = await res.json();
    const item = data.items?.[0];

    if (!item) {
        throw new Error(`No YouTube results found for "${query}"`);
    }

    return {
        name: item.snippet.title,
        channelName: item.snippet.channelTitle,
        youtubeId: item.id.videoId,
        description: item.snippet.description,
    };
};

const spotifyToYoutubeMapper = async (
    ogPlaylist: spotifyService.SpotifyPlaylist,
    youtubeAccessToken: string
): Promise<{
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

const getAllYoutubeTracksFromAI = async (
    tracks: spotifyService.SpotifyTrack[],
    accessToken: string,
): Promise<{
    aifoundTracks: youtubeService.YoutubeTrack[]
    stillNotFoundTracks: spotifyService.SpotifyTrack[]
}> => {
    const aifoundTracks: youtubeService.YoutubeTrack[] = [];
    const stillNotFoundTracks: spotifyService.SpotifyTrack[] = [];

    await Promise.all(
        tracks.map(async (track) => {
            try {
                const ytTrack = await getYoutubeTrackFromAI(track, accessToken);
                aifoundTracks.push(ytTrack);
            } catch (error) {
                console.warn(`Still no AI result for track "${track.name}" by [${track.artistsNames.join(", ")}]`);
                stillNotFoundTracks.push(track);
            }
        })
    );

    return { aifoundTracks, stillNotFoundTracks };
}

const getYoutubeTrackFromAI = async (
    track: spotifyService.SpotifyTrack,
    accessToken: string,
    fallbackModel: string = "mistralai/mixtral-8x7b"
): Promise<youtubeService.YoutubeTrack> => {
    const prompt = buildPromptSpotifyToYoutube(track);

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
        throw new Error(`AI fallback failed for track "${track.name}"`);
    }

    return await youtubeService.getYoutubeVideoDetails(youtubeId, accessToken);

};

const buildPromptSpotifyToYoutube = (track: spotifyService.SpotifyTrack): string => {
    return `Find a relevant YouTube video for the song "${track.name}" by ${track.artistsNames.join(", ")}. Return only the full YouTube link.`;
};

const extractYoutubeIdFromText = (text: string): string | null => {
    const match = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
};