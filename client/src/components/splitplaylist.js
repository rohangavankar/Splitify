import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import '../App.css'; // Importing our custom CSS file

function SplitPlaylist() {
    const [playlists, setPlaylists] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBpmInput, setShowBpmInput] = useState(false);  
    const [bpm, setBpm] = useState('');  
    const [successMessage, setSuccessMessage] = useState('');
    const [successMessage2, setSuccessMessage2] = useState('');
    const [genre, setGenre] = useState('');
    const [danceability, setDanceability] = useState(''); 

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
    
    async function handleBpmSubmit(playlistId) {
        try {
            const response = await fetch(`http://localhost:4000/set-bpm/${playlistId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bpm }),
                credentials: 'include' 
            });
    
            if (!response.ok) {
                throw new Error('Failed to set BPM');
            }
    
            const data = await response.json();
            setTracks(data.tracks); // Set the filtered tracks
            setShowBpmInput(false); // Hide the input box after setting the BPM
            setSuccessMessage('Successfully made new bpm playlists, check app or refresh');
    
        } catch (err) {
            setError(err.message);
        }
    }
    async function handleDanceabilitySubmit(playlistId) {
        try {
            const response = await fetch(`http://localhost:4000/set-danceability/${playlistId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ danceability }), // Include danceability in the request
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to set Danceability');
            }
            setShowBpmInput(false); // Hide the input box after setting the BPM
            setSuccessMessage('Successfully made new Danceability playlists, check app or refresh');
            // Handle the response as needed
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleGenreSubmit(playlistId) {
        try {
            const response = await fetch(`http://localhost:4000/set-genre/${playlistId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ genre }), // Include genre in the request
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to set Genre');
            }
            
            const data = await response.json();
            // Handle the response as needed
            setShowBpmInput(false); // Hide the input box after setting the BPM
            setSuccessMessage('Successfully made new Genre playlists, check app or refresh');
        } catch (err) {
            setError(err.message);
        }
    }
    return (
        <div className="split-playlist">
            <h1>Your Playlists</h1>
            {successMessage && <p>{successMessage}</p>} {/* Display the success message here */}
            {successMessage2 && <p>{successMessage2}</p>} {/* Display the success message here */}
            <ul>
                {playlists.map(playlist => (
                    <li key={playlist.id}>
                        <a href="#" onClick={(e) => { 
                            e.preventDefault(); 
                            setShowBpmInput(playlist.id); 
                        }}>
                            <strong>{playlist.name}</strong>
                        </a> - {playlist.tracks.total} tracks
                        {showBpmInput === playlist.id && (
                            <>
                            <div>
                            <input
                              type="number"
                              value={bpm}
                              onChange={(e) => setBpm(e.target.value)}
                              placeholder="Enter BPM"
                            />
                            <setbpm onClick={() => handleBpmSubmit(playlist.id)}>Set BPM</setbpm>
                          </div>
                          
                          <div>
                            <input
                              type="text"
                              value={genre}
                              onChange={(e) => setGenre(e.target.value)}
                              placeholder="Enter Genre"
                            />
                            <setbpm onClick={() => handleGenreSubmit(playlist.id)}>Set Genre</setbpm>
                          </div>
                          <div>
                            <input
                                type="number"
                                value={danceability}
                                onChange={(e) => setDanceability(e.target.value)}
                                placeholder="Enter Danceability"
                            />
                            <setbpm onClick={() => handleDanceabilitySubmit(playlist.id)}>Set Danceability</setbpm>
                        </div>
                          </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}


export default SplitPlaylist;

