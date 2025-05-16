import dotenv from 'dotenv';

dotenv.config();

export const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
export const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;
export const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI as string;
export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
export const SPOTIFY_PROFILE_URL = 'https://api.spotify.com/v1/me';
export const SCOPE = 'user-read-private user-read-email';

export enum SpotifyScopes {
  PlaylistModifyPublic = "playlist-modify-public", //Allows modification of public playlists.
  PlaylistModifyPrivate = "playlist-modify-private", //Allows modification of private playlists.
  UserTopRead = "user-top-read", //Read access to a user's top artists and tracks.
  UserLibraryModify = "user-library-modify", //Write/delete access to a user's \"Your Music\" library.
}