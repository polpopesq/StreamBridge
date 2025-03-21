import SpotifyLogo from "./assets/logos/spotifyLogo.svg.png";
import YoutubeMusicLogo from "./assets/logos/youtubeMusicLogo.svg.png";
import PlainTextLogo from "./assets/logos/txtLogo.png";

export const platformData: Record<string, { name: string, description: string; logo: string }> = {
  "spotify": {
    name: "Spotify",
    description: "Spotify is a digital music streaming service with millions of songs and podcasts.",
    logo: SpotifyLogo,
  },
  "ytMusic": {
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