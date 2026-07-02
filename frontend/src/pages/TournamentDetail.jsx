import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { SERVER_URL } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const NAZIV_STATUSA = {
  pending: "na čekanju",
  approved: "odobrena",
  rejected: "odbijena",
};

export default function TournamentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [turnir, setTurnir] = useState(null);
  const [prijave, setPrijave] = useState([]);
  const [mojiTimovi, setMojiTimovi] = useState([]);
  const [izabraniTim, setIzabraniTim] = useState("");
  const [greska, setGreska] = useState("");
  const [prijavaGreska, setPrijavaGreska] = useState("");
  const [prijavaPoruka, setPrijavaPoruka] = useState("");

  useEffect(() => {
    ucitajTurnir();
    ucitajPrijave();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/teams")
      .then((res) => setMojiTimovi(res.data.filter((t) => t.captain_user_id === user.id)))
      .catch(() => {});
  }, [user]);

  function ucitajTurnir() {
    api
      .get(`/tournaments/${id}`)
      .then((res) => setTurnir(res.data))
      .catch((err) => setGreska(err.response?.data?.error || "Greška pri učitavanju turnira"));
  }

  function ucitajPrijave() {
    api
      .get(`/registrations/tournament/${id}`)
      .then((res) => setPrijave(res.data))
      .catch(() => {});
  }

  async function prijaviTim(e) {
    e.preventDefault();
    setPrijavaGreska("");
    setPrijavaPoruka("");
    if (!izabraniTim) {
      setPrijavaGreska("Izaberi tim");
      return;
    }
    try {
      await api.post("/registrations", { tournament_id: id, team_id: izabraniTim });
      setPrijavaPoruka("Tim je prijavljen, čeka se odobrenje admina");
      ucitajPrijave();
    } catch (err) {
      setPrijavaGreska(err.response?.data?.error || "Greška pri prijavi tima");
    }
  }

  if (greska) return <p style={{ color: "red", padding: 20 }}>{greska}</p>;
  if (!turnir) return <p style={{ padding: 20 }}>Učitavanje...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      {turnir.banner_url && (
        <img
          src={`${SERVER_URL}${turnir.banner_url}`}
          alt={turnir.name}
          style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8 }}
        />
      )}
      <h1>{turnir.name}</h1>
      <p>Igra: {turnir.game}</p>
      <p>Region: {turnir.region || "Nepoznat"}</p>
      <p>Status: {turnir.status}</p>
      <p>
        Datum: {turnir.start_date ? new Date(turnir.start_date).toLocaleDateString() : "Nije određen"}
        {" - "}
        {turnir.end_date ? new Date(turnir.end_date).toLocaleDateString() : "Nije određen"}
      </p>
      <p>Maksimalan broj timova: {turnir.max_teams}</p>
      {turnir.prize_pool && <p>Nagradni fond: {turnir.prize_pool} €</p>}
      {turnir.description && <p>{turnir.description}</p>}

      {user && mojiTimovi.length > 0 && (
        <>
          <h2>Prijavi svoj tim</h2>
          <form onSubmit={prijaviTim} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={izabraniTim} onChange={(e) => setIzabraniTim(e.target.value)}>
              <option value="">Izaberi tim</option>
              {mojiTimovi.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button type="submit">Prijavi tim</button>
          </form>
          {prijavaGreska && <p style={{ color: "red" }}>{prijavaGreska}</p>}
          {prijavaPoruka && <p style={{ color: "green" }}>{prijavaPoruka}</p>}
        </>
      )}

      <h2>Prijavljeni timovi</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {prijave.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between" }}>
            <span>{p.team_name} ({p.team_tag})</span>
            <span>{NAZIV_STATUSA[p.status]}</span>
          </div>
        ))}
        {prijave.length === 0 && <p>Još nema prijavljenih timova.</p>}
      </div>
    </div>
  );
}
