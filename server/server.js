// server.js
const express = require('express');
const session = require('cookie-session');
const helmet = require('helmet');
const hpp = require('hpp');
const csurf = require('csurf');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const axios = require('axios');
const querystring = require('querystring');

var accessToken;
var refreshToken;
/* Import config */
dotenv.config({path: path.resolve(__dirname, '.env')});

/* Create Express App */
const app = express();

/* Set Security Configs */
app.use(helmet());
app.use(hpp());

app.use(express.json());
/* Set Cookie Settings */
app.use(
    session({
        name: 'session',
        secret: process.env.COOKIE_SECRET,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })
);
app.use(cors({
    origin: 'http://localhost:3000',  // this is the origin of your frontend app
    credentials: true,  // this allows session cookies to be sent with the request
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // list of allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization']  // list of allowed headers
}));

app.post("/post", (req, res) => {
    console.log("Connected to React");
    res.redirect("/");
  });
app.listen(4000, () => {
    console.log("I'm listening!");
});
async function fetchTracksAudioFeatures(trackIds, accessToken) {
    const trackIdsParam = trackIds.join(',');
    const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIdsParam}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    return data.audio_features;
}

async function fetchPlaylistTracks(playlistId, accessToken) {
    const tracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
    const response = await fetch(tracksUrl, { method: 'GET', headers: headers });
    if (!response.ok) {
        throw new Error(`Failed to fetch playlist tracks: ${response.statusText}`);
    }
    const data = await response.json();

    // Return just the tracks
    return data.items.map(item => item.track);
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}


app.get('/login', (req, res) => {
    var redirect_uri = 'http://localhost:4000/callback';
    var scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public playlist-read-collaborative playlist-read-private playlist-modify-private playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-library-read user-library-modify';
    res.redirect(`https://accounts.spotify.com/authorize?${querystring.stringify({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: redirect_uri,
        scope: scope})}`);
});
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    REDIRECT_URI = 'http://localhost:4000/callback'
    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
            }
        });

        // Save the access token, refresh token, etc.
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
        res.redirect('http://localhost:3000/Dashboard')
        //res.send("Access Token: " + accessToken + "<br>Refresh Token: " + refreshToken);

    } catch (err) {
        res.send("Error: " + err.message);
    }
});
app.get('/current-session', (req, res) => {
    jwt.verify(req.session.jwt, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
        if (err || !decodedToken) {
            res.send(false);
        } else {
            res.send(decodedToken);
        }
    });
})
/*
app.get('/gettoken', (req, res) => {
    res.json({
        accessToken: req.session.accessToken,
        refreshToken: req.session.refreshToken
    });
});
*/
app.get('/library', async (req, res) => {
    console.log("Session Data:", req.session);
    console.log("chsfduv");
    console.log(accessToken);
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/tracks', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log("Success line 106"); 
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});
app.get('/playlists', async (req, res) => {
    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});
app.get('/playlist-tracks/:playlistId', async (req, res) => {
    const playlistId = req.params.playlistId;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});

