import { Mapping, PlatformKey, Playlist } from "@shared/types";
import { spotifyToYoutubeTransfer, spotifyToTxtTransfer } from "./fromSpotify";
import { youtubeToSpotifyTransfer, youtubeToTxtTransfer } from "./fromYoutube";
import { txtToSpotifyTransfer, txtToYoutubeTransfer } from "./fromTxt";
import { youtubeToTrackUI, spotifyToTrackUI } from "../../../../shared/typeConverters";
import * as spotifyService from "../spotifyService";
import * as youtubeService from "../youtubeService";

import { pool } from "../../config/db";

type TransferHandler = (userId: number, playlist: Playlist) => Promise<any>;
const transferHandlers: Record<string, TransferHandler> = {
    "spotify|youtube": async (userId, playlist): Promise<Mapping[]> => {
        const spotifyYoutubeMap = await spotifyToYoutubeTransfer(userId, playlist.id);
        return spotifyYoutubeMap.map(mapping => ({
            sourceTrack: spotifyToTrackUI(mapping.track),
            destinationTrack: mapping.result ? youtubeToTrackUI(mapping.result) : null
        }));
    },
    "youtube|spotify": async (userId, playlist): Promise<Mapping[]> => {
        const youtubeSpotifyMap = await youtubeToSpotifyTransfer(userId, playlist.id);
        return youtubeSpotifyMap.map(mapping => ({
            sourceTrack: youtubeToTrackUI(mapping.track),
            destinationTrack: mapping.result ? spotifyToTrackUI(mapping.result) : null
        }));
    },
    "youtube|txt": async (userId, playlist): Promise<string> => {
        return await youtubeToTxtTransfer(userId, playlist.id);
    },
    "txt|youtube": async (userId, playlist): Promise<Mapping[]> => {
        return await txtToYoutubeTransfer(userId, playlist.tracks);
    },
    "spotify|txt": async (userId, playlist): Promise<string> => {
        return await spotifyToTxtTransfer(userId, playlist.id);
    },
    "txt|spotify": async (userId, playlist): Promise<Mapping[]> => {
        return await txtToSpotifyTransfer(userId, playlist.tracks);
    },
};

export const transferPlaylist = async (userId: number, source: PlatformKey, target: PlatformKey, playlist: Playlist)
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
        const playlistToTransfer = await handler(userId, playlist);
        return playlistToTransfer;
    } catch (error) {
        console.error("Error transferring playlist:", error);
        throw new Error("Error during playlist transfer");
    }
};

export const proceedTransfer = async (userId: number, source: PlatformKey, destination: PlatformKey, mappings: Mapping[], playlistTitle: string, isPublic: boolean, ogPlaylistId: string): Promise<string> => {
    const matchedIds = mappings.reduce<string[]>((accumulator, mapping) => {
        const id = mapping.destinationTrack?.id;
        if (id) accumulator.push(id);
        return accumulator;
    }, []);
    if (matchedIds.length === 0) {
        throw new Error("Trying to create empty playlist.");
    }

    await insertMappings(mappings, source, destination);

    let createdPlaylistId = "";

    switch (destination) {
        case "spotify":
            createdPlaylistId = await spotifyService.postPlaylistWithTracks(userId, playlistTitle, matchedIds, isPublic);
            break;
        case "youtube":
            createdPlaylistId = await youtubeService.postPlaylistWithTracks(userId, playlistTitle, matchedIds, isPublic);
    }

    await insertTransfer(userId, source, destination, ogPlaylistId, createdPlaylistId, "FINISHED");

    return createdPlaylistId;
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

const insertTransfer = async (userId: number, sourcePlatform: string, destinationPlatform: string, sourceId: string, destinationId: string, status: string): Promise<void> => {
    const query = `
        INSERT INTO transfers (
            user_id,
            source_platform,
            destination_platform,
            playlist_source_id,
            playlist_destination_id,
            status
        ) VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const values = [
        userId,
        sourcePlatform,
        destinationPlatform,
        sourceId,
        destinationId,
        status
    ];

    try {
        await pool.query(query, values);
    } catch (error) {
        console.error("Failed to insert transfer:", error);
        throw error;
    }
}

export const checkDbMapping = async (sourcePlatform: string, destinationPlatform: string, sourceId: string): Promise<string | null> => {
    const query = `
        SELECT destination_id
        FROM matched_songs
        WHERE source_platform = $1
        AND destination_platform = $2
        AND source_id = $3
        LIMIT 1
    `;

    const values = [sourcePlatform, destinationPlatform, sourceId];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return result.rows[0].destination_id;
        } else {
            return null;
        }
    } catch (err) {
        console.error("Error querying matched_songs:", err);
        return null;
    }
}