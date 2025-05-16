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

export const createLoginURL = (): { url: string; state: string } => {
  const state = crypto.randomBytes(16).toString("hex");
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

  const currentUser = await getCurrentUser(userId);
  const spotifyUserId = currentUser.id;

  await saveUserInfo(userId, refreshToken, spotifyUserId);
};

const saveUserInfo = async (userId: number, refreshToken: string, spotifyUserId: string): Promise<void> => {
  try {
    const platformId = await getPlatformIdByName('spotify');

    if (!platformId) {
      throw new Error("Platform name 'spotify' not found in the database.")
    }

    const checkQuery = `
      SELECT id FROM linked_platforms 
      WHERE user_id = $1 AND platform_id = $2
    `;
    const checkRes = await pool.query(checkQuery, [userId, platformId]);

    if (checkRes.rows.length > 0) {
      const updateQuery = `
        UPDATE linked_platforms 
        SET refresh_token = $1, user_platform_id = $2
        WHERE user_id = $3 AND platform_id = $4
      `;
      await pool.query(updateQuery, [refreshToken, spotifyUserId, userId, platformId]);
    } else {
      const insertQuery = `
        INSERT INTO linked_platforms 
        (user_id, platform_id, user_platform_id, refresh_token)
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(insertQuery, [userId, platformId, spotifyUserId, refreshToken]);
    }
  } catch (error) {
    console.error(error);
  }
};

const getRefreshTokenFromDB = async (userId: number): Promise<string | null> => {
  try {
    const platformId = await getPlatformIdByName("spotify");

    if (!platformId) {
      console.error("Platform name 'spotify' not found in the database.")
      return null;
    }

    const tokenRes = await pool.query(
      `SELECT refresh_token FROM linked_platforms 
       WHERE user_id = $1 AND platform_id = $2`,
      [userId, platformId]
    );

    if (tokenRes.rows.length === 0) {
      return null;
    }

    return tokenRes.rows[0].refresh_token;
  } catch (error) {
    console.error('Error loading tokens:', error);
    return null;
  }
};

const getPlatformIdByName = async (platformName: string): Promise<number | null> => {
  const platformRes = await pool.query(
    'SELECT id FROM platforms WHERE name = $1',
    [platformName]
  );

  return platformRes.rows.length > 0 ? platformRes.rows[0].id : null;
}

export const getCurrentUser = async (userId: number): Promise<{ display_name: string, id: string }> => {
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
  // we'll fetch tracks separately
});
const simplifyTrack = (item: any): TrackUI => ({
  name: item.track.name,
  artistsNames: item.track.artists.map((artist: any) => artist.name),
});

const getPlaylistTracks = async (
  href: string,
  accessToken: string
): Promise<any[]> => {
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

export const getPlaylistsWithTracks = async (userId: number): Promise<Playlist[]> => {
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

    const playlistsWithTracks: Playlist[] = await Promise.all(
      simplifiedPlaylists.map(async (playlist: any) => {
        const tracksData = await getPlaylistTracks(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, accessToken);

        const simplifiedTracks: TrackUI[] = tracksData
          .filter((item: any) => item.track && item.track.id)
          .map((item: any): TrackUI => simplifyTrack(item));

        return {
          ...playlist,
          tracks: simplifiedTracks,
        };
      })
    );

    return playlistsWithTracks.filter((playlist) => playlist.tracks.length > 0);
  } catch (error) {
    console.error("Error fetching playlists", error);
    throw new Error("Failed to fetch playlists");
  }
};
