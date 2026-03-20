import { useState } from "react";
import "../styles/CharacterSheetCreator.css";

export default function CharacterSheetCreator() {

    const [character_name, setCharacterName] = useState("");

    const [character_backround, setBackroundSelectedValue] = useState('chocolate'); 
    const backround_options = [ /*REPLACE LATER*/
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' },
    ];

    const [character_species, setSpeciesSelectedValue] = useState(''); 
    const species_options = [];

    
    const [character_class, setClassSelectedValue] = useState(''); 
    const class_options = [];

    
    const [character_subclass, setSubclassSelectedValue] = useState(''); 
    const subclass_options = [];
    

    const SIZE = Object.freeze({
        TINY: "Tiny",
        SMALL: "Small",
        MEDIUM: "Medium",
        LARGE: "Large",
        HUGE: "Huge",
        GARGANTUAN: "Gargantuan"
    });

    const [stats, setStats] = useState({
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        heroicInspiration: 0,

        //????
        speed: 30,
        initiative: 0,
        size: SIZE.MEDIUM,
        passivePerception: 10
    });

    return (
        <div className="characterCreator">

            <div className="horizontalSplit">
                {/* STATS 1 */}  
                <section className="identity">
                    <div className="name">
                        <p>Name:</p>
                        <input
                            type="text"
                            placeholder="Enter character name"
                            value={character_name}
                            onChange={(e) => setCharacterName(e.target.value)}
                            style={{ fontSize: "16px", padding: "4px" }}
                        />
                    </div>

                    <div className="backround">
                        <p>Backround:</p>
                        <select value={character_backround} onChange={(e) => setBackroundSelectedValue(e.target.value)}>
                            {backround_options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="species">
                        <p>Species:</p>
                        <select value={character_species} onChange={(e) => setSpeciesSelectedValue(e.target.value)}>
                            {species_options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="class">
                        <p>Class:</p>
                        <select value={character_class} onChange={(e) => setClassSelectedValue(e.target.value)}>
                            {class_options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="subclass">
                        <p>Subclass:</p>
                        <select value={character_subclass} onChange={(e) => setSubclassSelectedValue(e.target.value)}>
                            {subclass_options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                </section>
                {/* STATS 1 */}              
                <section className="stats_1">

                </section>
            </div>
            
            {/* STATS 2 */}  
            <section className="stats_2">

                {/* MAIN */}
                <div className="mainStats">
                    <div className="stat">
                        <p>STR</p>
                        <input type="number" min="1" max="30"
                            value={stats.strength}
                            onChange={(e) => handleStatChange("strength", e.target.value)}
                        />
                    </div>

                    <div className="stat">
                        <p>DEX</p>
                        <input type="number" min="1" max="30"
                            value={stats.dexterity}
                            onChange={(e) => handleStatChange("dexterity", e.target.value)}
                        />
                    </div>

                    <div className="stat">
                        <p>CON</p>
                        <input type="number" min="1" max="30"
                            value={stats.constitution}
                            onChange={(e) => handleStatChange("constitution", e.target.value)}
                        />
                    </div>

                    <div className="stat">
                        <p>INT</p>
                        <input type="number" min="1" max="30"
                            value={stats.intelligence}
                            onChange={(e) => handleStatChange("intelligence", e.target.value)}
                        />
                    </div>

                    <div className="stat">
                        <p>WIS</p>
                        <input type="number" min="1" max="30"
                            value={stats.wisdom}
                            onChange={(e) => handleStatChange("wisdom", e.target.value)}
                        />
                    </div>

                    <div className="stat">
                        <p>CHA</p>
                        <input type="number" min="1" max="30"
                            value={stats.charisma}
                            onChange={(e) => handleStatChange("charisma", e.target.value)}
                        />
                    </div>
                </div>

                {/* SECONDARY */}
                <div className="secondaryStats">

                    <div className="stat">
                        <p>Heroic Inspiration</p>
                        <input
                            type="number"
                            min="0"
                            max="1"
                            value={stats.heroicInspiration}
                            onChange={(e) => handleStatChange("heroicInspiration", e.target.value)}
                        />
                    </div>

                    <div className="stat">
                        <p>Speed</p>
                        <input
                            type="number"
                            min="0"
                            max="120"
                            value={stats.speed}
                            onChange={(e) => handleStatChange("speed", e.target.value)}
                        />
                    </div>

                    <div className="stat">
                        <p>Initiative</p>
                        <input
                            type="number"
                            min="-10"
                            max="20"
                            value={stats.initiative}
                            onChange={(e) => handleStatChange("initiative", e.target.value)}
                        />
                    </div>

                    <div className="stat">
                        <p>Size</p>
                        <select
                            value={stats.size}
                            onChange={(e) => handleStatChange("size", e.target.value)}
                        >
                            {Object.values(SIZE).map(size => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="stat">
                        <p>Passive Perception</p>
                        <input
                            type="number"
                            min="0"
                            max="30"
                            value={stats.passivePerception}
                            onChange={(e) => handleStatChange("passivePerception", e.target.value)}
                        />
                    </div>

                </div>
            </section>
        </div>
    );
}