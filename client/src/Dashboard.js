import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css'; // Importing our custom CSS file

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch('http://localhost:4000/profile');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    const getName = () => {
        if (profile && profile.display_name) {
          const fullName = profile.display_name;
          const firstName = fullName.split(' ')[0];
          return firstName;
        } else {
          return "User"; // Default name if profile doesn't have a display_name
        }
      };      


    const navigate = useNavigate(); // Initialize the navigate function


    return (
        <div className="dashboard">

            <h1>Hi, {getName()}! Welcome to Your Dashboard!</h1>
            
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <div>
                    <h2></h2>
                    <img src={profile.images[0]?.url} alt="Profile" />
                    <p>Name: {profile.display_name}</p>
                    <p>Email: {profile.email}</p>
                    <p>Country: {profile.country}</p>
                </div>
            )}
            <p>You've successfully logged in with Spotify.</p>
        </div>
    );
}




export default Dashboard;
