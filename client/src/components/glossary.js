import React from 'react';
import './GlossaryPage.css'; // Importing our custom CSS file
import Navbar from './Navbar';

const GlossaryPage = () => {
  return (
    <div className="glossary">
      <h1>Spotify API Glossary</h1>
      
      <div className="section">
        <h2>BPM (Beats Per Minute)</h2>
        <p>BPM is a unit of measurement that denotes the pace of the music. It represents the number of beats that occur in one minute, indicating the tempo of a song.</p>
      </div>
      
      <div className="section">
        <h2>Danceability</h2>
        <p>Danceability describes how suitable a track is for dancing based on a combination of musical elements. This is a value provided by the Spotify API.</p>
      </div>
      
      <div className="section">
        <h2>Genre</h2>
        <p>Genre classifies music into different categories based on stylistic criteria. Spotify's API provides a list of genres associated with each artist.</p>
      </div>
      
      {/* ... other sections ... */}
      
    </div>
  );
}

export default GlossaryPage;