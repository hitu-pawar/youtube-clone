import React, { useEffect, useState, useRef } from "react";
import "./PlayVideo.css";
import like from "../../assets/like.png";
import dislike from "../../assets/dislike.png";
import share from "../../assets/share.png";
import save from "../../assets/save.png";
import { API_KEY, value_converter } from "../../data";
import { addToHistory } from "../../historyUtils";
import { Link } from "react-router-dom";
import {
  isSubscribed,
  subscribeToChannel,
  unsubscribeFromChannel,
} from "../../channelUtils";
import { getNotesForVideo, addNote, deleteNote } from "../../notesUtils";
import { saveProgress, getProgress } from "../../continueWatchingUtils";
import { getPlaylists, createPlaylist, addVideoToPlaylist } from "../../playlistUtils";
import { useAuth } from "../../context/AuthContext";
import { getLikeStatus, toggleLike } from "../../likeUtils";

const PlayVideo = ({ videoId, setChannelId }) => {
  const [apiData, setApiData] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [commentData, setCommentData] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [likeStatus, setLikeStatus] = useState(null);

  // Save to Playlist state
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const { user } = useAuth();

  const playerContainerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const intervalRef = useRef(null);
  const apiDataRef = useRef(null);

  useEffect(() => {
    apiDataRef.current = apiData;
  }, [apiData]);

  useEffect(() => {
    setNotes(getNotesForVideo(videoId));
  }, [videoId]);

  // Like status fetch
  useEffect(() => {
    if (user && videoId) {
      getLikeStatus(user.uid, videoId).then(setLikeStatus);
    }
  }, [user, videoId]);

  const handleLike = async () => {
    if (!user) return;
    const newStatus = await toggleLike(user.uid, videoId, "like");
    setLikeStatus(newStatus);
  };

  const handleDislike = async () => {
    if (!user) return;
    const newStatus = await toggleLike(user.uid, videoId, "dislike");
    setLikeStatus(newStatus);
  };

  const handleAddNote = () => {
    if (noteText.trim() === "") return;
    const updated = addNote(videoId, noteText.trim());
    setNotes(updated);
    setNoteText("");
  };

  const handleDeleteNote = (noteId) => {
    const updated = deleteNote(videoId, noteId);
    setNotes(updated);
  };

  // ===== Playlist Handlers =====
  const handleOpenPlaylistModal = () => {
    const pl = getPlaylists();
    setPlaylists(Object.values(pl));
    setSavedMsg("");
    setNewPlaylistName("");
    setShowPlaylistModal(true);
  };

  const handleSaveToPlaylist = (playlistId) => {
    if (!apiData) return;
    addVideoToPlaylist(playlistId, {
      videoId,
      title: apiData.snippet.title,
      thumbnail: apiData.snippet.thumbnails.medium.url,
      channelTitle: apiData.snippet.channelTitle,
      publishedAt: apiData.snippet.publishedAt,
    });
    setSavedMsg("✅ Video saved to playlist!");
    setTimeout(() => setShowPlaylistModal(false), 1000);
  };

  const handleCreateAndSave = () => {
    if (newPlaylistName.trim() === "") return;
    const updatedObj = createPlaylist(newPlaylistName.trim());
    const newId = Object.keys(updatedObj).find(k => updatedObj[k].name === newPlaylistName.trim());
    handleSaveToPlaylist(newId);
  };
  // ===== End Playlist Handlers =====

  const fetchVideoData = async () => {
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;
    const res = await fetch(videoUrl);
    const data = await res.json();
    setApiData(data.items[0]);
  };

  const fetchChannelData = async () => {
    if (!apiData) return;
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${apiData.snippet.channelId}&key=${API_KEY}`;
    const res = await fetch(channelUrl);
    const data = await res.json();
    setChannelData(data.items[0]);
  };

  const fetchCommentData = async () => {
    try {
      const commentUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}`;
      const res = await fetch(commentUrl);
      const data = await res.json();
      setCommentData(data.items || []);
    } catch (error) {
      console.error("Comments fetch error:", error);
      setCommentData([]);
    }
  };

  useEffect(() => {
    fetchVideoData();
    fetchCommentData();
  }, [videoId]);

  useEffect(() => {
    fetchChannelData();
  }, [apiData]);

  useEffect(() => {
    if (apiData) {
      addToHistory({
        videoId,
        title: apiData.snippet.title,
        thumbnail: apiData.snippet.thumbnails.medium.url,
        channelTitle: apiData.snippet.channelTitle,
        viewCount: apiData.statistics.viewCount,
        publishedAt: apiData.snippet.publishedAt,
        watchedAt: new Date().toISOString(),
      });
    }
  }, [apiData]);

  useEffect(() => {
    if (apiData) {
      setSubscribed(isSubscribed(apiData.snippet.channelId));
    }
  }, [apiData]);

  useEffect(() => {
    if (apiData && setChannelId) {
      setChannelId(apiData.snippet.channelId);
    }
  }, [apiData]);

  const saveCurrentProgress = () => {
    const player = playerInstanceRef.current;
    if (!player || typeof player.getCurrentTime !== "function") return;
    try {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      const data = apiDataRef.current;
      saveProgress(videoId, {
        currentTime,
        duration,
        title: data?.snippet?.title || "",
        thumbnail: data?.snippet?.thumbnails?.medium?.url || "",
        channelTitle: data?.snippet?.channelTitle || "",
      });
    } catch (err) {}
  };

  useEffect(() => {
    let destroyed = false;
    const createPlayer = () => {
      if (destroyed || !playerContainerRef.current) return;
      playerInstanceRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: { autoplay: 0 },
        events: {
          onReady: (event) => {
            const progress = getProgress(videoId);
            if (progress && progress.currentTime > 10) {
              event.target.seekTo(progress.currentTime, true);
            }
          },
          onStateChange: (event) => {
            if (event.data === 1) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(saveCurrentProgress, 5000);
            } else {
              if (intervalRef.current) clearInterval(intervalRef.current);
              saveCurrentProgress();
            }
          },
        },
      });
    };
    const loadPlayer = () => {
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        const checkYT = setInterval(() => {
          if (destroyed) { clearInterval(checkYT); return; }
          if (window.YT && window.YT.Player) { clearInterval(checkYT); createPlayer(); }
        }, 100);
      }
    };
    loadPlayer();
    return () => {
      destroyed = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      saveCurrentProgress();
      if (playerInstanceRef.current?.destroy) {
        try { playerInstanceRef.current.destroy(); } catch (err) {}
        playerInstanceRef.current = null;
      }
    };
  }, [videoId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const player = playerInstanceRef.current;
      if (!player || typeof player.getCurrentTime !== "function") return;
      switch (e.key.toLowerCase()) {
        case " ": {
          e.preventDefault();
          player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
          break;
        }
        case "arrowright": e.preventDefault(); player.seekTo(player.getCurrentTime() + 5, true); break;
        case "arrowleft": e.preventDefault(); player.seekTo(Math.max(player.getCurrentTime() - 5, 0), true); break;
        case "m": player.isMuted() ? player.unMute() : player.mute(); break;
        case "f": {
          const iframe = player.getIframe();
          if (iframe?.requestFullscreen) iframe.requestFullscreen();
          else if (iframe?.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
          break;
        }
        default: break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubscribe = () => {
    if (!apiData) return;
    if (subscribed) {
      unsubscribeFromChannel(apiData.snippet.channelId);
      setSubscribed(false);
    } else {
      subscribeToChannel({
        channelId: apiData.snippet.channelId,
        channelTitle: apiData.snippet.channelTitle,
        channelThumbnail: channelData?.snippet?.thumbnails?.default?.url || "",
        subscriberCount: channelData?.statistics?.subscriberCount || 0,
      });
      setSubscribed(true);
    }
  };

  return (
    <div className="play-video">
      <div ref={playerContainerRef}></div>

      <h3>{apiData?.snippet?.title}</h3>
      <p style={{ fontSize: "12px", color: "#909090", marginTop: "4px" }}>
        ⌨️ Shortcuts: Space = Play/Pause • ← → = Seek 5s • M = Mute • F = Fullscreen
      </p>

      <div className="play-video-info">
        <p>
          {value_converter(apiData?.statistics?.viewCount)} views &bull;{" "}
          {apiData?.snippet?.publishedAt?.slice(0, 10)}
        </p>
        <div>
          {/* ===== Like Button ===== */}
          <span
            onClick={handleLike}
            style={{
              cursor: "pointer",
              background: likeStatus === "like" ? "#0f0f0f" : "transparent",
              color: likeStatus === "like" ? "#fff" : "inherit",
              padding: "6px 12px",
              borderRadius: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #ccc",
              transition: "all 0.2s",
            }}
          >
            <img src={like} alt="" style={{ filter: likeStatus === "like" ? "invert(1)" : "none" }} />
            {value_converter(apiData?.statistics?.likeCount)}
          </span>

          {/* ===== Dislike Button ===== */}
          <span
            onClick={handleDislike}
            style={{
              cursor: "pointer",
              background: likeStatus === "dislike" ? "#0f0f0f" : "transparent",
              color: likeStatus === "dislike" ? "#fff" : "inherit",
              padding: "6px 12px",
              borderRadius: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #ccc",
              marginLeft: "4px",
              transition: "all 0.2s",
            }}
          >
            <img src={dislike} alt="" style={{ filter: likeStatus === "dislike" ? "invert(1)" : "none" }} />
            Dislike
          </span>

          <span><img src={share} alt="" />Share</span>
          <span onClick={handleOpenPlaylistModal} style={{ cursor: "pointer" }}>
            <img src={save} alt="" />Save
          </span>
        </div>
      </div>

      <hr />

      <div className="publisher">
        <Link to={`/channel/${apiData?.snippet?.channelId}`}>
          <img src={channelData?.snippet?.thumbnails?.default?.url} alt="" />
        </Link>
        <div>
          <Link to={`/channel/${apiData?.snippet?.channelId}`} style={{ textDecoration: "none", color: "inherit" }}>
            <p>{apiData?.snippet?.channelTitle}</p>
          </Link>
          <span>{value_converter(channelData?.statistics?.subscriberCount)} Subscribers</span>
        </div>
        <button onClick={handleSubscribe} className={subscribed ? "subscribed-btn" : ""}>
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>

      {/* ===== Notes Section ===== */}
      <div className="notes-section" style={{ padding: "16px 0", borderTop: "1px solid #e0e0e0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h4 style={{ margin: 0 }}>📝 My Notes</h4>
          <button
            onClick={handleOpenPlaylistModal}
            style={{
              padding: "7px 14px", borderRadius: "20px", border: "1px solid #ccc",
              background: "#fff", cursor: "pointer", fontSize: "13px",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            🎵 Save to Playlist
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Write a note for this video..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <button
            onClick={handleAddNote}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#0f0f0f", color: "#fff", cursor: "pointer" }}
          >
            Add
          </button>
        </div>

        {notes.length === 0 ? (
          <p style={{ color: "#606060", fontSize: "14px" }}>Kahi notes nahit ajun. Ekhada important point lihun thev!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px", background: "#f9f9f9", borderRadius: "8px", marginBottom: "8px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "14px" }}>{note.text}</p>
                <span style={{ fontSize: "11px", color: "#909090" }}>{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <button onClick={() => handleDeleteNote(note.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#606060", fontSize: "16px" }}>✕</button>
            </div>
          ))
        )}
      </div>
      {/* ===== End Notes Section ===== */}

      {/* ===== Save to Playlist Modal ===== */}
      {showPlaylistModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", borderRadius: "12px", padding: "24px",
            width: "340px", maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>🎵 Save to Playlist</h3>
              <button onClick={() => setShowPlaylistModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            {savedMsg && <p style={{ color: "green", marginBottom: "12px" }}>{savedMsg}</p>}

            {playlists.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "#606060", marginBottom: "8px" }}>Your playlists:</p>
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => handleSaveToPlaylist(pl.id)}
                    style={{
                      padding: "10px 14px", borderRadius: "8px", marginBottom: "8px",
                      background: "#f5f5f5", cursor: "pointer", fontSize: "14px",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <span>📋 {pl.name}</span>
                    <span style={{ fontSize: "12px", color: "#909090" }}>{pl.videos?.length || 0} videos</span>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: "13px", color: "#606060", marginBottom: "8px" }}>+ New playlist:</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndSave()}
                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px" }}
              />
              <button
                onClick={handleCreateAndSave}
                style={{ padding: "8px 14px", borderRadius: "8px", border: "none", background: "#0f0f0f", color: "#fff", cursor: "pointer", fontSize: "14px" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== End Playlist Modal ===== */}

      <div className="vid-description">
        <p>{apiData?.snippet?.description?.slice(0, 250)}</p>
        <hr />
        <h4>{value_converter(apiData?.statistics?.commentCount)} Comments</h4>
        {commentData.map((item, index) => {
          const c = item.snippet.topLevelComment.snippet;
          return (
            <div key={index} className="comment">
              <img src={c.authorProfileImageUrl} alt="" />
              <div>
                <h3>{c.authorDisplayName} <span>{c.publishedAt?.slice(0, 10)}</span></h3>
                <p>{c.textDisplay}</p>
                <div className="comment-action">
                  <img src={like} alt="" />
                  <span>{value_converter(c.likeCount)}</span>
                  <img src={dislike} alt="" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayVideo;