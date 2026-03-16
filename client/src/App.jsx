import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CharacterSheetCreator from "./pages/CharacterSheetCreator";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/CharacterSheetCreator" element={<CharacterSheetCreator />} />
    </Routes>
  );
}

export default App;