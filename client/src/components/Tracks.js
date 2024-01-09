// Playlists.js
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

function Tracks() {
    const [playlists, setPlaylists] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPlaylists() {
            try {
                const response = await fetch('http://localhost:4000/playlists');

                if (!response.ok) {
                    throw new Error('Failed to fetch playlists');
                }

                const data = await response.json();
                setPlaylists(data.items);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPlaylists();
    }, []);

    async function fetchPlaylistTracks(playlistId) {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/playlist-tracks/${playlistId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch playlist tracks');
            }

            const data = await response.json();
            setTracks(data.items.map(item => item.track));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="Tracks">
            <h1>Your Playlists</h1>
            <ul>
                {playlists.map(playlist => (
                    <li key={playlist.id}>
                        <a href="#" onClick={(e) => { 
                            e.preventDefault(); 
                            fetchPlaylistTracks(playlist.id);
                        }}>
                            <strong>{playlist.name}</strong>
                        </a> - {playlist.tracks.total} tracks
                    </li>
                ))}
            </ul>
            <h2>Tracks</h2>
            <ul>
                {tracks.map(track => (
                    <li key={track.id}>
                        {track.name} by {track.artists.map(artist => artist.name).join(', ')}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Tracks;
