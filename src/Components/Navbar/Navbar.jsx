import React, { useState, useEffect, useRef } from 'react'
import './Navbar.css'
import menu_icon from '../../assets/menu.png'
import logo from '../../assets/logo.png'
import search_icon from '../../assets/search.png'
import upload_icon from '../../assets/upload.png'
import more_icon from '../../assets/more.png'
import notification_icon from '../../assets/notification.png'
import profile_icon from '../../assets/jack.png'
import { Link, useNavigate, useLocation  } from 'react-router-dom'
import { getRecentSearches, addRecentSearch, removeRecentSearch } from '../../recentSearchUtils'




const Navbar = ({setSidebar, darkMode, setDarkMode}) => {

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();
  const searchWrapperRef = useRef(null);

  const location = useLocation();

useEffect(() => {
  if (!location.pathname.startsWith('/search')) {
    setSearchQuery("");
  }
}, [location.pathname]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runSearch = (query) => {
    if (query.trim() === "") return;
    addRecentSearch(query.trim());
    setRecentSearches(getRecentSearches());
    setShowRecent(false);
    navigate(`/search/${query.trim()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(searchQuery);
  };

  const handleRemoveRecent = (e, query) => {
    e.stopPropagation();
    removeRecentSearch(query);
    setRecentSearches(getRecentSearches());
  };

  return (
    <nav className='flex-div'>
        <div className='nav-left flex-div'>
            <img className='menu-icon' onClick={()=>setSidebar(prev=>prev===false?true:false)} src={menu_icon} alt="" />
            <Link to='/'><img className='logo' src={logo} alt="" /></Link>
        </div>
      

        <div className="nav-middle flex-div">
          <div className="search-box-wrapper" ref={searchWrapperRef} style={{ position: "relative", width: "100%" }}>
            <form className="search-box flex-div" onSubmit={handleSearch}>
               <input
                 type="text"
                 placeholder='Search'
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => setShowRecent(true)}
               />
              <img src={search_icon} alt="" onClick={handleSearch} style={{cursor: "pointer"}} />
            </form>

            {showRecent && recentSearches.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "45px",
                  left: 0,
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  zIndex: 100,
                  padding: "8px 0",
                }}
              >
                <p style={{ padding: "4px 16px", fontSize: "12px", color: "#909090", margin: 0 }}>
                  Recent searches
                </p>
                {recentSearches.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => runSearch(item)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f2f2f2"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span>🕒 {item}</span>
                    <span
                      onClick={(e) => handleRemoveRecent(e, item)}
                      style={{ color: "#909090", padding: "0 4px" }}
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="nav-right flex-div" style={{ position: "relative" }}>
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            style={{
              background: "none",
              border: "1px solid #ccc",
              borderRadius: "20px",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: "13px",
              whiteSpace: "nowrap",
              marginRight: "25px",
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <img
            src={upload_icon}
            alt=""
            style={{ cursor: "pointer" }}
            onClick={() => alert("🚀 Upload feature coming soon!")}
          />

          <div style={{ position: "relative" }}>
            <img
              src={more_icon}
              alt=""
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShowApps((prev) => !prev);
                setShowNotif(false);
              }}
            />
            {showApps && (
              <div
                style={{
                  position: "absolute",
                  top: "35px",
                  right: "0",
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: "8px 0",
                  width: "150px",
                  zIndex: 100,
                }}
              >
                <Link to="/" style={{ display: "block", padding: "8px 16px", color: "#0f0f0f", textDecoration: "none" }} onClick={() => setShowApps(false)}>🏠 Home</Link>
                <Link to="/history" style={{ display: "block", padding: "8px 16px", color: "#0f0f0f", textDecoration: "none" }} onClick={() => setShowApps(false)}>🕒 History</Link>
                <Link to="/stats" style={{ display: "block", padding: "8px 16px", color: "#0f0f0f", textDecoration: "none" }} onClick={() => setShowApps(false)}>📊 Stats</Link>
                <div style={{ padding: "8px 16px", color: "#909090", fontSize: "13px" }}>⚙️ Settings (soon)</div>
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <img
              src={notification_icon}
              alt=""
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShowNotif((prev) => !prev);
                setShowApps(false);
              }}
            />
            {showNotif && (
              <div
                style={{
                  position: "absolute",
                  top: "35px",
                  right: "0",
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: "12px 16px",
                  width: "220px",
                  zIndex: 100,
                  fontSize: "13px",
                  color: "#606060",
                }}
              >
                🔔 No new notifications
              </div>
            )}
          </div>

          <img src={profile_icon} className='user-icon' alt="" />
        </div>
    </nav>
  )
}

export default Navbar