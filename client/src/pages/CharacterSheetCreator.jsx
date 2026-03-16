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

    return (
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
    );
}