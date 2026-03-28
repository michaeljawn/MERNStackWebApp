import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CharacterSheetCreator from "./pages/CharacterSheetCreator";
import Campaigns from "./pages/Campaigns";
import Admin from "./pages/Admin";
import { checkLogin } from "./utils/auth";

function App() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function verify() {
      const result = await checkLogin();
      setLoggedIn(result.loggedIn);
      setIsAdmin(result.isAdmin);
    }

    verify();
  }, []);

  if (loggedIn === null) {
    return <p>Loading...</p>;
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={loggedIn ? <Dashboard /> : <Navigate to="/" replace />}
      />

      <Route
        path="/CharacterSheetCreator"
        element={loggedIn ? <CharacterSheetCreator /> : <Navigate to="/" replace />}
      />

      <Route
        path="/campaigns"
        element={loggedIn ? <Campaigns /> : <Navigate to="/" replace />}
      />

      <Route
        path="/admin"
        element={isAdmin ? <Admin /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;