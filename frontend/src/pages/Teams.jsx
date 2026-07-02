import { useEffect, useState } from "react";
import api, { SERVER_URL } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Teams() {
  const { user } = useAuth();
  const [timovi, setTimovi] = useState([]);
  const [greska, setGreska] = useState("");
  const [poruka, setPoruka] = useState("");
  const [naziv, setNaziv] = useState("");
  const [tag, setTag] = useState("");
  const [region, setRegion] = useState("");
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    ucitajTimove();
  }, []);

  async function ucitajTimove() {
    try {
      const res = await api.get("/teams");
      setTimovi(res.data);
    } catch (err) {
      setGreska(err.response?.data?.error || "Greška pri učitavanju timova");
    }
  }

  async function kreirajTim(e) {
    e.preventDefault();
    setGreska("");
    setPoruka("");

    const podaci = new FormData();
    podaci.append("name", naziv);
    podaci.append("tag", tag);
    podaci.append("region", region);
    if (logo) {
      podaci.append("logo", logo);
    }

    try {
      await api.post("/teams", podaci);
      setPoruka("Tim je kreiran");
      setNaziv("");
      setTag("");
      setRegion("");
      setLogo(null);
      ucitajTimove();
    } catch (err) {
      setGreska(err.response?.data?.error || "Greška pri kreiranju tima");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>Timovi</h1>

      {user && (
        <>
          <h2>Kreiraj tim</h2>
          <form onSubmit={kreirajTim} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }}>
            <input placeholder="Naziv tima" value={naziv} onChange={(e) => setNaziv(e.target.value)} required />
            <input placeholder="Tag (npr. NAVI)" value={tag} onChange={(e) => setTag(e.target.value)} required />
            <input placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} />
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
            <button type="submit">Kreiraj tim</button>
          </form>
          {greska && <p style={{ color: "red" }}>{greska}</p>}
          {poruka && <p style={{ color: "green" }}>{poruka}</p>}
        </>
      )}

      <h2>Svi timovi</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {timovi.map((t) => (
          <div key={t.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
            {t.logo_url && (
              <img src={`${SERVER_URL}${t.logo_url}`} alt={t.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }} />
            )}
            <div>
              <b>{t.name}</b>
              <p>{t.tag} · {t.region || "Region nepoznat"}</p>
            </div>
          </div>
        ))}
        {timovi.length === 0 && !greska && <p>Nema kreiranih timova.</p>}
      </div>
    </div>
  );
}
