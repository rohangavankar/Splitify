import React from 'react';
import '../App.css'; // Importing our custom CSS file

function Navbar() {
  return (
    // Your navbar JSX here
    <nav className="navbar">
      <ul className="navbar-list">
        <li><a href="/">Home</a></li>
        <li><a href="/split">Split Playlist</a></li>
        <li><a href="/tracks">View Tracks</a></li>
        <li><a href="/dashboard">View Profile</a></li>
        <li><a href="/glossary">Glossary</a></li>

      </ul>
    </nav>
  );
}

export default Navbar;