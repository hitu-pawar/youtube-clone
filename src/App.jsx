import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Home from './Pages/Home/Home'
import Video from './Pages/Video/Video'
import Search from './Pages/Search/Search'
import History from './Pages/History/History'
import Channel from './Pages/Channel/Channel'
import Stats from './Pages/Stats/Stats'

const App = () => {

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

  return (
    <div>
      <Navbar setSidebar={setSidebar} darkMode={darkMode} setDarkMode={setDarkMode} />
      <Routes>
        <Route path='/' element={<Home sidebar={sidebar}/>} />
        <Route path='/video/:categoryId/:videoId' element={<Video/>} />
        <Route path="/search/:searchQuery" element={<Search />} />
        <Route path="/history" element={<History />} />
        <Route path="/channel/:channelId" element={<Channel />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </div>
  )
}

export default App