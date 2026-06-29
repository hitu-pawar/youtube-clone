import React from 'react'
import './Skeleton.css'

export const FeedSkeleton = ({ count = 12 }) => {
  return (
    <div className="feed">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-thumb"></div>
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-channel"></div>
          <div className="skeleton-line skeleton-views"></div>
        </div>
      ))}
    </div>
  )
}

export const SearchSkeleton = ({ count = 6 }) => {
  return (
    <div className="search-skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-search-row" key={i}>
          <div className="skeleton-search-thumb"></div>
          <div style={{ flex: 1 }}>
            <div className="skeleton-line" style={{ width: "80%" }}></div>
            <div className="skeleton-line" style={{ width: "40%" }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}