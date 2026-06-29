import React, { useState, useEffect } from 'react'
import './Sidebar.css'
import home from '../../assets/home.png'
import game_icon from '../../assets/game_icon.png'
import automobiles from '../../assets/automobiles.png'
import sports from '../../assets/sports.png'
import entertainment from '../../assets/entertainment.png'
import tech from '../../assets/tech.png'
import music from '../../assets/music.png'
import blogs from '../../assets/blogs.png'
import news from '../../assets/news.png'
import history_icon from '../../assets/history.png'
import { Link } from 'react-router-dom'
import { getSubscriptions } from '../../channelUtils'

const Sidebar = ({sidebar,category,setCategory}) => {

  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    setSubscriptions(getSubscriptions());
  }, []);

  return (
    <div className={`sidebar ${sidebar?"":"small-sidebar"}`}>
      <div className='sortcut-links'>
        <div className={`side-link ${category===0?"active":""}`} onClick={()=>setCategory(0)}>
            <img src={home} alt="" />
            <p>Home</p>
        </div>

        <Link to='/history' className="side-link" style={{textDecoration: "none", color: "inherit"}}>
            <img src={history_icon} alt="" />
            <p>History</p>
        </Link>

        <Link to='/stats' className="side-link" style={{textDecoration: "none", color: "inherit"}}>
            <img src={history_icon} alt="" />
            <p>Stats</p>
        </Link>

        <Link to='/trending' className="side-link" style={{textDecoration: "none", color: "inherit"}}>
            <span style={{
                width: "20px",
                marginRight: "20px",
                fontSize: "16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
            }}>🔥</span>
            <p>Trending</p>
        </Link>

        <Link to='/playlists' className="side-link" style={{textDecoration: "none", color: "inherit"}}>
            <span style={{
                width: "20px",
                marginRight: "20px",
                fontSize: "16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
            }}>📋</span>
            <p>Playlists</p>
        </Link>

        <div className={`side-link ${category===20?"active":""}`} onClick={()=>setCategory(20)}>
            <img src={game_icon} alt="" />
            <p>Gaming</p>
        </div>

        <div className={`side-link ${category===2?"active":""}`} onClick={()=>setCategory(2)}>
            <img src={automobiles} alt="" />
            <p>Automobiles</p>
        </div>

        <div className={`side-link ${category===17?"active":""}`} onClick={()=>setCategory(17)}>
            <img src={sports} alt="" />
            <p>Sports</p>
        </div>

        <div className={`side-link ${category===24?"active":""}`} onClick={()=>setCategory(24)}>
            <img src={entertainment} alt="" />
            <p>Entertainment</p>
        </div>

        <div className={`side-link ${category===28?"active":""}`} onClick={()=>setCategory(28)}>
            <img src={tech} alt="" />
            <p>Technology</p>
        </div>

        <div className={`side-link ${category===10?"active":""}`} onClick={()=>setCategory(10)}>
            <img src={music} alt="" />
            <p>Music</p>
        </div>

        <div className={`side-link ${category===22?"active":""}`} onClick={()=>setCategory(22)}>
            <img src={blogs} alt="" />
            <p>Blogs</p>
        </div>

        <div className={`side-link ${category===25?"active":""}`} onClick={()=>setCategory(25)}>
            <img src={news} alt="" />
            <p>News</p>
        </div>
        <hr />
      </div>

      <div className="subscribed-list">
          <h3>Subscribed</h3>

          {subscriptions.length === 0 && (
            <p style={{fontSize: "13px", color: "#606060", padding: "0 20px"}}>
              No subscriptions yet
            </p>
          )}

          {subscriptions.map((channel) => (
            <Link
              to={`/channel/${channel.channelId}`}
              key={channel.channelId}
              className="side-link"
              style={{textDecoration: "none", color: "inherit"}}
            >
              <img src={channel.channelThumbnail} alt="" />
              <p>{channel.channelTitle}</p>
            </Link>
          ))}
      </div>
    </div>
  )
}

export default Sidebar