import SpotifyWebApi from "spotify-web-api-node";
import crypto from "crypto";
import dotenv from "dotenv";
import { pool } from "../config/db";
import { Playlist, TrackUI } from "@shared/types";

dotenv.config();

const tokenCache = new Map<number, { accessToken: string, expiresAt: number }>();

const createSpotifyApi = (): SpotifyWebApi => {
  return new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID || "",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });
}

const scopes = [
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
  "user-read-private",
  "user-read-email"
];

export const createLoginURL = (step: string): { url: string; state: string } => {
  const csrfToken = crypto.randomBytes(16).toString("hex");
  const state = `${csrfToken}__${step}`;
  const url = createSpotifyApi().createAuthorizeURL(scopes, state, true);
  return { url, state };
};

const getAccessToken = async (userId: number): Promise<string> => {
  //1. Poate e deja cache-uit
  const cached = tokenCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.accessToken;
  }

  //2. Nu e cache-uit dar avem refresh token in DB de la utilizari anterioare
  const refreshToken = await getRefreshTokenFromDB(userId);
  if (refreshToken !== null) {
    const refreshResult = await refreshAccessToken(refreshToken);
    if (refreshResult) {
      const { accessToken, expiresIn } = refreshResult;
      tokenCache.set(userId, { accessToken, expiresAt: Date.now() + expiresIn * 1000 });
      return accessToken;
    }
    throw new Error("Token was not refreshed");
  }

  //3. New user sau nu avem refresh token pt el for some reason
  throw new Error("User is not linked with Spotify. Start the auth flow.");
}

//first time for an user
export const exchangeCodeForTokens = async (
  code: string,
  userId: number
): Promise<void> => {
  const spotifyApi = createSpotifyApi();

  const data = await spotifyApi.authorizationCodeGrant(code);
  const accessToken = data.body.access_token;
  const expiresIn = data.body.expires_in;
  tokenCache.set(userId, { accessToken, expiresAt: Date.now() + expiresIn * 1000 });

  const refreshToken = data.body.refresh_token;

  const currentUser = await getSpotifyUser(userId);
  const spotifyUserId = currentUser.id;

  await saveUserInfo(userId, refreshToken, spotifyUserId);
};

const saveUserInfo = async (userId: number, refreshToken: string, spotifyUserId: string): Promise<void> => {
  try {
    const updateQuery = `
        UPDATE users 
        SET spotify_refresh_token = $1, spotify_id = $2
        WHERE id = $3 
      `;
    await pool.query(updateQuery, [refreshToken, spotifyUserId, userId]);

    const userPlaylists = await getPlaylistsWithTracksFromSpotify(userId);
    await Promise.all(
      userPlaylists.map((playlist) => savePlaylist(userId, playlist))
    );
  } catch (error) {
    console.error(error);
  }
};

