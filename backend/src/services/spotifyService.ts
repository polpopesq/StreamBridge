import SpotifyWebApi from "spotify-web-api-node";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const scopes = [
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
];

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID || "",
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

export const createLoginURL = (): { url: string; state: string } => {
  const state = crypto.randomBytes(16).toString("hex");
  const url = spotifyApi.createAuthorizeURL(scopes, state, true);
  return { url, state };
};

export const exchangeCodeForTokens = async (
  code: string,
  userId: number
): Promise<void> => {
  const data = await spotifyApi.authorizationCodeGrant(code);
  const accessToken = data.body.access_token;
  const refreshToken = data.body.refresh_token;

  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);

  await saveRefreshToken(userId, refreshToken);
};

const saveRefreshToken = async (userId: number, refreshToken: string) => {
  //TODO : save refresh token into database
};

const loadTokens = () => {};
