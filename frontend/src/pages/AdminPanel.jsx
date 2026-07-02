import { useEffect, useState } from "react";
import api from "../api.js";

const IGRE = ["CS2", "CS1.6"];
const STATUSI = ["upcoming", "live", "finished"];
const NAZIV_STATUSA = {
  pending: "na čekanju",
  approved: "odobrena",
  rejected: "odbijena",
};

function praznaForma() {
  return {
    name: "",
    game: "CS2",
    region: "",
    start_date: "",
    end_date: "",
    status: "upcoming",
    max_teams: "",
    prize_pool: "",
    description: "",
    banner: null,
  };
}

export default function AdminPanel() {
  const [turniri, setTurniri] = useState([]);
  const [greska, setGreska] = useState("");
  const [poruka, setPoruka] = useState("");
  const [izmjena, setIzmjena] = useState(null);
  const [forma, setForma] = useState(praznaForma());
  const [izabraniTurnirZaPrijave, setIzabraniTurnirZaPrijave] = useState("");
  const [prijave, setPrijave] = useState([]);

  useEffect(() => {
    ucitajTurnire();
  }, []);

  useEffect(() => {
    if (!izabraniTurnirZaPrijave) {
      setPrijave([]);
      return;
    }
    ucitajPrijave(izabraniTurnirZaPrijave);
  }, [izabraniTurnirZaPrijave]);

  async function ucitajPrijave(tournamentId) {
    try {
      const res = await api.get(`/registrations/tournament/${tournamentId}`);
      setPrijave(res.data);
    } catch (err) {
      setGreska(err.response?.data?.error || "Greška pri učitavanju prijava");
    }
  }

  async function promijeniStatusPrijave(prijavaId, status) {
    try {
      await api.put(`/registrations/${prijavaId}`, { status });
      ucitajPrijave(izabraniTurnirZaPrijave);
    } catch (err) {
      setGreska(err.response?.data?.error || "Greška pri obradi prijave");
    }
  }

  async function ucitajTurnire() {
    try {
      const res = await api.get("/tournaments");
      setTurniri(res.data);
    } catch (err) {
      setGreska(err.response?.data?.error || "Greška pri učitavanju turnira");
    }
  }

  function izmijeniTurnir(t) {
    setIzmjena(t.id);
    setForma({
      name: t.name,
      game: t.game,
      region: t.region || "",
      start_date: t.start_date ? t.start_date.slice(0, 10) : "",
      end_date: t.end_date ? t.end_date.slice(0, 10) : "",
      status: t.status,
      max_teams: t.max_teams,
      prize_pool: t.prize_pool || "",
      description: t.description || "",
      banner: null,
    });
  }

  function otkaziIzmjenu() {
    setIzmjena(null);
    setForma(praznaForma());
  }

  async function posaljiFormu(e) {
    e.preventDefault();
    setGreska("");
    setPoruka("");

    const podaci = new FormData();
    podaci.append("name", forma.name);
    podaci.append("game", forma.game);
    podaci.append("region", forma.region);
    podaci.append("start_date", forma.start_date);
    podaci.append("end_date", forma.end_date);
    podaci.append("status", forma.status);
    podaci.append("max_teams", forma.max_teams);
    podaci.append("prize_pool", forma.prize_pool);
    podaci.append("description", forma.description);
    if (forma.banner) {
      podaci.append("banner", forma.banner);
    }

    try {
      if (izmjena) {
        await api.put(`/tournaments/${izmjena}`, podaci);
        setPoruka("Turnir je izmijenjen");
      } else {
        await api.post("/tournaments", podaci);
        setPoruka("Turnir je kreiran");
      }
      otkaziIzmjenu();
      ucitajTurnire();
    } catch (err) {
      setGreska(err.response?.data?.error || "Greška pri čuvanju turnira");
    }
  }

  async function obrisiTurnir(id) {
    if (!window.confirm("Da li si siguran da želiš obrisati ovaj turnir?")) return;
    try {
      await api.delete(`/tournaments/${id}`);
      ucitajTurnire();
    } catch (err) {
      setGreska(err.response?.data?.error || "Greška pri brisanju turnira");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin panel</h1>

      <h2>{izmjena ? "Izmjena turnira" : "Novi turnir"}</h2>
      <form onSubmit={posaljiFormu} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
        <input
          placeholder="Naziv turnira"
          value={forma.name}
          onChange={(e) => setForma({ ...forma, name: e.target.value })}
          required
        />
        <select value={forma.game} onChange={(e) => setForma({ ...forma, game: e.target.value })}>
          {IGRE.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input
          placeholder="Region"
          value={forma.region}
          onChange={(e) => setForma({ ...forma, region: e.target.value })}
        />
        <label>
          Početak
          <input type="date" value={forma.start_date} onChange={(e) => setForma({ ...forma, start_date: e.target.value })} />
        </label>
        <label>
          Kraj
          <input type="date" value={forma.end_date} onChange={(e) => setForma({ ...forma, end_date: e.target.value })} />
        </label>
        {izmjena && (
          <select value={forma.status} onChange={(e) => setForma({ ...forma, status: e.target.value })}>
            {STATUSI.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        <input
          type="number"
          placeholder="Maksimalan broj timova"
          value={forma.max_teams}
          onChange={(e) => setForma({ ...forma, max_teams: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Nagradni fond"
          value={forma.prize_pool}
          onChange={(e) => setForma({ ...forma, prize_pool: e.target.value })}
        />
        <textarea
          placeholder="Opis"
          value={forma.description}
          onChange={(e) => setForma({ ...forma, description: e.target.value })}
        />
        <input type="file" accept="image/*" onChange={(e) => setForma({ ...forma, banner: e.target.files[0] })} />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{izmjena ? "Sačuvaj izmjene" : "Kreiraj turnir"}</button>
          {izmjena && <button type="button" onClick={otkaziIzmjenu}>Otkaži</button>}
        </div>
      </form>

      {greska && <p style={{ color: "red" }}>{greska}</p>}
      {poruka && <p style={{ color: "green" }}>{poruka}</p>}

      <h2>Svi turniri</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {turniri.map((t) => (
          <div
            key={t.id}
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}
          >
            <span>{t.name} ({t.game}, {t.status})</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => izmijeniTurnir(t)}>Izmijeni</button>
              <button onClick={() => obrisiTurnir(t.id)}>Obriši</button>
            </div>
          </div>
        ))}
      </div>

      <h2>Prijave timova</h2>
      <select value={izabraniTurnirZaPrijave} onChange={(e) => setIzabraniTurnirZaPrijave(e.target.value)}>
        <option value="">Izaberi turnir</option>
        {turniri.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {izabraniTurnirZaPrijave && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {prijave.map((p) => (
            <div
              key={p.id}
              style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}
            >
              <span>{p.team_name} ({p.team_tag}) — {NAZIV_STATUSA[p.status]}</span>
              {p.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => promijeniStatusPrijave(p.id, "approved")}>Odobri</button>
                  <button onClick={() => promijeniStatusPrijave(p.id, "rejected")}>Odbij</button>
                </div>
              )}
            </div>
          ))}
          {prijave.length === 0 && <p>Nema prijava za ovaj turnir.</p>}
        </div>
      )}
    </div>
  );
}
