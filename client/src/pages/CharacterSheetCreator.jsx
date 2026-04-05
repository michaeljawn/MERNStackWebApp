import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/common.css";
import "../styles/CharacterSheetCreator.css";

// ── STANDARD ARRAY (D&D 2024) ──
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const STAT_KEYS = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];
const STAT_LABELS = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};
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
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null,
  });

  // +2 / +1 bonuses from species — user picks which stats get them
  const [bonusPlus2, setBonusPlus2] = useState(null); // statKey
  const [bonusPlus1, setBonusPlus1] = useState(null); // statKey

  // Manual entry fallback
  const [manualStats, setManualStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const [size, setSize] = useState("Medium");
  const [speed, setSpeed] = useState(30);

  //
  useEffect(() => {
    fetch("http://localhost:8080/data/classes", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("CLASSES:", data);
        setClasses(data);
      });
  }, []);
  useEffect(() => {
    if (!character_class) return;

    fetch(`http://localhost:8080/data/subclasses?class=${character_class}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("SUBCLASSES:", data);
        setSubclasses(data);
      });
  }, [character_class]);
  useEffect(() => {
    fetch("http://localhost:8080/data/backgrounds", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("BACKGROUNDS:", data);
        setBackgrounds(data);
      });
  }, []);
  useEffect(() => {
    fetch("http://localhost:8080/data/species", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("SPECIES:", data);
        setSpecies(data);
      });
  }, []);

  // ── COMPUTED STATS ──
  const getBase = (key) => {
    if (assignMethod === "Manual Entry") return manualStats[key];
    if (assignMethod === "Standard Array") {
      const idx = assignments[key];
      return idx !== null && idx !== undefined ? STANDARD_ARRAY[idx] : "—";
    }
    return 10; // Point Buy placeholder
  };

  const getPlus2 = (key) => (bonusPlus2 === key ? 2 : 0);
  const getPlus1 = (key) => (bonusPlus1 === key ? 1 : 0);

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
  const usedIndices = Object.values(assignments).filter((v) => v !== null);

  const handleAssign = (statKey, arrayIndex) => {
    setAssignments((prev) => {
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
  const pages = [
    "Class",
    "Subclass",
    "Species",
    "Background",
    "Stat Assignment",
  ];
  const [currentPage, setCurrentPage] = useState(0);
  const handlePrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNext = () =>
    setCurrentPage((p) => Math.min(pages.length - 1, p + 1));

  const sidebarValues = [
    character_class || "—",
    character_subclass || "—",
    character_species || "—",
    character_background || "—",
    assignMethod,
  ];

  const selectedClass = classes.find((c) => c.name === character_class);
  const selectedSubclass = subclasses.find(
    (s) => s.name === character_subclass,
  );
  const selectedSpecies = species.find(s => s.name === character_species);
  const selectedBackground = backgrounds.find(
    (b) => b.name === character_background,
  );

// save charcater
const handleSaveCharacter = async () => {
  const characterData = {
    name: character_name,
    class: character_class,
    subclass: character_subclass,
    species: character_species,
    background: character_background,
    stats: STAT_KEYS.reduce((acc, key) => {
      acc[key] = getTotal(key); // computed total score
      return acc;
    }, {}),
    hp: hpMethod === "Manual" ? hpManual : avgHP(),
    size,
    speed,
    assignMethod,
    hpMethod,
    bonusPlus2,
    bonusPlus1,
    createdAt: new Date(),
  };

  try {
    const response = await fetch("http://localhost:8080/characters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(characterData),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Failed to save character:", err);
      alert("Error saving character: " + err);
      return;
    }

    const result = await response.json();
    console.log("Character saved:", result);
    alert("Character created successfully!");
    navigate("/dashboard");
  } catch (err) {
    console.error("Error saving character:", err);
    alert("Error saving character");
  }
};


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
            <button
              className="page-arrow"
              onClick={handlePrev}
              disabled={currentPage === 0}
            >
              ‹
            </button>
            <div className="page-title-bar">
              <span className="page-title-label">{pages[currentPage]}</span>
            </div>
            <button
              className="page-arrow"
              onClick={handleNext}
              disabled={currentPage === pages.length - 1}
            >
              ›
            </button>
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
                    onChange={(e) => {
                      setCharacterClass(e.target.value);
                      setCharacterSubclass("");
                    }}
                  >
                    <option value="">— Select a Class —</option>
                    {classes.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="features-section">
                  <h3 className="features-title">Class Features</h3>
                  {selectedClass ? (
                    selectedClass.classFeatures.map((levelObj, idx) => (
                      <div key={idx} className="features-list">
                        {Object.entries(levelObj).map(([level, features]) => (
                          <div key={level} className="level-group">
                            <h4>Level {level}</h4>
                            <ul>
                              {features.map((feature, featIndex) => (
                                <li key={featIndex}>
                                  {typeof feature === "string"
                                    ? feature
                                    : feature.classFeature ||
                                      JSON.stringify(feature)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="api-placeholder">
                      No class selected or class data not loaded.
                    </p>
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
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {character_subclass && (
                  <div className="features-section">
                    <h3 className="features-title">
                      {character_subclass} Subclass Features
                    </h3>

                    {selectedSubclass ? (
                      selectedSubclass.subClassFeatures.map((feature) => (
                        <div className="feature-entry" key={feature.name}>
                          <p className="feature-name">{feature.name}</p>
                          <p className="feature-desc">
                            {feature.fluff || "No description available"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="api-placeholder">
                        Subclass feature details will load from the API.
                      </p>
                    )}
                    <p className="api-placeholder">
                      Subclass feature details will load from the API.
                    </p>
                  </div>
                )}

                {!character_subclass && (
                  <div className="features-section">
                    <h3 className="features-title">Subclass Features</h3>
                    <p className="api-placeholder">
                      Select a subclass to see its features.
                    </p>
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
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
    </div>

    <div className="species-stat-bar">
      <div className="species-stat">
        <span className="species-stat-label">Creature Type</span>
        <span className="species-stat-value">
          {selectedSpecies?.creatureType || "—"}
        </span>
      </div>
      <div className="species-stat-divider" />
      <div className="species-stat">
        <span className="species-stat-label">Size</span>
        <select
          className="species-stat-select"
          value={selectedSpecies?.size || size}
          onChange={(e) => setSize(e.target.value)}
        >
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="species-stat-divider" />
      <div className="species-stat">
        <span className="species-stat-label">Speed</span>
        <input
          className="species-stat-input"
          type="number"
          value={selectedSpecies?.baseSpeed || speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          min={0}
          max={120}
        />
      </div>
    </div>

    <div className="features-section">
      <h3 className="features-title">
        {character_species || "Species"} Traits
      </h3>

      {selectedSpecies?.speciesTraits?.length > 0 ? (
        selectedSpecies.speciesTraits.map((trait) => (
          <div className="feature-entry" key={trait.name}>
            <p className="feature-name">{trait.name}</p>
            <p className="feature-desc">{trait.fluff}</p>
            {/* handle trait.choice if needed */}
          </div>
        ))
      ) : (
        <p className="api-placeholder">
          {character_species
            ? "This species has no traits listed."
            : "Species traits will load from the API once connected."}
        </p>
      )}
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
          <option key={b._id} value={b.name}>
            {b.name}
          </option>
        ))}
      </select>
    </div>

    <div className="features-section">
      <h3 className="features-title">
        {character_background || "Background"} Details
      </h3>

      {selectedBackground ? (
        <div>
          
          {selectedBackground.abilityScores?.length > 0 && (
            <p>
              <strong>Ability Scores:</strong>{" "}
              {selectedBackground.abilityScores.join(", ")}
            </p>
          )}

          {<br />}
          {selectedBackground.feat && (
            <div className="feature-entry">
              <p className="feature-name">{selectedBackground.feat.name}</p>
              <p className="feature-desc">{selectedBackground.feat.fluff}</p>
            </div>
          )}

          {<br />}
          {selectedBackground.skillProficiences?.length > 0 && (
            <p>
              <strong>Skill Proficiencies:</strong>{" "}
              {selectedBackground.skillProficiences.join(", ")}
            </p>
          )}

          {<br />}
          {selectedBackground.toolProficiencies?.length > 0 && (
            <p>
              <strong>Tool Proficiencies:</strong>{" "}
              {selectedBackground.toolProficiencies.join(", ")}
            </p>
          )}

          {<br />}
          {selectedBackground.equipment?.length > 0 && (
            <div>
              <strong>Equipment Choices:</strong>
              {selectedBackground.equipment.map((item, idx) => {
                const choose = item.choose;
                return (
                  <div key={idx} className="equipment-choice">
                    <ul>
                      {choose.from.map((optionGroup, groupIdx) =>
                        Object.values(optionGroup).flat().map((eq, eqIdx) => (
                          <li key={`${groupIdx}-${eqIdx}`}>
                            {eq.name} {eq.quantity ? `x${eq.quantity}` : ""}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="api-placeholder">
          {character_background
            ? "This background has no details listed."
            : "Background details will load from the API once connected."}
        </p>
      )}
    </div>
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
                      {ASSIGN_METHODS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Stat table */}
                <div className="stat-table-wrapper">
                  <table className="stat-table">
                    <thead>
                      <tr>
                        <th className="stat-table-row-label"></th>
                        {STAT_KEYS.map((k) => (
                          <th key={k} className="stat-table-col-label">
                            {STAT_LABELS[k]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* BASE ROW */}
                      <tr>
                        <td className="stat-table-row-label">Base</td>
                        {STAT_KEYS.map((k) => (
                          <td key={k} className="stat-table-cell">
                            {assignMethod === "Standard Array" ? (
                              <select
                                className="stat-table-select"
                                value={
                                  assignments[k] !== null ? assignments[k] : ""
                                }
                                onChange={(e) =>
                                  handleAssign(k, e.target.value)
                                }
                              >
                                <option value="">—</option>
                                {STANDARD_ARRAY.map((val, idx) => (
                                  <option
                                    key={idx}
                                    value={idx}
                                    disabled={
                                      usedIndices.includes(idx) &&
                                      assignments[k] !== idx
                                    }
                                  >
                                    {val}
                                  </option>
                                ))}
                              </select>
                            ) : assignMethod === "Manual Entry" ? (
                              <input
                                className="stat-table-input"
                                type="number"
                                min={1}
                                max={30}
                                value={manualStats[k]}
                                onChange={(e) =>
                                  setManualStats((prev) => ({
                                    ...prev,
                                    [k]: Number(e.target.value),
                                  }))
                                }
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
                        {STAT_KEYS.map((k) => (
                          <td key={k} className="stat-table-cell">
                            <input
                              type="checkbox"
                              className="stat-table-checkbox"
                              checked={bonusPlus2 === k}
                              onChange={() =>
                                setBonusPlus2(bonusPlus2 === k ? null : k)
                              }
                              title="Apply +2 species bonus to this stat"
                            />
                          </td>
                        ))}
                      </tr>

                      {/* +1 ROW (species bonus) */}
                      <tr>
                        <td className="stat-table-row-label">+1</td>
                        {STAT_KEYS.map((k) => (
                          <td key={k} className="stat-table-cell">
                            <input
                              type="checkbox"
                              className="stat-table-checkbox"
                              checked={bonusPlus1 === k}
                              onChange={() =>
                                setBonusPlus1(bonusPlus1 === k ? null : k)
                              }
                              disabled={bonusPlus2 === k}
                              title="Apply +1 species bonus to this stat"
                            />
                          </td>
                        ))}
                      </tr>

                      {/* TOTAL SCORE ROW */}
                      <tr className="stat-table-total-row">
                        <td className="stat-table-row-label">Total Score</td>
                        {STAT_KEYS.map((k) => (
                          <td key={k} className="stat-table-cell">
                            <span className="stat-table-total">
                              {getTotal(k)}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* MODIFIER ROW */}
                      <tr>
                        <td className="stat-table-row-label">Modifier</td>
                        {STAT_KEYS.map((k) => (
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
                        {HP_METHODS.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="hp-total">
                    <span className="hp-total-label">Total:</span>
                    <span className="hp-total-value">
                      {hpMethod === "Manual" ? (
                        <input
                          className="hp-manual-input"
                          type="number"
                          min={1}
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
        <button className="btn-cancel" onClick={() => navigate("/dashboard")}>
          Cancel
        </button>
        <button className="btn-save" onClick={handleSaveCharacter}>
  Save Character
</button>
      </div>
    </div>
  );
}
