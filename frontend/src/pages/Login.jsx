import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user); // sačuvaj token + usera
      navigate("/"); 
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri prijavi");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "40px auto", display: "flex", flexDirection: "column", gap: 8 }}>
      <h2>Prijava</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Lozinka" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Prijavi se</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}