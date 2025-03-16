import { SpotifyScopes, CLIENT_ID, SPOTIFY_REDIRECT_URI, CLIENT_SECRET } from "../../config/spotify";
import axios, { AxiosResponse } from "axios";

export const generateAuthUrl = (): string => {
    const scopesArray = Object.values(SpotifyScopes);
    const scope = scopesArray.join(" ");
    const state = Math.random().toString(36).substring(2, 15);
    return `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scope}&redirect_uri=${SPOTIFY_REDIRECT_URI}&state=${state}`;
};

interface TokenRequestParams {
    grant_type: "authorization_code";
    code: string;
    redirect_uri: string
}

interface TokenResponse {
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    refresh_token?: string;
    scope: string;
}

export const exchangeCodeForToken = async (code: string): Promise<TokenResponse> => {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        const response : AxiosResponse<TokenResponse> = await axios.post(tokenUrl, new URLSearchParams({
            code: code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            grant_type: `authorization_code`,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
            },
        });

        return response.data;
    }
    catch (err: any) {
        throw new Error(`Error during token exchange: ${err.message}`);
    }
}