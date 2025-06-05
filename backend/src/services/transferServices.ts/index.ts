import { Mapping, PlatformKey } from "@shared/types";
import { spotifyToYoutubeTransfer, spotifyToTxtTransfer } from "./fromSpotify";
import { youtubeToSpotifyTransfer, youtubeToTxtTransfer } from "./fromYoutube";
import { txtToSpotifyTransfer, txtToYoutubeTransfer } from "./fromTxt";
import { youtubeToTrackUI, spotifyToTrackUI } from "../../../../shared/typeConverters";
import * as spotifyService from "../spotifyService";
import * as youtubeService from "../youtubeService";

import { pool } from "config/db";

type TransferHandler = (userId: number, playlistId: string) => Promise<any>;

const transferHandlers: Record<string, TransferHandler> = {
    "spotify|youtube": async (userId: number, playlistId: string): Promise<Mapping[]> => {
        const spotifyYoutubeMap = await spotifyToYoutubeTransfer(userId, playlistId);
        return spotifyYoutubeMap.map(mapping => ({
            sourceTrack: spotifyToTrackUI(mapping.track),
            destinationTrack: mapping.result ? youtubeToTrackUI(mapping.result) : null
        }));
    },
    "youtube|spotify": async (userId, playlistId): Promise<Mapping[]> => {
        const youtubeSpotifyMap = await youtubeToSpotifyTransfer(userId, playlistId);
        return youtubeSpotifyMap.map(mapping => ({
            sourceTrack: youtubeToTrackUI(mapping.track),
            destinationTrack: mapping.result ? spotifyToTrackUI(mapping.result) : null
        }));
    },
    "youtube|txt": async (userId, playlistId): Promise<string> => {
        return await youtubeToTxtTransfer(userId, playlistId);
    },
    "txt|youtube": async (userId, txtContent): Promise<Mapping[]> => {
        return await txtToYoutubeTransfer(userId, txtContent);
    },
    "spotify|txt": async (userId, playlistId): Promise<string> => {
        return await spotifyToTxtTransfer(userId, playlistId);
    },
    "txt|spotify": async (userId, txtContent): Promise<Mapping[]> => {
        return await txtToSpotifyTransfer(userId, txtContent);
    },
};

export const transferPlaylist = async (userId: number, source: PlatformKey, target: PlatformKey, playlistId: string)
    : Promise<{ source: PlatformKey, destination: PlatformKey, mapping: Mapping[] }> => {
    if (source === target) {
        throw new Error("Source and target platforms must be different");
    }

    const key = `${source}|${target}`;
    const handler = transferHandlers[key];

    if (!handler) {
        throw new Error(`Unsupported platform transfer: ${source} -> ${target}`);
    }

    try {
        const playlistToTransfer = await handler(userId, playlistId);
        return playlistToTransfer;
    } catch (error) {
        console.error("Error transferring playlist:", error);
        throw new Error("Error during playlist transfer");
    }
};

export const proceedTransfer = async (userId: number, source: PlatformKey, destination: PlatformKey, mappings: Mapping[], playlistTitle: string): Promise<void> => {
    await insertMappings(mappings, source, destination);
    const matched = mappings.filter(m => m.destinationTrack !== null);

    switch (destination) {
        case "spotify":
            const createdPlaylist = await spotifyService.
                case "youtube":
    }
}

const insertMappings = async (mappings: Mapping[], source: PlatformKey, destination: PlatformKey): Promise<void> => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        for (const mapping of mappings) {
            if (mapping.destinationTrack) {
                await client.query(
                    `INSERT INTO matched_songs (source_platform, destination_platform, source_id, destination_id)
                 VALUES ($1, $2, $3, $4)`,
                    [
                        source,
                        destination,
                        mapping.sourceTrack.id,
                        mapping.destinationTrack.id,
                    ]
                );
            } else {
                await client.query(
                    `INSERT INTO matched_songs (source_platform, destination_platform, source_id)
                 VALUES ($1, $2, $3, $4)`,
                    [
                        source,
                        destination,
                        mapping.sourceTrack.id,
                    ]
                );
            }

        }

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        console.warn("matched and non matched songs queries failed and rolled back");
    } finally {
        client.release();
    }
}