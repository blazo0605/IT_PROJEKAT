import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { username, email, password });
      navigate("/login"); 
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri registraciji");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "40px auto", display: "flex", flexDirection: "column", gap: 8 }}>
      <h2>Registracija</h2>
      <input placeholder="Korisničko ime" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Lozinka" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Registruj se</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}