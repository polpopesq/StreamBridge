import { SpotifyService } from "./spotifyService";
import { YoutubeService } from "./youtubeService";
import { Playlist, PlatformKey } from "@shared/types";

export const PlaylistFetcher: Record<PlatformKey, () => Promise<Playlist[] | null>> = {
    "spotify": SpotifyService.getUserPlaylists,
    "youtube": YoutubeService.getUserPlaylists,
    "txt": async () => {
        return null;
    }
};

export const UserFetcher: Record<PlatformKey, () => Promise<any | null>> = {
    "spotify": SpotifyService.getUser,
    "youtube": YoutubeService.getUser,
    "txt": async () => {
        return null;
    }
};
