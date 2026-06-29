import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Home from './Pages/Home/Home'
import Video from './Pages/Video/Video'
import Search from './Pages/Search/Search'
import History from './Pages/History/History'
import Channel from './Pages/Channel/Channel'
import Stats from './Pages/Stats/Stats'
import { ToastProvider } from './Components/Toast/Toast'
import Playlists from './Pages/Playlists/Playlists'
import Playlist from './Pages/Playlist/Playlist'
import Trending from './Pages/Trending/Trending'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './Pages/Login/Login'

const AppContent = () => {
  const { user } = useAuth();

  const [sidebar, setSidebar] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  if (!user) return <Login />;

  return (
    <ToastProvider>
      <div>
        <Navbar setSidebar={setSidebar} darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path='/' element={<Home sidebar={sidebar}/>} />
          <Route path='/video/:categoryId/:videoId' element={<Video/>} />
          <Route path="/search/:searchQuery" element={<Search />} />
          <Route path="/history" element={<History />} />
          <Route path="/channel/:channelId" element={<Channel />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlist/:playlistId" element={<Playlist />} />
          <Route path="/trending" element={<Trending />} />
        </Routes>
      </div>
    </ToastProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App