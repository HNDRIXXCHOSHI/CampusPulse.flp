import type { Club } from "./types";
import { Icon } from "./cp-icon";
import { Status } from "./shared";

export function ClubsView({
  clubs,
  query,
  setQuery,
  category,
  setCategory,
  sortAsc,
  setSortAsc,
  expandedClub,
  setExpandedClub,
  suspend,
  onMessage,
}: {
  clubs: Club[];
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  sortAsc: boolean;
  setSortAsc: (value: boolean) => void;
  expandedClub: string | null;
  setExpandedClub: (value: string | null) => void;
  suspend: (id: string) => void;
  onMessage: (id: string) => void;
}) {
  return (
    <>
      <section className="view-heading">
        <div>
          <p className="eyebrow">Community</p>
          <h1>Active clubs</h1>
          <p className="lede">Search, inspect, and manage every registered club.</p>
        </div>
        <div className="view-controls">
          <label className="search-control">
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search clubs"
            />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All</option>
            <option>Academic</option>
            <option>Sport</option>
            <option>Culture</option>
            <option>Advocacy</option>
            <option>Identity</option>
          </select>
          <button className="control-button" onClick={() => setSortAsc(!sortAsc)}>
            Sort {sortAsc ? "Z-A" : "A-Z"}
          </button>
        </div>
      </section>
      <article className="panel full-panel">
        <div className="club-admin-head">
          <span>Club</span>
          <span>Category</span>
          <span>Members</span>
          <span>Status</span>
        </div>
        {clubs.map((club) => (
          <div key={club.id}>
            <button
              className={`club-admin-row${expandedClub === club.id ? " expanded" : ""}`}
              onClick={() => setExpandedClub(expandedClub === club.id ? null : club.id)}
            >
              <strong>{club.name}</strong>
              <span>{club.category}</span>
              <span>{club.members}</span>
              <Status status={club.status} />
              <Icon name="chevron" />
            </button>
            {expandedClub === club.id && (
              <div className="club-detail">
                {club.photoUrl && /^https:\/\//i.test(club.photoUrl) && (
                  <img className="club-profile" src={club.photoUrl} alt={`${club.name} profile`} />
                )}
                <p>{club.description}</p>
                <p>
                  <strong>Club login code:</strong> {club.clubCode || "No assigned code"}
                </p>
                <p>
                  The assigned admin uses their existing account email and password with this code.
                </p>
                <h3>Leadership</h3>
                {!club.committee.length && <p>No leadership details have been added.</p>}
                <div className="club-committee">
                  {club.committee.map((member) => (
                    <div className="club-committee-row" key={member.role}>
                      <strong>{member.role}</strong>
                      <span>{member.name}</span>
                      <span>{member.phone}</span>
                    </div>
                  ))}
                </div>
                <div className="club-detail-footer">
                  <div>
                    <strong>Email</strong>
                    <span>{club.email}</span>
                  </div>
                  <div className="club-detail-actions">
                    <button
                      className="request-meeting"
                      onClick={(event) => {
                        event.stopPropagation();
                        onMessage(club.id);
                      }}
                    >
                      Send message
                    </button>
                    <button
                      className="text-danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        suspend(club.id);
                      }}
                    >
                      {club.status === "active" ? "Deactivate club" : "Reactivate club"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {!clubs.length && <p className="empty-state">No clubs match your filters.</p>}
      </article>
    </>
  );
}
