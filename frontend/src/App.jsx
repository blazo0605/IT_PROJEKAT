import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Tournaments from "./pages/Tournaments.jsx";
import TournamentDetail from "./pages/TournamentDetail.jsx";
import Teams from "./pages/Teams.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #ccc", alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/">Početna</Link>
        <Link to="/turniri">Turniri</Link>
        <Link to="/timovi">Timovi</Link>
        {user?.role === "admin" && <Link to="/admin">Admin panel</Link>}
        {!user && <Link to="/login">Prijava</Link>}
        {!user && <Link to="/register">Registracija</Link>}
        {user && <span>Zdravo, {user.username} ({user.role})</span>}
        {user && <button onClick={logout}>Odjava</button>}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/turniri" element={<Tournaments />} />
        <Route path="/turniri/:id" element={<TournamentDetail />} />
        <Route path="/timovi" element={<Teams />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/admin" element={user?.role === "admin" ? <AdminPanel /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}