const getRefreshTokenFromDB = async (userId: number): Promise<string | null> => {
  try {
    const tokenRes = await pool.query(
      `SELECT spotify_refresh_token FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (tokenRes.rows.length === 0) {
      return null;
    }

    return tokenRes.rows[0].spotify_refresh_token;
  } catch (error) {
    console.error('Error loading tokens:', error);
    return null;
  }
};

export const getSpotifyUser = async (userId: number): Promise<{ display_name: string, id: string }> => {
  const accessToken = await getAccessToken(userId);

  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  const data = await response.json();
  return { display_name: data.display_name, id: data.id };
}

export const refreshAccessToken = async (refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
} | null> => {
  const credentials = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    console.error("Failed to refresh access token")
    return null;
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in
  };
}

const simplifyPlaylist = (playlist: any): Omit<Playlist, "tracks"> => ({
  id: playlist.id,
  name: playlist.name,
  imageUrl: playlist.images?.[0]?.url ?? "",
  public: playlist.public,
  // we'll fetch tracks separately
});
const simplifyTrack = (item: any): SpotifyTrack => ({
  spotifyId: item.track.id,
  name: item.track.name,
  artistsNames: item.track.artists.map((artist: any) => artist.name),
});

const getPlaylistTracks = async (
  href: string,
  accessToken: string
): Promise<any> => {
  let tracks: any[] = [];
  let nextUrl: string | null = `${href}?limit=100`;

  while (nextUrl) {
    const response: Response = await fetch(nextUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error(await response.text());
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data: any = await response.json();
    tracks.push(...data.items);
    nextUrl = data.next;
  }
  return tracks;
};

export const getPlaylistsWithTracksFromSpotify = async (userId: number): Promise<SpotifyPlaylist[]> => {
  try {
    const accessToken = await getAccessToken(userId);

    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Spotify API error:", errorText);
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();

    const simplifiedPlaylists = data.items.map((playlist: any) => simplifyPlaylist(playlist));

    const playlistsWithTracks: SpotifyPlaylist[] = await Promise.all(
      simplifiedPlaylists.map(async (playlist: any) => {
        const tracksData = await getPlaylistTracks(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, accessToken);

        const simplifiedTracks: TrackUI[] = tracksData
          .filter((item: any) => item.track && item.track.id)
          .map((item: any): SpotifyTrack => simplifyTrack(item));

        const completePlaylist = {
          ...playlist,
          tracks: simplifiedTracks,
        };
        return completePlaylist;
      })
    );

    return playlistsWithTracks.filter((playlist) => playlist.tracks.length > 0);
  } catch (error) {
    console.error("Error fetching playlists", error);
    throw new Error("Failed to fetch playlists");
  }
};

export const getPlaylistsWithTracksFromDB = async (userId: number): Promise<SpotifyPlaylist[]> => {
  const playlistsQuery = `
    SELECT id, name, image_url, spotify_id, public
    FROM playlists
    WHERE user_id = $1
  `;
  const playlistsResult = await pool.query(playlistsQuery, [userId]);

  const playlists: SpotifyPlaylist[] = [];

  for (const row of playlistsResult.rows) {
    const playlistId = row.id;

    const tracksQuery = `
      SELECT t.name, t.artists_names, t.spotify_id
      FROM playlist_tracks pt
      JOIN tracks t ON pt.track_id = t.id
      WHERE pt.playlist_id = $1
      ORDER BY pt.position
    `;
    const tracksResult = await pool.query(tracksQuery, [playlistId]);

    const tracks: SpotifyTrack[] = tracksResult.rows.map((track: any) => ({
      name: track.name,
      artistsNames: track.artists_names.split(',').map((s: string) => s.trim()),
      spotifyId: track.spotify_id
    }));

    playlists.push({
      id: row.spotify_id,
      name: row.name,
      imageUrl: row.image_url,
      tracks,
      public: row.public
    });
  }

  return playlists;
};


interface SpotifyTrack extends TrackUI {
  spotifyId: string;
}

interface SpotifyPlaylist extends Omit<Playlist, "tracks"> {
  tracks: SpotifyTrack[];
}

const savePlaylist = async (userId: number, playlist: SpotifyPlaylist): Promise<void> => {
  const playlistQuery = `
    INSERT INTO playlists (user_id, spotify_id, image_url, name)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (spotify_id, user_id) DO UPDATE
    SET name = EXCLUDED.name,
        image_url = EXCLUDED.image_url
  `;
  await pool.query(playlistQuery, [userId, playlist.id, playlist.imageUrl, playlist.name]);

  const trackPromises = playlist.tracks.map(async (track, index) => {
    const insertTrackQuery = `
      INSERT INTO tracks (name, artists_names, spotify_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (spotify_id) DO NOTHING
    `;

    const insertPlaylistTrackQuery = `
    INSERT INTO playlist_tracks (playlist_id, track_id, position)
    VALUES (
      (SELECT id FROM playlists WHERE spotify_id = $1 AND user_id = $2),
      (SELECT id FROM tracks WHERE spotify_id = $3),
      $4
    )
    ON CONFLICT DO NOTHING
`;

    await pool.query(insertTrackQuery, [track.name, track.artistsNames.join(", "), track.spotifyId]);
    await pool.query(insertPlaylistTrackQuery, [playlist.id, userId, track.spotifyId, index]);
  });

  await Promise.all(trackPromises);
};