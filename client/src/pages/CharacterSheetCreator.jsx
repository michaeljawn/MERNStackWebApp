import { useState } from "react";
import "../styles/CharacterSheetCreator.css";

export default function CharacterSheetCreator() {

    const [character_name, setCharacterName] = useState("");

    const [character_background, setBackgroundSelectedValue] = useState('acolyte');
    const background_options = [
        { value: 'acolyte', label: 'Acolyte' },
        { value: 'charlatan', label: 'Charlatan' },
        { value: 'criminal', label: 'Criminal' },
        { value: 'entertainer', label: 'Entertainer' },
        { value: 'folk_hero', label: 'Folk Hero' },
        { value: 'guild_artisan', label: 'Guild Artisan' },
        { value: 'hermit', label: 'Hermit' },
        { value: 'noble', label: 'Noble' },
        { value: 'outlander', label: 'Outlander' },
        { value: 'sage', label: 'Sage' },
        { value: 'sailor', label: 'Sailor' },
        { value: 'soldier', label: 'Soldier' },
        { value: 'urchin', label: 'Urchin' },
    ];

    const [character_species, setSpeciesSelectedValue] = useState('human');
    const species_options = [
        { value: 'human', label: 'Human' },
        { value: 'elf', label: 'Elf' },
        { value: 'half_elf', label: 'Half-Elf' },
        { value: 'dwarf', label: 'Dwarf' },
        { value: 'halfling', label: 'Halfling' },
        { value: 'gnome', label: 'Gnome' },
        { value: 'half_orc', label: 'Half-Orc' },
        { value: 'tiefling', label: 'Tiefling' },
        { value: 'dragonborn', label: 'Dragonborn' },
        { value: 'aasimar', label: 'Aasimar' },
    ];

    const [character_class, setClassSelectedValue] = useState('barbarian');
    const class_options = [
        { value: 'barbarian', label: 'Barbarian' },
        { value: 'bard', label: 'Bard' },
        { value: 'cleric', label: 'Cleric' },
        { value: 'druid', label: 'Druid' },
        { value: 'fighter', label: 'Fighter' },
        { value: 'monk', label: 'Monk' },
        { value: 'paladin', label: 'Paladin' },
        { value: 'ranger', label: 'Ranger' },
        { value: 'rogue', label: 'Rogue' },
        { value: 'sorcerer', label: 'Sorcerer' },
        { value: 'warlock', label: 'Warlock' },
        { value: 'wizard', label: 'Wizard' },
    ];

    const subclass_map = {
        barbarian: ["Path of the Berserker", "Path of the Totem Warrior", "Path of the Storm Herald"],
        bard: ["College of Lore", "College of Valor", "College of Glamour"],
        cleric: ["Life Domain", "Light Domain", "War Domain", "Trickery Domain"],
        druid: ["Circle of the Land", "Circle of the Moon", "Circle of Spores"],
        fighter: ["Champion", "Battle Master", "Eldritch Knight"],
        monk: ["Way of the Open Hand", "Way of Shadow", "Way of the Four Elements"],
        paladin: ["Oath of Devotion", "Oath of the Ancients", "Oath of Vengeance"],
        ranger: ["Hunter", "Beast Master", "Gloom Stalker"],
        rogue: ["Thief", "Assassin", "Arcane Trickster"],
        sorcerer: ["Draconic Bloodline", "Wild Magic", "Storm Sorcery"],
        warlock: ["The Fiend", "The Archfey", "The Great Old One"],
        wizard: ["School of Evocation", "School of Abjuration", "School of Illusion"],
    };

    const [character_subclass, setSubclassSelectedValue] = useState(subclass_map['barbarian'][0]);

    const handleClassChange = (e) => {
        setClassSelectedValue(e.target.value);
        setSubclassSelectedValue(subclass_map[e.target.value][0]);
    };

    const SIZE = Object.freeze({
        TINY: "Tiny", SMALL: "Small", MEDIUM: "Medium",
        LARGE: "Large", HUGE: "Huge", GARGANTUAN: "Gargantuan"
    });

    const [stats, setStats] = useState({
        strength: 10, dexterity: 10, constitution: 10,
        intelligence: 10, wisdom: 10, charisma: 10,
        heroicInspiration: 0, speed: 30, initiative: 0,
        size: SIZE.MEDIUM, passivePerception: 10
    });

    const handleStatChange = (key, value) => {
        setStats((prev) => ({ ...prev, [key]: value }));
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

                {/* ── IDENTITY PANEL ── */}
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

                    <div className="field">
                        <label>Background</label>
                        <select value={character_background} onChange={(e) => setBackgroundSelectedValue(e.target.value)}>
                            {background_options.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>Species</label>
                        <select value={character_species} onChange={(e) => setSpeciesSelectedValue(e.target.value)}>
                            {species_options.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>Class</label>
                        <select value={character_class} onChange={handleClassChange}>
                            {class_options.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>Subclass</label>
                        <select value={character_subclass} onChange={(e) => setSubclassSelectedValue(e.target.value)}>
                            {subclass_map[character_class].map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* ── STATS PANEL ── */}
                <section className="stats-panel">
                    <h2 className="panel-title">Ability Scores</h2>
                    <div className="mainStats">
                        {[
                            { key: "strength", label: "STR" },
                            { key: "dexterity", label: "DEX" },
                            { key: "constitution", label: "CON" },
                            { key: "intelligence", label: "INT" },
                            { key: "wisdom", label: "WIS" },
                            { key: "charisma", label: "CHA" },
                        ].map(({ key, label }) => (
                            <div className="stat-box" key={key}>
                                <label>{label}</label>
                                <input
                                    type="number" min="1" max="30"
                                    value={stats[key]}
                                    onChange={(e) => handleStatChange(key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <h2 className="panel-title secondary-title">Combat & Movement</h2>
                    <div className="secondaryStats">
                        <div className="stat-box">
                            <label>Heroic Insp.</label>
                            <input type="number" min="0" max="1" value={stats.heroicInspiration} onChange={(e) => handleStatChange("heroicInspiration", e.target.value)} />
                        </div>
                        <div className="stat-box">
                            <label>Speed</label>
                            <input type="number" min="0" max="120" value={stats.speed} onChange={(e) => handleStatChange("speed", e.target.value)} />
                        </div>
                        <div className="stat-box">
                            <label>Initiative</label>
                            <input type="number" min="-10" max="20" value={stats.initiative} onChange={(e) => handleStatChange("initiative", e.target.value)} />
                        </div>
                        <div className="stat-box">
                            <label>Size</label>
                            <select value={stats.size} onChange={(e) => handleStatChange("size", e.target.value)}>
                                {Object.values(SIZE).map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <div className="stat-box">
                            <label>Passive Perc.</label>
                            <input type="number" min="0" max="30" value={stats.passivePerception} onChange={(e) => handleStatChange("passivePerception", e.target.value)} />
                        </div>
                    </div>
                </section>

            </div>

            <div className="form-actions">
                <button className="btn-cancel">Cancel</button>
                <button className="btn-save">Save Character</button>
            </div>

        </div>
    );
}