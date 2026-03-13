import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
            <h1>Dashboard</h1>
            <p>You are logged in.</p>
        </div>
    );
}

export default Dashboard;