CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    youtube_id VARCHAR(255) UNIQUE,
    spotify_id VARCHAR(255) UNIQUE,
    youtube_refresh_token VARCHAR(255),
    spotify_refresh_token VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    youtube_id VARCHAR(255) UNIQUE,
    spotify_id VARCHAR(255) UNIQUE,
    image_url VARCHAR(255),
    public BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    artists_names VARCHAR(255),
    youtube_id VARCHAR(255) UNIQUE,
    spotify_id VARCHAR(255) UNIQUE,
    channel_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS playlist_tracks (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    source_platform VARCHAR(50),
    destination_platform VARCHAR(50),
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE SET NULL,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks (playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track_id ON playlist_tracks (track_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_spotify_playlist_per_user'
  ) THEN
    ALTER TABLE playlists
    ADD CONSTRAINT unique_spotify_playlist_per_user UNIQUE (spotify_id, user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_youtube_playlist_per_user'
  ) THEN
    ALTER TABLE playlists
    ADD CONSTRAINT unique_youtube_playlist_per_user UNIQUE (youtube_id, user_id);
  END IF;
END $$;