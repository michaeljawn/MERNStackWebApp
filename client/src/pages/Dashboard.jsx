import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkLogin } from "../utils/auth";
import "../styles/common.css";
import "../styles/Dashboard.css";
import character from "../assets/character-add.svg";

function Dashboard() {
    const navigate = useNavigate();
    const [characters, setCharacters] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // CHANGES THE DISPLAY
        loadCharacters();
        loadCampaigns();
        loadAuth();
    }, []);

    async function loadAuth() {
        const auth = await checkLogin();
        setIsAdmin(!!auth.isAdmin);
    }

    // Load characters for adding to campaigns NOT DONE YETT
    async function loadCharacters() {
        try {
            const res = await fetch("http://localhost:8080/characters", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setCharacters(data);
            }
        } catch (err) {
            console.log("Error fetching characters:", err);
        }
    }

    async function loadCampaigns() {
        try {
            const res = await fetch("http://localhost:8080/campaigns", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (err) {
            console.log("Error fetching campaigns:", err);
        }
    }

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    const handleDelete = async (id) => {
        try {
            await fetch(`http://localhost:8080/characters/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            setCharacters((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            console.log("Error deleting character:", err);
        }
    };

    function calculateProficiencyBonus(level) {
        return 2+Math.floor((level-1)/4);
    }

    const classColors = {
        bard: "#c084fc", wizard: "#60a5fa", rogue: "#f87171",
        fighter: "#fb923c", cleric: "#facc15", druid: "#4ade80",
        ranger: "#34d399", paladin: "#e879f9", warlock: "#a78bfa",
        barbarian: "#f97316", monk: "#38bdf8", sorcerer: "#fb7185",
    };

    const classColor = (cls) => classColors[cls?.toLowerCase()] || "#9ca3af";

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ") : "";

    return (
        <div className="dnd-dashboard">

            <nav className="topnav">
                <span className="nav-logo">D&D</span>
                <ul className="nav-links">
                    <li><button className="nav-link active">Characters</button></li>
                    <li><button className="nav-link" onClick={() => navigate("/campaigns")}>Campaign</button></li>
                    {isAdmin && (
                        <li><button className="nav-link" onClick={() => navigate("/admin")}>Admin</button></li>
                    )}
                    <li><button className="nav-link" onClick={handleLogout}>Logout</button></li>
                </ul>
            </nav>

            <header className="hero">
                <span className="ornament">✦ ✦ ✦</span>
                <h1 className="hero-title">
                    Dungeons <span className="hero-title-accent">&amp;</span> Dragons
                </h1>
                <p className="hero-subtitle">Character Vault</p>
                <div className="hero-divider">
                    <div className="hero-divider-line"></div>
                    <div className="hero-divider-diamond"></div>
                    <div className="hero-divider-line right"></div>
                </div>
            </header>

            <main className="content">

                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-value">{characters.length}</span>
                        <span className="stat-label">Characters</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">
                            {characters.length > 0 ? Math.max(...characters.map(c => c.level || 1)) : 0}
                        </span>
                        <span className="stat-label">Highest Level</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">
                            {[...new Set(characters.map(c => c.class))].length}
                        </span>
                        <span className="stat-label">Classes</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{campaigns.length}</span>
                        <span className="stat-label">Campaigns</span>
                    </div>
                </div>

                <div className="section-header">
                    <span className="section-title">Your Characters</span>
                    <div className="section-line"></div>
                </div>

                <div className="character-grid">
                    {characters.map((char) => (
                        <div className="character-card" key={char._id}>
                            <div className="card-top">
                                <span
                                    className="card-class-badge"
                                    style={{
                                        color: classColor(char.class),
                                        borderColor: classColor(char.class) + "55",
                                        background: classColor(char.class) + "11",
                                    }}
                                >
                                    {capitalize(char.class)}
                                </span>
                                <div>
                                    <span className="card-name">{char.name}</span>
                                    <span className="card-race">{capitalize(char.species)}</span>
                                </div>
                                <div className="card-level-wrap">
                                    <span className="card-level">{char.level}</span>
                                    <span className="card-level-label">Level</span>
                                </div>
                            </div>

                            <div className="card-divider" />

                            <div className="card-stats">
                                <div className="card-stat">
                                    <span className="card-stat-val">{char.stats?.strength ?? "—"}</span>
                                    <span className="card-stat-key">Strength</span>
                                </div>
                                <div className="card-stat">
                                    <span className="card-stat-val">{char.stats?.dexterity ?? "—"}</span>
                                    <span className="card-stat-key">Dexterity</span>
                                </div>
                                <div className="card-stat">
                                    <span className="card-stat-val">{char.stats?.constitution ?? "—"}</span>
                                    <span className="card-stat-key">Constitution</span>
                                </div>
                                <div className="card-stat">
                                    <span className="card-stat-val">{char.stats?.intelligence ?? "—"}</span>
                                    <span className="card-stat-key">Intelligence</span>
                                </div>
                                <div className="card-stat">
                                    <span className="card-stat-val">{char.stats?.wisdom ?? "—"}</span>
                                    <span className="card-stat-key">Wisdom</span>
                                </div>
                                <div className="card-stat">
                                    <span className="card-stat-val">{char.stats?.charisma ?? "—"}</span>
                                    <span className="card-stat-key">Charisma</span>
                                </div>
                                <div className="card-stat">
                                    <span className="card-stat-val">{char.hp ?? "—"}</span>
                                    <span className="card-stat-key">Hit Points</span>
                                </div>
                                <div className="card-stat">
                                    <span className="card-stat-val">{calculateProficiencyBonus(char.level) ?? "—"}</span>
                                    <span className="card-stat-key">Proficiency Bonus</span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <button className="card-action" onClick={() => handleDelete(char._id)}>Delete</button>
                            </div>
                        </div>
                    ))}

                    <div className="add-card" onClick={() => navigate("/CharacterSheetCreator")}>
                        <img src={character} alt="Add new character" className="add-card-img" />
                        <span className="add-label">New Character</span>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default Dashboard;