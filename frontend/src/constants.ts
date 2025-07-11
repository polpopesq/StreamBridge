import SpotifyLogo from "./assets/logos/spotifyLogo.svg.png";
import YoutubeMusicLogo from "./assets/logos/youtubeMusicLogo.svg.png";
import PlainTextLogo from "./assets/logos/txtLogo.png";
import { PlatformKey } from "@shared/types";

export const BACKEND_URL = "http://localhost:8080/api/v1";

export const platformData: Record<PlatformKey, { name: string, description: string; logo: string }> = {
  "spotify": {
    name: "Spotify",
    description: "Spotify is a digital music streaming service with millions of songs and podcasts.",
    logo: SpotifyLogo,
  },
  "youtube": {
    name: "YouTube Music",
    description: "YouTube Music allows users to stream music and watch music videos.",
    logo: YoutubeMusicLogo,
  },
  "txt": {
    name: "Text Simplu",
    description: "Încarcă un fișier .txt sau copiază playlist-ul în format Artist - Melodie",
    logo: PlainTextLogo,
  },
};

export const navbarPages = ['acasa', 'platforme', 'login'];
export const loggedNavbarPages = ['acasa', 'platforme', 'transfera', 'contul meu', 'logout'];
export const adminNavbarPages = ['acasa', 'platforme', 'transfera', 'contul meu', 'logout', 'admin dashboard'];