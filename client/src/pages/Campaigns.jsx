import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import "../styles/CharacterSheetCreator.css";

const SETTINGS = [
  "Forgotten Realms",
  "Eberron",
  "Ravenloft",
  "Greyhawk",
  "Planescape",
  "Spelljammer",
  "Dragonlance",
  "Homebrew",
];

function Campaigns() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [view, setView] = useState("list"); // "list" | "create" | "detail"
  const [selected, setSelected] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [message, setMessage] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");

  // Create form state
  const [form, setForm] = useState({
    name: "",
    dmName: "",
    description: "",
    setting: "Forgotten Realms",
  });

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const loadCampaigns = () => {
    fetch("http://localhost:8080/campaigns", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("data: ", data);
        setCampaigns(data);
      })
      .catch((err) => console.log("Error fetching campaigns:", err));
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setMessage("Campaign name is required.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/campaigns", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({
          name: "",
          dmName: "",
          description: "",
          setting: "Forgotten Realms",
        });
        setMessage("");
        loadCampaigns();
        setView("list");
      } else {
        setMessage(await res.text());
      }
    } catch (err) {
      setMessage("Error creating campaign.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
      if (selected?._id === id) {
        setSelected(null);
        setView("list");
      }
    } catch (err) {
      console.log("Error deleting campaign:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/campaigns/${selected._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        },
      );
      if (res.ok) {
        const updated = { ...selected, ...editForm };
        setSelected(updated);
        setCampaigns((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
        setEditing(false);
      }
    } catch (err) {
      console.log("Error updating campaign:", err);
    }
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:8080/campaigns/${selected._id}/notes`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: noteInput }),
        },
      );
      if (res.ok) {
        const newNote = {
          id: Date.now().toString(),
          text: noteInput,
          createdAt: new Date(),
        };
        const updated = {
          ...selected,
          sessionNotes: [...(selected.sessionNotes || []), newNote],
        };
        setSelected(updated);
        setCampaigns((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
        setNoteInput("");
      }
    } catch (err) {
      console.log("Error adding note:", err);
    }
  };

  const openDetail = (campaign) => {
    setSelected(campaign);
    setEditForm({
      name: campaign.name,
      dmName: campaign.dmName,
      description: campaign.description,
      setting: campaign.setting,
    });
    setEditing(false);
    setView("detail");
  };

  const handleJoin = async () => {
    if (!joinCodeInput.trim()) {
      setMessage("Please enter a join code.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/campaigns/join", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: joinCodeInput.toUpperCase() }),
      });

      if (res.ok) {
        setMessage("Joined campaign successfully!");
        setJoinCodeInput("");
        loadCampaigns(); // refresh list
      } else {
        const errorText = await res.text();
        setMessage(errorText || "Invalid join code.");
      }
    } catch (err) {
      setMessage("Error joining campaign.");
    }
  };

  return (
    <div className="campaigns-page">
      {/* NAV */}
      <nav className="topnav">
        <span className="nav-logo">⚔ Realm</span>
        <ul className="nav-links">
          <li>
            <button className="nav-link" onClick={() => navigate("/dashboard")}>
              Characters
            </button>
          </li>
          <li>
            <button className="nav-link active">Campaign</button>
          </li>
          <li>
            <button className="nav-link">Spells</button>
          </li>
          <li>
            <button className="nav-link" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <header className="hero">
        <span className="ornament">✦ ✦ ✦</span>
        <h1 className="hero-title">
          Campaign <span className="hero-title-accent">Vault</span>
        </h1>
        <p className="hero-subtitle">Manage Your Adventures</p>
        <div className="hero-divider">
          <div className="hero-divider-line"></div>
          <div className="hero-divider-diamond"></div>
          <div className="hero-divider-line right"></div>
        </div>
      </header>

      <main className="content">
        {/* ── STATS ROW ── */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{campaigns.length}</span>
            <span className="stat-label">Campaigns</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {campaigns.reduce(
                (acc, c) => acc + (c.sessionNotes?.length || 0),
                0,
              )}
            </span>
            <span className="stat-label">Session Notes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {
                [...new Set(campaigns.map((c) => c.setting).filter(Boolean))]
                  .length
              }
            </span>
            <span className="stat-label">Settings</span>
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <>
            <span className="section-title">Join Campaign:</span>
            <br></br>
            <br></br>
            <div className="field">
              <input
                type="text"
                maxLength="6"
                placeholder="ENTER CODE"
                className="join-input"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              />
              <button className="btn-new" onClick={handleJoin}>
                Join
              </button>
              {message && <p className="status-msg">{message}</p>}
            </div>

            <br />

            <div className="section-header">
              <span className="section-title">Your Campaigns</span>
              <div className="section-line"></div>
              <button
                className="btn-new"
                onClick={() => {
                  setView("create");
                  setMessage("");
                }}
              >
                + New Campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🗺</span>
                <p>No campaigns yet. Begin your legend.</p>
              </div>
            ) : (
              <div className="campaign-grid">
                {campaigns.map((c) => (
                  <div className="campaign-card" key={c._id}>
                    
                    <div className="campaign-card-top">
                      <h3 className="campaign-name">{c.name}</h3>
                      <p className="campaign-dm">DM: {c.dmName || "Unknown"}</p>
                      <span className="campaign-setting-badge">
                        {c.setting || "Homebrew"}
                      </span>
                    </div>

                    <div className="card-divider" />
                    <h3>DESCRIPTION:</h3>
                    <p className="campaign-desc">
                      {c.description || "No description provided."}
                    </p>

                    {/* JOIN CODE SECTION */}
                    <div className="card-divider" />
                    <h3>JOIN CODE:</h3>
                    <div className="campaign-code-section">
                      <span className="code-display">
                        {c.joinCode || "N/A"}
                      </span>
                    </div>

                    {/* MEMBERS LIST SECTION */}
                    <div className="card-divider" />
                    <h3>MEMBERS:</h3>
                    <div className="campaign-meta">
                      <div className="members-group">
                        <div className="members-list">
                          {c.members && c.members.length > 0 ? (
                            c.members.map((m, idx) => (
                              <span key={idx} className="member-name">
                                {m.username}
                                {idx < c.members.length - 1 ? ", " : ""}
                              </span>
                            ))
                          ) : (
                            <span className="no-members">
                              No one has joined yet
                            </span>
                          )}
                        </div>
                      </div>

                    <div className="card-divider" />
                    <h3>Notes:</h3>
                      <div className="notes-count">
                        <span>{c.sessionNotes?.length || 0}</span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button
                        className="card-action"
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="card-action primary"
                        onClick={() => openDetail(c)}
                      >
                        Open →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CREATE VIEW ── */}
        {view === "create" && (
          <div className="form-panel">
            <div className="section-header">
              <span className="section-title">New Campaign</span>
              <div className="section-line"></div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Campaign Name *</label>
                <input
                  type="text"
                  placeholder="e.g. The Lost Mines of Phandelver"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Dungeon Master</label>
                <input
                  type="text"
                  placeholder="DM's name"
                  value={form.dmName}
                  onChange={(e) => setForm({ ...form, dmName: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Setting</label>
                <select
                  value={form.setting}
                  onChange={(e) =>
                    setForm({ ...form, setting: e.target.value })
                  }
                >
                  {SETTINGS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field full-width">
                <label>Description</label>
                <textarea
                  placeholder="Describe the campaign..."
                  value={form.description}
                  rows={4}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>

            {message && <p className="form-message">{message}</p>}

            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setView("list")}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleCreate}>
                Create Campaign
              </button>
            </div>
          </div>
        )}

        {/* ── DETAIL VIEW ── */}
        {view === "detail" && selected && (
          <div className="detail-panel">
            <button className="btn-back" onClick={() => setView("list")}>
              ← Back to Campaigns
            </button>

            <div className="detail-header">
              <div>
                <span className="campaign-setting-badge">
                  {selected.setting || "Homebrew"}
                </span>
                {editing ? (
                  <input
                    className="detail-title-input"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                ) : (
                  <h2 className="detail-title">{selected.name}</h2>
                )}
                <p className="campaign-dm">
                  DM:{" "}
                  {editing ? (
                    <input
                      className="inline-input"
                      value={editForm.dmName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, dmName: e.target.value })
                      }
                    />
                  ) : (
                    selected.dmName || "Unknown"
                  )}
                </p>
              </div>
              <div className="detail-actions">
                {editing ? (
                  <>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn-save" onClick={handleUpdate}>
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    className="card-action primary"
                    onClick={() => setEditing(true)}
                  >
                    Edit Campaign
                  </button>
                )}
              </div>
            </div>

            <div className="card-divider" />

            <div className="detail-body">
              {/* Description */}
              <section className="detail-section">
                <h3 className="panel-title">Description</h3>
                {editing ? (
                  <textarea
                    value={editForm.description}
                    rows={4}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="detail-textarea"
                  />
                ) : (
                  <p className="detail-text">
                    {selected.description || "No description provided."}
                  </p>
                )}
              </section>

              {/* Session Notes */}
              <section className="detail-section">
                <h3 className="panel-title">Session Notes</h3>
                <div className="notes-list">
                  {(selected.sessionNotes || []).length === 0 ? (
                    <p className="empty-notes">
                      No notes yet. Add your first session note below.
                    </p>
                  ) : (
                    selected.sessionNotes.map((note, i) => (
                      <div className="note-item" key={note.id || i}>
                        <span className="note-index">Session {i + 1}</span>
                        <p className="note-text">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="note-input-row">
                  <input
                    type="text"
                    placeholder="Add a session note..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddNote();
                    }}
                  />
                  <button className="btn-save" onClick={handleAddNote}>
                    Add Note
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Campaigns;
