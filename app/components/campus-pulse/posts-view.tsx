"use client";
import { useMemo, useState } from "react";
import type { Club } from "./types";
import { dateLabel, millis, type Row } from "../../lib/portal";
import { postVisibility } from "./post-status";

type PostLayout = "grid" | "list";

function postClubName(post: Row, clubs: Club[]) {
  return clubs.find((club) => club.id === post.clubId)?.name || post.clubName || "Unknown club";
}

export function PostsView({
  posts,
  clubs,
  openPost,
}: {
  posts: Row[];
  clubs: Club[];
  openPost: (post: Row) => void;
}) {
  const [search, setSearch] = useState("");
  const [club, setClub] = useState("");
  const [visibility, setVisibility] = useState("All");
  const [layout, setLayout] = useState<PostLayout>("grid");
  const filtered = useMemo(
    () =>
      posts
        .filter(
          (post) =>
            (!club || post.clubId === club) &&
            (visibility === "All" || postVisibility(post) === visibility) &&
            `${postClubName(post, clubs)} ${post.text || ""}`
              .toLowerCase()
              .includes(search.trim().toLowerCase()),
        )
        .sort((a, b) => millis(b.createdAt) - millis(a.createdAt) || a.id.localeCompare(b.id)),
    [posts, clubs, club, visibility, search],
  );
  const clubOptions = Array.from(new Set(posts.map((post) => String(post.clubId || "")))).filter(
    Boolean,
  );

  return (
    <section className="cp-posts-page">
      <div className="cp-post-controls">
        <div className="cp-page-heading">
          <div>
            <p className="eyebrow">COMMUNITY CONTENT</p>
            <h1>Posts</h1>
            <p>Review club posts and their visibility in student feeds.</p>
          </div>
          <span className="cp-count-chip">{posts.length} total posts</span>
        </div>

        <div className="cp-post-totals">
          {["Published", "Hidden", "Other"].map((status) => (
            <button
              key={status}
              aria-pressed={visibility === status}
              onClick={() => setVisibility(visibility === status ? "All" : status)}
            >
              <span>{status}</span>
              <strong>{posts.filter((post) => postVisibility(post) === status).length}</strong>
            </button>
          ))}
        </div>

        <div className="cp-post-filters">
          <label>
            Search posts
            <input
              type="search"
              placeholder="Club name or post text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            Club
            <select value={club} onChange={(event) => setClub(event.target.value)}>
              <option value="">All clubs</option>
              {clubOptions.map((id) => (
                <option key={id} value={id}>
                  {clubs.find((item) => item.id === id)?.name ||
                    posts.find((post) => post.clubId === id)?.clubName ||
                    id}
                </option>
              ))}
            </select>
          </label>
          <label className="cp-post-visibility-filter">
            Visibility
            <span className="cp-post-visibility-control">
              <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
                {["All", "Published", "Hidden", "Other"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <span className="cp-post-layout-toggle" role="group" aria-label="Post layout">
                <button
                  type="button"
                  className={layout === "grid" ? "active" : ""}
                  aria-label="Grid view"
                  aria-pressed={layout === "grid"}
                  onClick={() => setLayout("grid")}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={layout === "list" ? "active" : ""}
                  aria-label="List view"
                  aria-pressed={layout === "list"}
                  onClick={() => setLayout("list")}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 5h11M9 12h11M9 19h11M4 5h.01M4 12h.01M4 19h.01" />
                  </svg>
                </button>
              </span>
            </span>
          </label>
        </div>
      </div>

      <p className="cp-results" role="status">
        {filtered.length} {filtered.length === 1 ? "post" : "posts"} shown · Newest first
      </p>
      <div className="cp-post-results">
        <div className={`cp-post-list cp-post-list-${layout}`}>
          {filtered.map((post) => (
            <article className="cp-post-item" key={post.id}>
              <div className="cp-post-heading">
                <div>
                  <h2>{postClubName(post, clubs)}</h2>
                  <time>{dateLabel(post.createdAt)}</time>
                </div>
                <span
                  className={`cp-visibility cp-visibility-${postVisibility(post).toLowerCase()}`}
                >
                  {postVisibility(post)}
                </span>
              </div>
              <p>{post.text || "Media post — open preview to inspect."}</p>
              <footer>
                <span>{post.type || "Post"}</span>
                <button className="control-button" onClick={() => openPost(post)}>
                  View post →
                </button>
              </footer>
            </article>
          ))}
        </div>
        {!filtered.length && (
          <div className="cp-empty">
            <h2>{posts.length ? "No matching posts" : "No posts yet"}</h2>
            <p>
              {posts.length
                ? "Try another search or filter."
                : "Posts created by club admins will appear here automatically."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
