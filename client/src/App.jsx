import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState("login");

  return (
    <>
      {page === "login" && (
        <Login goToDashboard={() => setPage("dashboard")} />
      )}

      {page === "dashboard" && (
        <Dashboard />
      )}
    </>
  );
}

export default App;