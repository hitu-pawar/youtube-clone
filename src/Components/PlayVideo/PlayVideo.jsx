import React, { useEffect, useState, useRef } from "react";
import "./PlayVideo.css";
import like from "../../assets/like.png";
import dislike from "../../assets/dislike.png";
import share from "../../assets/share.png";
import save from "../../assets/save.png";
import user_profile from "../../assets/user_profile.jpg";
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

const PlayVideo = ({ videoId, setChannelId }) => {
  const [apiData, setApiData] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [commentData, setCommentData] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");

  const playerContainerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const intervalRef = useRef(null);
  const apiDataRef = useRef(null); // latest apiData sathi (closure issue avoid karण्यासाठी)

  useEffect(() => {
    apiDataRef.current = apiData;
  }, [apiData]);

  useEffect(() => {
    setNotes(getNotesForVideo(videoId));
  }, [videoId]);

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
      console.error("Comments fetch error (comments may be disabled):", error);
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

  // History madhe save kar jevha video data load hoel
  useEffect(() => {
    if (apiData) {
      addToHistory({
        videoId: videoId,
        title: apiData.snippet.title,
        thumbnail: apiData.snippet.thumbnails.medium.url,
        channelTitle: apiData.snippet.channelTitle,
        viewCount: apiData.statistics.viewCount,
        publishedAt: apiData.snippet.publishedAt,
        watchedAt: new Date().toISOString(),
      });
    }
  }, [apiData]);

  // Subscribe status check kar jevha apiData load hoel
  useEffect(() => {
    if (apiData) {
      setSubscribed(isSubscribed(apiData.snippet.channelId));
    }
  }, [apiData]);

  // Actual video chi channelId Recommended component sathi pass kar
  useEffect(() => {
    if (apiData && setChannelId) {
      setChannelId(apiData.snippet.channelId);
    }
  }, [apiData]);

  // ===== Continue Watching / Resume Playback Logic =====
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
    } catch (err) {
      // player destroyed/not ready, ignore
    }
  };

  useEffect(() => {
    let destroyed = false;

    const createPlayer = () => {
      if (destroyed || !playerContainerRef.current) return;

      playerInstanceRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: videoId,
        playerVars: { autoplay: 0 },
        events: {
          onReady: (event) => {
            const progress = getProgress(videoId);
            if (progress && progress.currentTime > 10) {
              event.target.seekTo(progress.currentTime, true);
            }
          },
          onStateChange: (event) => {
            // 1 = playing
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
          if (destroyed) {
            clearInterval(checkYT);
            return;
          }
          if (window.YT && window.YT.Player) {
            clearInterval(checkYT);
            createPlayer();
          }
        }, 100);
      }
    };

    loadPlayer();

    return () => {
      destroyed = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      saveCurrentProgress();
      if (playerInstanceRef.current && playerInstanceRef.current.destroy) {
        try {
          playerInstanceRef.current.destroy();
        } catch (err) {
          // already destroyed, ignore
        }
        playerInstanceRef.current = null;
      }
    };
  }, [videoId]);
  // ===== End Continue Watching Logic =====

  // ===== Keyboard Shortcuts =====
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Input/textarea madhe typing karat असताना shortcuts trigger व्हायला नको
      const tag = document.activeElement.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      const player = playerInstanceRef.current;
      if (!player || typeof player.getCurrentTime !== "function") return;

      switch (e.key.toLowerCase()) {
        case " ": {
          e.preventDefault();
          const state = player.getPlayerState();
          if (state === 1) {
            player.pauseVideo();
          } else {
            player.playVideo();
          }
          break;
        }
        case "arrowright": {
          e.preventDefault();
          player.seekTo(player.getCurrentTime() + 5, true);
          break;
        }
        case "arrowleft": {
          e.preventDefault();
          player.seekTo(Math.max(player.getCurrentTime() - 5, 0), true);
          break;
        }
        case "m": {
          if (player.isMuted()) {
            player.unMute();
          } else {
            player.mute();
          }
          break;
        }
        case "f": {
          const iframe = player.getIframe();
          if (iframe) {
            if (iframe.requestFullscreen) {
              iframe.requestFullscreen();
            } else if (iframe.webkitRequestFullscreen) {
              iframe.webkitRequestFullscreen();
            }
          }
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  // ===== End Keyboard Shortcuts =====

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
          <span>
            <img src={like} alt="" />
            {value_converter(apiData?.statistics?.likeCount)}
          </span>
          <span>
            <img src={dislike} alt="" />
          </span>
          <span>
            <img src={share} alt="" />
            Share
          </span>
          <span>
            <img src={save} alt="" />
            Save
          </span>
        </div>
      </div>

      <hr />

      <div className="publisher">
        <Link to={`/channel/${apiData?.snippet?.channelId}`}>
          <img src={channelData?.snippet?.thumbnails?.default?.url} alt="" />
        </Link>
        <div>
          <Link
            to={`/channel/${apiData?.snippet?.channelId}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <p>{apiData?.snippet?.channelTitle}</p>
          </Link>
          <span>
            {value_converter(channelData?.statistics?.subscriberCount)}{" "}
            Subscribers
          </span>
        </div>
        <button
          onClick={handleSubscribe}
          className={subscribed ? "subscribed-btn" : ""}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>

      <div
        className="notes-section"
        style={{ padding: "16px 0", borderTop: "1px solid #e0e0e0" }}
      >
        <h4 style={{ marginBottom: "12px" }}>📝 My Notes</h4>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Write a note for this video..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleAddNote}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#0f0f0f",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>

        {notes.length === 0 ? (
          <p style={{ color: "#606060", fontSize: "14px" }}>
            Kahi notes nahit ajun. Ekhada important point lihun thev!
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "10px",
                background: "#f9f9f9",
                borderRadius: "8px",
                marginBottom: "8px",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "14px" }}>{note.text}</p>
                <span style={{ fontSize: "11px", color: "#909090" }}>
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => handleDeleteNote(note.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#606060",
                  fontSize: "16px",
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

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
                <h3>
                  {c.authorDisplayName}{" "}
                  <span>{c.publishedAt?.slice(0, 10)}</span>
                </h3>
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