import { pool } from "../config/db";
import { MatchedSong, NonMatchedSong } from "@shared/types";
import { mapRowToMatchedSong, mapRowToNonMatchedSong, mapRowsToMatchedSongs, mapRowsToNonMatchedSongs } from "../../../shared/typeConverters";

export const getMatchedSongs = async (): Promise<MatchedSong[]> => {
    const result = await pool.query("SELECT * FROM matched_songs ORDER BY id DESC");
    return mapRowsToMatchedSongs(result.rows);
};

export const createMatchedSong = async (song: MatchedSong): Promise<MatchedSong> => {
    const result = await pool.query(
        `INSERT INTO matched_songs (source_platform, destination_platform, source_id, destination_id, source_name, destination_name)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [song.source_platform, song.destination_platform, song.source_id, song.destination_id, song.source_name, song.destination_name]
    );
    return mapRowToMatchedSong(result.rows[0]);
};

export const updateMatchedSong = async (song: MatchedSong): Promise<MatchedSong> => {
    const result = await pool.query(
        `UPDATE matched_songs
     SET source_platform = $1, destination_platform = $2, source_id = $3, destination_id = $4, source_name=$5, destination_name=$6
     WHERE id = $7 RETURNING *`,
        [song.source_platform, song.destination_platform, song.source_id, song.destination_id, song.source_name, song.destination_name, song.id]
    );
    return mapRowToMatchedSong(result.rows[0]);
};

export const deleteMatchedSong = async (id: number): Promise<MatchedSong> => {
    const result = await pool.query("DELETE FROM matched_songs WHERE id = $1 RETURNING *", [id]);
    return mapRowToMatchedSong(result.rows[0]);
};

export const getNonMatchedSongs = async (): Promise<NonMatchedSong[]> => {
    const result = await pool.query("SELECT * FROM non_matched_songs ORDER BY id DESC");
    return mapRowsToNonMatchedSongs(result.rows);
};

export const updateNonMatchedSong = async (incomplete_song: NonMatchedSong, destination_id: string, destination_name: string): Promise<MatchedSong> => {
    const song = await createMatchedSong({
        ...incomplete_song,
        destination_id,
        destination_name
    })
    await deleteNonMatchedSong(song.id);
    return song;
};

export const deleteNonMatchedSong = async (id: number) => {
    const result = await pool.query("DELETE FROM non_matched_songs WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};
