import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import character from "../assets/character-add.svg";

function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/check-login", {
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) {
                    navigate("/");
                }
            });
    }, []);

    return (
        <div>
            <h1>D&D Dashboard</h1>
            <p>Welcome to your dashboard!</p>
            <button onClick={() => alert('Button clicked!')}>
                <img src={character} alt="description of button action" />
            </button>
        </div>
    );
}

export default Dashboard;