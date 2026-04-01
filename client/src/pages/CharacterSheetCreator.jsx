import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CharacterSheetCreator.css";

// ── STANDARD ARRAY (D&D 2024) ──
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const STAT_KEYS = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
const STAT_LABELS = { strength: "STR", dexterity: "DEX", constitution: "CON", intelligence: "INT", wisdom: "WIS", charisma: "CHA" };
const SIZE_OPTIONS = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
const HP_METHODS = ["Average", "Roll", "Manual"];
const ASSIGN_METHODS = ["Standard Array", "Point Buy", "Manual Entry"];

export default function CharacterSheetCreator() {
    const navigate = useNavigate();

    // ── IDENTITY ──
    const [character_name, setCharacterName] = useState("");
    const [character_class, setCharacterClass] = useState("");
    const [character_subclass, setCharacterSubclass] = useState("");
    const [character_species, setCharacterSpecies] = useState("");
    const [character_background, setCharacterBackground] = useState("");

    // ── API DATA (fetched from backend) ──
    const [classes, setClasses] = useState([]);
    const [subclasses, setSubclasses] = useState([]);
    const [species, setSpecies] = useState([]);
    const [backgrounds, setBackgrounds] = useState([]);

    // ── STAT ASSIGNMENT ──
    const [assignMethod, setAssignMethod] = useState("Standard Array");
    const [hpMethod, setHpMethod] = useState("Average");
    const [hpManual, setHpManual] = useState(0);

    // For Standard Array: track which base value is assigned to which stat
    // assignments[statKey] = index into STANDARD_ARRAY (or null)
    const [assignments, setAssignments] = useState({
        strength: null, dexterity: null, constitution: null,
        intelligence: null, wisdom: null, charisma: null,
    });

    // +2 / +1 bonuses from species — user picks which stats get them
    const [bonusPlus2, setBonusPlus2] = useState(null); // statKey
    const [bonusPlus1, setBonusPlus1] = useState(null); // statKey

    // Manual entry fallback
    const [manualStats, setManualStats] = useState({
        strength: 10, dexterity: 10, constitution: 10,
        intelligence: 10, wisdom: 10, charisma: 10,
    });

    const [size, setSize] = useState("Medium");
    const [speed, setSpeed] = useState(30);

    // ── TODO: Uncomment these when backend routes are ready ──
    // useEffect(() => {
    //     fetch("http://localhost:8080/api/classes", { credentials: "include" })
    //         .then(res => res.json()).then(setClasses);
    // }, []);
    // useEffect(() => {
    //     if (!character_class) return;
    //     fetch(`http://localhost:8080/api/subclasses?class=${character_class}`, { credentials: "include" })
    //         .then(res => res.json()).then(setSubclasses);
    // }, [character_class]);
    // useEffect(() => {
    //     fetch("http://localhost:8080/api/species", { credentials: "include" })
    //         .then(res => res.json()).then(setSpecies);
    // }, []);
    // useEffect(() => {
    //     fetch("http://localhost:8080/api/backgrounds", { credentials: "include" })
    //         .then(res => res.json()).then(setBackgrounds);
    // }, []);

    // ── COMPUTED STATS ──
    const getBase = (key) => {
        if (assignMethod === "Manual Entry") return manualStats[key];
        if (assignMethod === "Standard Array") {
            const idx = assignments[key];
            return idx !== null && idx !== undefined ? STANDARD_ARRAY[idx] : "—";
        }
        return 10; // Point Buy placeholder
    };

    const getPlus2 = (key) => bonusPlus2 === key ? 2 : 0;
    const getPlus1 = (key) => bonusPlus1 === key ? 1 : 0;

    const getTotal = (key) => {
        const base = getBase(key);
        if (base === "—") return "—";
        return Number(base) + getPlus2(key) + getPlus1(key);
    };

    const getMod = (key) => {
        const total = getTotal(key);
        if (total === "—") return "—";
        const mod = Math.floor((total - 10) / 2);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    // Standard Array: which indices are already used
    const usedIndices = Object.values(assignments).filter(v => v !== null);

    const handleAssign = (statKey, arrayIndex) => {
        setAssignments(prev => {
            const updated = { ...prev };
            // unassign any stat that had this index
            for (const k of STAT_KEYS) {
                if (updated[k] === arrayIndex) updated[k] = null;
            }
            updated[statKey] = arrayIndex === "" ? null : Number(arrayIndex);
            return updated;
        });
    };

    // Average HP: placeholder — real calc would use class hit die + CON mod * level
    const avgHP = () => {
        const conTotal = getTotal("constitution");
        if (conTotal === "—") return "?";
        const conMod = Math.floor((conTotal - 10) / 2);
        return 8 + conMod; // assuming d8 hit die, level 1
    };

    // ── PAGES ──
    const pages = ["Class", "Subclass", "Species", "Background", "Stat Assignment"];
    const [currentPage, setCurrentPage] = useState(0);
    const handlePrev = () => setCurrentPage((p) => Math.max(0, p - 1));
    const handleNext = () => setCurrentPage((p) => Math.min(pages.length - 1, p + 1));

    const sidebarValues = [
        character_class || "—",
        character_subclass || "—",
        character_species || "—",
        character_background || "—",
        assignMethod,
    ];

    return (
        <div className="characterCreator">

            <header className="creator-header">
                <span className="creator-ornament">✦ ✦ ✦</span>
                <h1 className="creator-title">Create Your Character</h1>
                <div className="creator-divider">
                    <div className="creator-divider-line"></div>
                    <div className="creator-divider-diamond"></div>
                    <div className="creator-divider-line right"></div>
                </div>
            </header>

            <div className="creator-body">

                {/* ── LEFT: IDENTITY SIDEBAR ── */}
                <section className="identity-panel">
                    <h2 className="panel-title">Identity</h2>

                    <div className="field">
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="Enter character name"
                            value={character_name}
                            onChange={(e) => setCharacterName(e.target.value)}
                        />
                    </div>

                    <nav className="identity-nav">
                        {pages.map((page, i) => (
                            <button
                                key={page}
                                className={`identity-nav-item ${i === currentPage ? "active" : ""}`}
                                onClick={() => setCurrentPage(i)}
                            >
                                <span className="identity-nav-label">{page}</span>
                                <span className="identity-nav-value">{sidebarValues[i]}</span>
                            </button>
                        ))}
                    </nav>
                </section>

                {/* ── RIGHT: PAGINATED PANEL ── */}
                <section className="stats-panel">

                    <div className="page-nav">
                        <button className="page-arrow" onClick={handlePrev} disabled={currentPage === 0}>‹</button>
                        <div className="page-title-bar">
                            <span className="page-title-label">{pages[currentPage]}</span>
                        </div>
                        <button className="page-arrow" onClick={handleNext} disabled={currentPage === pages.length - 1}>›</button>
                    </div>

                    <div className="page-content">

                        {/* ══════════════════════════════
                            PAGE 0: CLASS
                        ══════════════════════════════ */}
                        {currentPage === 0 && (
                            <div>
                                <div className="field">
                                    <label>Choose Class</label>
                                    <select
                                        value={character_class}
                                        onChange={(e) => { setCharacterClass(e.target.value); setCharacterSubclass(""); }}
                                        disabled={classes.length === 0}
                                    >
                                        <option value="">— Select a Class —</option>
                                        {classes.map((c) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="features-section">
                                    <h3 className="features-title">Class Features</h3>
                                    {classes.length === 0 ? (
                                        <p className="api-placeholder">Class features will load from the API once connected.</p>
                                    ) : character_class ? (
                                        /* When API is connected, map over class.features here */
                                        <p className="api-placeholder">Select a class to see its features.</p>
                                    ) : (
                                        <p className="api-placeholder">No class selected.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══════════════════════════════
                            PAGE 1: SUBCLASS
                            Wireframe: choose subclass dropdown,
                            then list subclass features (name, description, selections if any)
                        ══════════════════════════════ */}
                        {currentPage === 1 && (
                            <div>
                                <div className="field">
                                    <label>Choose Subclass</label>
                                    <select
                                        value={character_subclass}
                                        onChange={(e) => setCharacterSubclass(e.target.value)}
                                        disabled={subclasses.length === 0}
                                    >
                                        <option value="">— Select a Subclass —</option>
                                        {subclasses.map((s) => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {character_subclass && (
                                    <div className="features-section">
                                        <h3 className="features-title">{character_subclass} Subclass Features</h3>

                                        {/* When API connected, replace this with:
                                            selectedSubclass.features.map(feature => (
                                                <div className="feature-entry" key={feature.name}>
                                                    <p className="feature-name">{feature.name}</p>
                                                    <p className="feature-desc">{feature.description}</p>
                                                    {feature.selections && (
                                                        <div className="field">
                                                            <label>Choose</label>
                                                            <select>...</select>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        */}
                                        <p className="api-placeholder">Subclass feature details will load from the API.</p>
                                    </div>
                                )}

                                {!character_subclass && (
                                    <div className="features-section">
                                        <h3 className="features-title">Subclass Features</h3>
                                        <p className="api-placeholder">Select a subclass to see its features.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════════════════════════
                            PAGE 2: SPECIES
                            Wireframe: species dropdown, creature type / size / speed row,
                            then species traits list (name, description, choice if any)
                        ══════════════════════════════ */}
                        {currentPage === 2 && (
                            <div>
                                <div className="field">
                                    <label>Choose Species</label>
                                    <select
                                        value={character_species}
                                        onChange={(e) => setCharacterSpecies(e.target.value)}
                                        disabled={species.length === 0}
                                    >
                                        <option value="">— Select a Species —</option>
                                        {species.map((s) => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Species stat bar — populated from API when connected */}
                                <div className="species-stat-bar">
                                    <div className="species-stat">
                                        <span className="species-stat-label">Creature Type</span>
                                        {/* Replace "—" with selectedSpecies.creatureType from API */}
                                        <span className="species-stat-value">—</span>
                                    </div>
                                    <div className="species-stat-divider" />
                                    <div className="species-stat">
                                        <span className="species-stat-label">Size</span>
                                        {/* Replace with selectedSpecies.size from API, or allow override */}
                                        <select
                                            className="species-stat-select"
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                        >
                                            {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="species-stat-divider" />
                                    <div className="species-stat">
                                        <span className="species-stat-label">Speed</span>
                                        {/* Replace with selectedSpecies.speed from API */}
                                        <input
                                            className="species-stat-input"
                                            type="number"
                                            value={speed}
                                            onChange={(e) => setSpeed(Number(e.target.value))}
                                            min={0} max={120}
                                        />
                                    </div>
                                </div>

                                <div className="features-section">
                                    <h3 className="features-title">{character_species || "Species"} Traits</h3>

                                    {/* When API connected, replace with:
                                        selectedSpecies.traits.map(trait => (
                                            <div className="feature-entry" key={trait.name}>
                                                <p className="feature-name">{trait.name}</p>
                                                <p className="feature-desc">{trait.description}</p>
                                                {trait.choice && (
                                                    <div className="field">
                                                        <label>Choose</label>
                                                        <select>...</select>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    */}
                                    <p className="api-placeholder">Species traits will load from the API once connected.</p>
                                </div>
                            </div>
                        )}

                        {/* ══════════════════════════════
                            PAGE 3: BACKGROUND
                            Wireframe: background dropdown,
                            ability scores granted, feat (name/desc/selection),
                            skill proficiencies, tool proficiency, equipment choices
                        ══════════════════════════════ */}
                        {currentPage === 3 && (
                            <div>
                                <div className="field">
                                    <label>Choose Background</label>
                                    <select
                                        value={character_background}
                                        onChange={(e) => setCharacterBackground(e.target.value)}
                                        disabled={backgrounds.length === 0}
                                    >
                                        <option value="">— Select a Background —</option>
                                        {backgrounds.map((b) => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {character_background ? (
                                    <>
                                        {/* ABILITY SCORES — from API: background.abilityScores = [+AS1, +AS2, +AS3] */}
                                        <div className="bg-section">
                                            <h3 className="features-title">Ability Score Increases</h3>
                                            <p className="api-placeholder">e.g. +AS1, +AS2, +AS3 — loads from API</p>
                                        </div>

                                        {/* FEAT */}
                                        <div className="bg-section">
                                            <h3 className="features-title">Feat</h3>
                                            <p className="api-placeholder feature-name">Feat Name — loads from API</p>
                                            <p className="api-placeholder" style={{ marginTop: 4 }}>Feat description loads from API.</p>
                                            {/* If feat has a selection: */}
                                            {/* <div className="field" style={{ marginTop: 12 }}>
                                                <label>Feat Selection</label>
                                                <select>...</select>
                                            </div> */}
                                        </div>

                                        {/* SKILL PROFICIENCIES */}
                                        <div className="bg-section">
                                            <h3 className="features-title">Skill Proficiencies</h3>
                                            <p className="api-placeholder">Skill Name 1, Skill Name 2 — loads from API</p>
                                        </div>

                                        {/* TOOL PROFICIENCY */}
                                        <div className="bg-section">
                                            <h3 className="features-title">Tool Proficiency</h3>
                                            <p className="api-placeholder">Tool — loads from API</p>
                                        </div>

                                        {/* EQUIPMENT */}
                                        <div className="bg-section">
                                            <h3 className="features-title">Equipment</h3>
                                            <p className="api-placeholder">Equipment Choice A … Equipment Choice B — loads from API</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="features-section" style={{ marginTop: 24 }}>
                                        <h3 className="features-title">Background Details</h3>
                                        <p className="api-placeholder">Select a background to see its details.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════════════════════════
                            PAGE 4: STAT ASSIGNMENT
                            Wireframe: Assignment Method dropdown,
                            table of Base / +2 / +1 / Total Score / Modifier Bonus,
                            Hit Points section
                        ══════════════════════════════ */}
                        {currentPage === 4 && (
                            <div>
                                {/* Assignment method */}
                                <div className="stat-method-row">
                                    <span className="stat-method-label">Assignment Method</span>
                                    <div className="field" style={{ margin: 0, minWidth: 180 }}>
                                        <select
                                            value={assignMethod}
                                            onChange={(e) => setAssignMethod(e.target.value)}
                                        >
                                            {ASSIGN_METHODS.map(m => <option key={m}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Stat table */}
                                <div className="stat-table-wrapper">
                                    <table className="stat-table">
                                        <thead>
                                            <tr>
                                                <th className="stat-table-row-label"></th>
                                                {STAT_KEYS.map(k => (
                                                    <th key={k} className="stat-table-col-label">{STAT_LABELS[k]}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {/* BASE ROW */}
                                            <tr>
                                                <td className="stat-table-row-label">Base</td>
                                                {STAT_KEYS.map(k => (
                                                    <td key={k} className="stat-table-cell">
                                                        {assignMethod === "Standard Array" ? (
                                                            <select
                                                                className="stat-table-select"
                                                                value={assignments[k] !== null ? assignments[k] : ""}
                                                                onChange={(e) => handleAssign(k, e.target.value)}
                                                            >
                                                                <option value="">—</option>
                                                                {STANDARD_ARRAY.map((val, idx) => (
                                                                    <option
                                                                        key={idx}
                                                                        value={idx}
                                                                        disabled={usedIndices.includes(idx) && assignments[k] !== idx}
                                                                    >
                                                                        {val}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : assignMethod === "Manual Entry" ? (
                                                            <input
                                                                className="stat-table-input"
                                                                type="number" min={1} max={30}
                                                                value={manualStats[k]}
                                                                onChange={(e) => setManualStats(prev => ({ ...prev, [k]: Number(e.target.value) }))}
                                                            />
                                                        ) : (
                                                            // Point Buy placeholder
                                                            <span className="stat-table-value">—</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* +2 ROW (species bonus) */}
                                            <tr>
                                                <td className="stat-table-row-label">+2</td>
                                                {STAT_KEYS.map(k => (
                                                    <td key={k} className="stat-table-cell">
                                                        <input
                                                            type="checkbox"
                                                            className="stat-table-checkbox"
                                                            checked={bonusPlus2 === k}
                                                            onChange={() => setBonusPlus2(bonusPlus2 === k ? null : k)}
                                                            title="Apply +2 species bonus to this stat"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* +1 ROW (species bonus) */}
                                            <tr>
                                                <td className="stat-table-row-label">+1</td>
                                                {STAT_KEYS.map(k => (
                                                    <td key={k} className="stat-table-cell">
                                                        <input
                                                            type="checkbox"
                                                            className="stat-table-checkbox"
                                                            checked={bonusPlus1 === k}
                                                            onChange={() => setBonusPlus1(bonusPlus1 === k ? null : k)}
                                                            disabled={bonusPlus2 === k}
                                                            title="Apply +1 species bonus to this stat"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* TOTAL SCORE ROW */}
                                            <tr className="stat-table-total-row">
                                                <td className="stat-table-row-label">Total Score</td>
                                                {STAT_KEYS.map(k => (
                                                    <td key={k} className="stat-table-cell">
                                                        <span className="stat-table-total">{getTotal(k)}</span>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* MODIFIER ROW */}
                                            <tr>
                                                <td className="stat-table-row-label">Modifier</td>
                                                {STAT_KEYS.map(k => (
                                                    <td key={k} className="stat-table-cell">
                                                        <span className="stat-table-mod">{getMod(k)}</span>
                                                    </td>
                                                ))}
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>

                                {/* Hit Points */}
                                <div className="hp-section">
                                    <div className="hp-row">
                                        <span className="hp-label">Hit Points</span>
                                        <div className="field" style={{ margin: 0, minWidth: 150 }}>
                                            <select
                                                value={hpMethod}
                                                onChange={(e) => setHpMethod(e.target.value)}
                                            >
                                                {HP_METHODS.map(m => <option key={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="hp-total">
                                        <span className="hp-total-label">Total:</span>
                                        <span className="hp-total-value">
                                            {hpMethod === "Manual" ? (
                                                <input
                                                    className="hp-manual-input"
                                                    type="number" min={1}
                                                    value={hpManual}
                                                    onChange={(e) => setHpManual(Number(e.target.value))}
                                                />
                                            ) : hpMethod === "Average" ? (
                                                avgHP()
                                            ) : (
                                                "Roll dice to determine"
                                            )}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        )}

                    </div>
                </section>

            </div>

            <div className="form-actions">
                <button className="btn-cancel" onClick={() => navigate("/dashboard")}>Cancel</button>
                <button className="btn-save">Save Character</button>
            </div>

        </div>
    );
}