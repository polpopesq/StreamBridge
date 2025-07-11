import SpotifyWebApi from "spotify-web-api-node";
import crypto from "crypto";
import dotenv from "dotenv";
import { pool } from "../config/db";
import { SpotifyPlaylist, SpotifyTrack } from "@shared/types";

dotenv.config();

export class SpotifyAuthRequiredError extends Error {
  constructor() {
    super("User needs to authenticate with Spotify");
    this.name = "SpotifyAuthRequiredError";
  }
}

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
  "user-read-email",
];

const createLoginURL = (step: string): { url: string; state: string } => {
  const csrfToken = crypto.randomBytes(16).toString("hex");
  const state = `${csrfToken}__${step}`;
  const url = createSpotifyApi().createAuthorizeURL(scopes, state, true);
  return { url, state };
};

export const prepareLoginRedirect = (step: string = "0") => {
  const { url, state } = createLoginURL(step);
  return { url, csrfToken: state.split("__")[0] };
}

export const getAccessToken = async (userId: number): Promise<string> => {
  const cached = tokenCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.accessToken;

  const refreshToken = await getRefreshTokenFromDB(userId);
  if (!refreshToken) throw new SpotifyAuthRequiredError;

  const refreshed = await refreshAccessToken(refreshToken);
  if (!refreshed) throw new SpotifyAuthRequiredError;

  tokenCache.set(userId, refreshed);
  return refreshed.accessToken;
}

export const exchangeCodeForTokens = async (code: string, userId: number): Promise<void> => {
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

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string, expiresAt: number } | null> => {
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
    expiresAt: Date.now() + data.expires_in * 1000
  };
}

const simplifyPlaylist = (playlist: any): Omit<SpotifyPlaylist, "tracks"> => ({
  id: playlist.id,
  name: playlist.name,
  imageUrl: playlist.images?.[0]?.url ?? "",
  public: playlist.public,
});

export const simplifyTrack = (item: any): SpotifyTrack => {
  if (item.type === "track") return {
    spotifyId: item.id,
    name: item.name,
    artists: item.artists.map((artist: any) => artist.name)
  }
  else return {
    spotifyId: item.id ? item.id : item.track.id,
    name: item.track.name,
    artists: item.track.artists.map((artist: any) => artist.name)
  }
}

const getPlaylistTracks = async (playlistId: string, accessToken: string): Promise<SpotifyTrack[]> => {
  const href = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
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
  const simplifiedTracks = tracks.map((track) => simplifyTrack(track))

  return simplifiedTracks;
}

const getUserPlaylists = async (userId: number): Promise<Omit<SpotifyPlaylist, "tracks">[]> => {
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

  return data.items.map((playlist: any) => simplifyPlaylist(playlist));
}

export const getUserPlaylistsWithTracks = async (userId: number): Promise<SpotifyPlaylist[]> => {
  try {
    const simplifiedPlaylists = await getUserPlaylists(userId);
    const accessToken = await getAccessToken(userId);

    const playlistsWithTracks = await Promise.all(
      simplifiedPlaylists.map(async (playlist) => {
        const tracks = await getPlaylistTracks(playlist.id, accessToken);
        const completePlaylist = {
          ...playlist,
          tracks
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

export const getPlaylistById = async (userId: number, playlistId: string): Promise<SpotifyPlaylist> => {
  const accessToken = await getAccessToken(userId);
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify getPlaylistById error: ${errorText}`);
  }

  const data = await response.json();
  const playlistWithoutTracks = simplifyPlaylist(data);
  const tracks = await getPlaylistTracks(playlistWithoutTracks.id, accessToken);

  return {
    ...playlistWithoutTracks,
    tracks
  }
};

export const getTrackDetails = async (trackId: string, accessToken: string): Promise<SpotifyTrack> => {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Spotify track details for ${trackId}: ${errorText}`);
  }

  const data = await response.json();

  return simplifyTrack(data);
};

export const searchTracks = async (query: string, accessToken: string, limit: number): Promise<SpotifyTrack[] | null> => {
  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "track");
  url.searchParams.set("limit", limit.toString());

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Error searching track "${query}" on Spotify:`, errorText);
    return null;
  }

  const data = await res.json();
  const items = data.tracks?.items;
  if (items) {
    return items.map((item: any) => simplifyTrack(item));
  } else {
    console.warn("No spotify results for query ", query);
    return null;
  }
}

const addTracksToPlaylist = async (accessToken: string, playlistId: string, trackIds: string[]) => {
  const uris = trackIds.map(id => `spotify:track:${id}`);

  const batchSize = 100;

  for (let i = 0; i < uris.length; i += batchSize) {
    const batch = uris.slice(i, i + batchSize);

    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: batch }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`Failed to add batch starting at index ${i}:`, error);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }
};


const createPlaylist = async (accessToken: string, playlistName: string, isPublic: boolean): Promise<string> => {
  const res = await fetch('https://api.spotify.com/v1/me/playlists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: playlistName, description: "Created with StreamBridge", public: isPublic }),
  });

  const data = await res.json();
  return data.id;
}

export const postPlaylistWithTracks = async (userId: number, playlistName: string, trackIds: string[], isPublic: boolean): Promise<string> => {
  const accessToken = await getAccessToken(userId);
  const playlistId = await createPlaylist(accessToken, playlistName, isPublic);

  await addTracksToPlaylist(accessToken, playlistId, trackIds);

  return playlistId;
}