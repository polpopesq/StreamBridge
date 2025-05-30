CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    youtube_id VARCHAR(255) UNIQUE,
    spotify_id VARCHAR(255) UNIQUE,
    youtube_refresh_token VARCHAR(255),
    spotify_refresh_token VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    source_platform VARCHAR(50),
    destination_platform VARCHAR(50),
    playlist_source_id VARCHAR(200),
    playlist_destination_id VARCHAR(200),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);