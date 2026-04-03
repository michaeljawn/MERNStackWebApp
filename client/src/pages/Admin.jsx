import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/common.css";
import "../styles/Admin.css";

const SETTINGS = [
    "Forgotten Realms", "Eberron", "Ravenloft", "Greyhawk",
    "Planescape", "Spelljammer", "Dragonlance", "Homebrew",
];

function Admin() {
    const navigate = useNavigate();

    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("campaigns");
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [filterUser, setFilterUser] = useState("all");
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        fetch("http://localhost:8080/admin/campaigns", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => setCampaigns(data))
            .catch((err) => console.log("Error fetching campaigns:", err));

        fetch("http://localhost:8080/admin/users", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.log("Error fetching users:", err));
    };

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this campaign?")) return;
        try {
            const res = await fetch(`http://localhost:8080/admin/campaigns/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setCampaigns((prev) => prev.filter((c) => c._id !== id));
                showMessage("Campaign deleted successfully.");
            }
        } catch (err) { console.log("Error deleting campaign:", err); }
    };

    const startEdit = (campaign) => {
        setEditing(campaign._id);
        setEditForm({
            name: campaign.name,
            dmName: campaign.dmName || "",
            description: campaign.description || "",
            setting: campaign.setting || "Homebrew",
        });
    };

    const handleUpdate = async (id) => {
        try {
            const res = await fetch(`http://localhost:8080/admin/campaigns/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                setCampaigns((prev) =>
                    prev.map((c) => c._id === id ? { ...c, ...editForm } : c)
                );
                setEditing(null);
                showMessage("Campaign updated successfully.");
            }
        } catch (err) { console.log("Error updating campaign:", err); }
    };

    const handlePromote = async (id) => {
        if (!window.confirm("Promote this user to admin?")) return;
        try {
            const res = await fetch(`http://localhost:8080/admin/users/${id}/promote`, {
                method: "PUT",
                credentials: "include",
            });
            if (res.ok) {
                setUsers((prev) =>
                    prev.map((u) => u._id === id ? { ...u, role: "admin" } : u)
                );
                showMessage("User promoted to admin.");
            }
        } catch (err) { console.log("Error promoting user:", err); }
    };

    const filteredCampaigns = filterUser === "all"
        ? campaigns
        : campaigns.filter((c) => c.userId === filterUser);

    return (
        <div className="admin-page">

            {/* NAV */}
            <nav className="topnav">
                <span className="nav-logo">⚔ Realm</span>
                <ul className="nav-links">
                    <li><button className="nav-link" onClick={() => navigate("/dashboard")}>Characters</button></li>
                    <li><button className="nav-link" onClick={() => navigate("/campaigns")}>Campaign</button></li>
                    <li><button className="nav-link">Spells</button></li>
                    <li><button className="nav-link active">Admin</button></li>
                    <li><button className="nav-link" onClick={() => navigate("/")}>Logout</button></li>
                </ul>
            </nav>

            {/* HERO */}
            <header className="hero">
                <span className="ornament">✦ ✦ ✦</span>
                <h1 className="hero-title">
                    Admin <span className="hero-title-accent">Panel</span>
                </h1>
                <p className="hero-subtitle">Manage the Realm</p>
                <div className="hero-divider">
                    <div className="hero-divider-line"></div>
                    <div className="hero-divider-diamond"></div>
                    <div className="hero-divider-line right"></div>
                </div>
            </header>

            <main className="content">

                {/* STATS */}
                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-value">{users.length}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{campaigns.length}</span>
                        <span className="stat-label">Total Campaigns</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{users.filter(u => u.role === "admin").length}</span>
                        <span className="stat-label">Admins</span>
                    </div>
                </div>

                {/* MESSAGE */}
                {message && <div className="admin-message">{message}</div>}

                {/* TABS */}
                <div className="tabs">
                    <button className={`tab ${activeTab === "campaigns" ? "active" : ""}`} onClick={() => setActiveTab("campaigns")}>
                        📜 Campaigns
                    </button>
                    <button className={`tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
                        👥 Users
                    </button>
                </div>

                {/* ── CAMPAIGNS TAB ── */}
                {activeTab === "campaigns" && (
                    <>
                        <div className="section-header">
                            <span className="section-title">All Campaigns</span>
                            <div className="section-line"></div>
                            <select className="filter-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                                <option value="all">All Users</option>
                                {users.map((u) => (
                                    <option key={u._id} value={u._id}>{u.username}</option>
                                ))}
                            </select>
                        </div>

                        {filteredCampaigns.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">🗺</span>
                                <p>No campaigns found.</p>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Campaign</th>
                                            <th>Owner</th>
                                            <th>DM</th>
                                            <th>Setting</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCampaigns.map((c) => (
                                            editing === c._id ? (
                                                <tr key={c._id} className="editing-row">
                                                    <td>
                                                        <input className="table-input" value={editForm.name}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                                                    </td>
                                                    <td className="owner-cell">{c.ownerUsername}</td>
                                                    <td>
                                                        <input className="table-input" value={editForm.dmName}
                                                            onChange={(e) => setEditForm({ ...editForm, dmName: e.target.value })} />
                                                    </td>
                                                    <td>
                                                        <select className="table-input" value={editForm.setting}
                                                            onChange={(e) => setEditForm({ ...editForm, setting: e.target.value })}>
                                                            {SETTINGS.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td>{c.sessionNotes?.length || 0}</td>
                                                    <td className="action-cell">
                                                        <button className="btn-save-sm" onClick={() => handleUpdate(c._id)}>Save</button>
                                                        <button className="btn-cancel-sm" onClick={() => setEditing(null)}>Cancel</button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr key={c._id}>
                                                    <td className="campaign-name-cell">{c.name}</td>
                                                    <td className="owner-cell">{c.ownerUsername}</td>
                                                    <td>{c.dmName || "—"}</td>
                                                    <td><span className="setting-badge">{c.setting || "Homebrew"}</span></td>
                                                    <td>{c.sessionNotes?.length || 0}</td>
                                                    <td className="action-cell">
                                                        <button className="btn-edit" onClick={() => startEdit(c)}>Edit</button>
                                                        <button className="btn-delete" onClick={() => handleDelete(c._id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ── USERS TAB ── */}
                {activeTab === "users" && (
                    <>
                        <div className="section-header">
                            <span className="section-title">All Users</span>
                            <div className="section-line"></div>
                        </div>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Campaigns</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td className="campaign-name-cell">{u.username}</td>
                                            <td>
                                                <span className={`role-badge ${u.role === "admin" ? "admin" : "user"}`}>
                                                    {u.role === "admin" ? "Admin" : "User"}
                                                </span>
                                            </td>
                                            <td>{campaigns.filter(c => c.userId === u._id.toString()).length}</td>
                                            <td className="action-cell">
                                                {u.role !== "admin" && (
                                                    <button className="btn-edit" onClick={() => handlePromote(u._id)}>
                                                        Promote to Admin
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}

export default Admin;
