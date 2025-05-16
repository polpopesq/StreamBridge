import { SpotifyService } from "./spotifyService";
import { YtService } from "./ytService";
import { PlatformKey } from "../constants";
import { Playlist } from "@shared/types";

export const PlaylistFetcher: Record<PlatformKey, () => Promise<Playlist[] | null>> = {
    "spotify": SpotifyService.getUserPlaylists,
    "ytMusic": YtService.getUserPlaylists,
    "txt": async () => {
        return null;
    }
};

export const UserFetcher: Record<PlatformKey, () => Promise<any | null>> = {
    "spotify": SpotifyService.getUser,
    "ytMusic": YtService.getUser,
    "txt": async () => {
        return null;
    }
};
