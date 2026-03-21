import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CharacterSheetCreator from "./pages/CharacterSheetCreator";
import Campaigns from "./pages/Campaigns";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/CharacterSheetCreator" element={<CharacterSheetCreator />} />
      <Route path="/campaigns" element={<Campaigns />} />
    </Routes>
  );
}

export default App;