import { YoutubeTrack, SpotifyTrack } from "@shared/types";
import * as youtubeService from "../youtubeService";
import * as spotifyService from "../spotifyService";
import dotenv from "dotenv";

dotenv.config();
const aiApiKey = process.env.OPENROUTER_API_KEY;
const queryUrl = "https://openrouter.ai/api/v1/chat/completions";
const fallbackModel = "mistralai/mixtral-8x7b";

export const getYoutubeTrackFromAI = async (prompt: string, accessToken: string): Promise<YoutubeTrack | null> => {
    const response = await fetch(queryUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${aiApiKey}`,
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
    if (!youtubeId) return null;

    return await youtubeService.getYoutubeVideoDetails(youtubeId, accessToken);
};

const extractYoutubeIdFromText = (text: string): string | null => {
    const match = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
};

export const getSpotifyTrackFromAI = async (prompt: string, accessToken: string): Promise<SpotifyTrack | null> => {
    const response = await fetch(queryUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${aiApiKey}`,
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

    if (!content || content === "") return null;

    return await spotifyService.searchTrack(content, accessToken);
};