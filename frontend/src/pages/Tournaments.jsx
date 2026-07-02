import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { SERVER_URL } from "../api.js";

const IGRE = ["CS2", "CS1.6"];
const STATUSI = ["upcoming", "live", "finished"];

export default function Tournaments() {
  const [turniri, setTurniri] = useState([]);
  const [greska, setGreska] = useState("");
  const [brzaPretraga, setBrzaPretraga] = useState("");
  const [prikaziDetaljnu, setPrikaziDetaljnu] = useState(false);
  const [detaljniFilteri, setDetaljniFilteri] = useState({
    game: "",
    region: "",
    status: "",
    start_date_from: "",
    start_date_to: "",
  });

  useEffect(() => {
    ucitajTurnire({});
  }, []);

  async function ucitajTurnire(parametri) {
    try {
      const res = await api.get("/tournaments", { params: parametri });
      setTurniri(res.data);
    } catch (err) {
      setGreska(err.response?.data?.error || "Greška pri učitavanju turnira");
    }
  }

  function posaljiBrzuPretragu(e) {
    e.preventDefault();
    ucitajTurnire(brzaPretraga ? { name: brzaPretraga } : {});
  }

  function posaljiDetaljnuPretragu(e) {
    e.preventDefault();
    const parametri = {};
    Object.entries(detaljniFilteri).forEach(([kljuc, vrijednost]) => {
      if (vrijednost) parametri[kljuc] = vrijednost;
    });
    ucitajTurnire(parametri);
  }

  function ocistiFiltere() {
    setBrzaPretraga("");
    setDetaljniFilteri({ game: "", region: "", status: "", start_date_from: "", start_date_to: "" });
    ucitajTurnire({});
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Turniri</h1>

      <form onSubmit={posaljiBrzuPretragu} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <input
          placeholder="Brza pretraga po nazivu turnira"
          value={brzaPretraga}
          onChange={(e) => setBrzaPretraga(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <button type="submit">Pretraži</button>
        <button type="button" onClick={() => setPrikaziDetaljnu(!prikaziDetaljnu)}>
          {prikaziDetaljnu ? "Sakrij detaljnu pretragu" : "Detaljna pretraga"}
        </button>
      </form>

      {prikaziDetaljnu && (
        <form
          onSubmit={posaljiDetaljnuPretragu}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 16 }}
        >
          <select
            value={detaljniFilteri.game}
            onChange={(e) => setDetaljniFilteri({ ...detaljniFilteri, game: e.target.value })}
          >
            <option value="">Sve igre</option>
            {IGRE.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <input
            placeholder="Region"
            value={detaljniFilteri.region}
            onChange={(e) => setDetaljniFilteri({ ...detaljniFilteri, region: e.target.value })}
          />
          <select
            value={detaljniFilteri.status}
            onChange={(e) => setDetaljniFilteri({ ...detaljniFilteri, status: e.target.value })}
          >
            <option value="">Svi statusi</option>
            {STATUSI.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label>
            Od datuma
            <input
              type="date"
              value={detaljniFilteri.start_date_from}
              onChange={(e) => setDetaljniFilteri({ ...detaljniFilteri, start_date_from: e.target.value })}
            />
          </label>
          <label>
            Do datuma
            <input
              type="date"
              value={detaljniFilteri.start_date_to}
              onChange={(e) => setDetaljniFilteri({ ...detaljniFilteri, start_date_to: e.target.value })}
            />
          </label>
          <button type="submit">Primijeni filtere</button>
          <button type="button" onClick={ocistiFiltere}>Poništi</button>
        </form>
      )}

      {greska && <p style={{ color: "red" }}>{greska}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {turniri.map((t) => (
          <Link
            key={t.id}
            to={`/turniri/${t.id}`}
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, textDecoration: "none", color: "inherit" }}
          >
            {t.banner_url && (
              <img
                src={`${SERVER_URL}${t.banner_url}`}
                alt={t.name}
                style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 4 }}
              />
            )}
            <h3>{t.name}</h3>
            <p>{t.game} · {t.region || "Region nepoznat"}</p>
            <p>Status: {t.status}</p>
          </Link>
        ))}
        {turniri.length === 0 && !greska && <p>Nema turnira koji odgovaraju pretrazi.</p>}
      </div>
    </div>
  );
}