app.get('/profile', async (req, res) => {
    console.log("Session Data:", req.session);
    console.log("hii");
    console.log(accessToken);
    try {
        const response = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error.message);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect(
        `/`
    );
});
async function fetchAudioFeatures(trackId) {
    try {
        const response = await axios.get(`https://api.spotify.com/v1/audio-features/${trackId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (err) {
        console.error(`Error fetching audio features for trackId: ${trackId}`, err);
        return null;
    }
}
app.post('/add-tracks-to-playlist/:playlistId', async (req, res) => {
    const playlistId = req.params.playlistId;
    const { tracks } = req.body;  // An array of track URIs
    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const response = await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: tracks
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});
app.post('/create-playlist', async (req, res) => {
    const { name, description } = req.body; // Get playlist name and description from the request body
    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const profile = await fetchProfile(accessToken); // You already have this function

        const response = await axios.post(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
            name: name,
            description: description,
            public: false
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});

app.post('/set-bpm/:playlistId', async (req, res) => {
    const playlistId = req.params.playlistId;   
    const { bpm } = req.body;
    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const tracks = await fetchPlaylistTracks(playlistId, accessToken);
        const trackIds = tracks.map(track => track.id);
        const audioFeatures = await fetchTracksAudioFeatures(trackIds, accessToken);

        // Combine audio features with track details
        const tracksWithFeatures = tracks.map(track => ({
            ...track,
            ...audioFeatures.find(feature => feature.id === track.id)
        }));
        const belowBpmTracks = tracksWithFeatures.filter(track => track.tempo < bpm);
        const aboveBpmTracks = tracksWithFeatures.filter(track => track.tempo >= bpm);
        const belowBpmUris = belowBpmTracks.map(track => track.uri);
        const aboveBpmUris = aboveBpmTracks.map(track => track.uri);
        
        // Create new playlists
        const profile = await fetchProfile(accessToken);
        
        const belowBpmPlaylist = await axios.post(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
            name: `Below ${bpm} BPM`,
            description: `Songs below ${bpm} BPM`,
            public: false
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log("success");
        const aboveBpmPlaylist = await axios.post(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
            name: `Above ${bpm} BPM`,
            description: `Songs above ${bpm} BPM`,
            public: false
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Add tracks to the new playlists
        if (belowBpmUris.length > 0) {
            await axios.post(`https://api.spotify.com/v1/playlists/${belowBpmPlaylist.data.id}/tracks`, {
                uris: belowBpmUris
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }

        if (aboveBpmUris.length > 0) {
            await axios.post(`https://api.spotify.com/v1/playlists/${aboveBpmPlaylist.data.id}/tracks`, {
                uris: aboveBpmUris
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }

        res.json({
            message: "Playlists created successfully!",
            belowBpmPlaylistId: belowBpmPlaylist.data.id,
            aboveBpmPlaylistId: aboveBpmPlaylist.data.id
        });


    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});

app.post('/create-playlist', async (req, res) => {
    const { name, description } = req.body; // Get playlist name and description from the request body

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const profile = await fetchProfile(accessToken); // You already have this function

        const response = await axios.post(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
            name: name,
            description: description,
            public: false
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});
async function createPlaylist(name, trackUris) {
    try {
      // Create a new playlist using the Spotify API
      const response = await axios.post(`https://api.spotify.com/v1/me/playlists`, {
        name: name,
        description: 'Your playlist description',
        public: false, // Set to true if you want it to be a public playlist
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Replace with your access token
        },
      });
  
      // Get the playlist ID
      const playlistId = response.data.id;
  
      // Add tracks to the new playlist
      await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        uris: trackUris,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Replace with your access token
        },
      });
  
      console.log(`Playlist "${name}" created with ${trackUris.length} tracks.`);
  
      return playlistId;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create the playlist');
    }
  }
async function getSongGenre(songId) {
    try {
      // Fetch track details using Axios
      const trackResponse = await axios.get(`https://api.spotify.com/v1/tracks/${songId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Replace with your access token
        },
      });
  
      // Get the first artist of the song
      const artistId = trackResponse.data.artists[0].id;
  
      // Fetch artist details using Axios
      const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Replace with your access token
        },
      });
  
      // Extract artist genres
      const artistGenres = artistResponse.data.genres;
      return artistGenres;
    } catch (err) {
      console.error(`Failed to fetch artist details for song with ID "${songId}"`);
      return null;
    }
  }
  
app.post('/set-genre/:playlistId', async (req, res) => {
    const playlistId = req.params.playlistId;   
    const { genre } = req.body;
    try {
        // Search for the song to get artist details using Axios
        const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`, // Replace with your access token
            },
          });
      
          // Extract the track URIs from the playlist
          const trackUris = playlistResponse.data.tracks.items.map(item => item.track.id);

          // Retrieve genres for each song and filter by the specified genre
        const filteredTrackUris = [];
        for (const songId of trackUris) {
            const songGenre = await getSongGenre(songId);
      
            if (songGenre && songGenre.includes(genre)) {
              filteredTrackUris.push(`spotify:track:${songId}`);
            }
          }
        const newPlaylistId = await createPlaylist(`Filtered Playlist by ${genre}`, filteredTrackUris);
        console.log("doneeeee");
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch artist details' });
      }
        
});

app.post('/set-danceability/:playlistId', async (req, res) => {
    // Extract playlistId and danceability from the request
    const { playlistId } = req.params;
    const { danceability } = req.body;
    const tracks = await fetchPlaylistTracks(playlistId, accessToken);
    const trackIds = tracks.map(track => track.id);
    const audioFeatures = await fetchTracksAudioFeatures(trackIds, accessToken);

        // Combine audio features with track details
    const tracksWithFeatures = tracks.map(track => ({
            ...track,
            ...audioFeatures.find(feature => feature.id === track.id)
    }));
    const belowDanceTracks = tracksWithFeatures.filter(track => track.danceability < danceability);
    const aboveDanceTracks = tracksWithFeatures.filter(track => track.danceability >= danceability);
    const belowDanceUris = belowDanceTracks.map(track => track.uri);
    const aboveDanceUris = aboveDanceTracks.map(track => track.uri);
    // Logic to fetch tracks, filter by danceability, and create a new playlist
    // ...

    const aboveID = await createPlaylist(`Songs above ${danceability} danceability`, aboveDanceUris);
    const belowID = await createPlaylist(`Songs below ${danceability} danceability`, belowDanceUris);
    
    // Return a response
    res.json({ message: 'Danceability playlist created successfully' });
});


module.exports.accessToken = accessToken;
module.exports = app;