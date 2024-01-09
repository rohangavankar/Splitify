import React, { useState } from 'react';
import './App.css';
import Dashboard from './Dashboard';
import SplitPlaylist from './components/splitplaylist';
import Tracks from './components/Tracks';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Glossary from './components/glossary';
import Navbar from './components/Navbar';
function LoginPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogin = () => {
    // Here, I'm assuming that after successful authentication
    // from your server, you'll be redirected back to this React app.
    window.location = "http://localhost:4000/login";
    
  };

  if (isLoggedIn) {
    return navigate('/dashboard');
  }
  else {
  return (
    <div className="container">
        <h1>Splitify</h1>
        <h2>Welcome to Splitify</h2>
        <button onClick={handleLogin}>
            Login with Spotify
        </button>
    </div>
  );
  }
}

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar /> 
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/split" element={<SplitPlaylist />} />
                    <Route path="/tracks" element={<Tracks />} />
                    <Route path="/glossary" element={<Glossary />} />
                </Routes>
            </div>
        </Router>
    );
}


export default App;