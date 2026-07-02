import express from "express";
import { pool } from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

const IGRE = ["CS2", "CS1.6"];
const STATUSI = ["upcoming", "live", "finished"];

router.get("/", async (req, res) => {
  const { name, game, region, status, start_date_from, start_date_to } = req.query;
  const uslovi = [];
  const vrijednosti = [];

  if (name) {
    vrijednosti.push(`%${name}%`);
    uslovi.push(`name ILIKE $${vrijednosti.length}`);
  }
  if (game) {
    vrijednosti.push(game);
    uslovi.push(`game = $${vrijednosti.length}`);
  }
  if (region) {
    vrijednosti.push(region);
    uslovi.push(`region = $${vrijednosti.length}`);
  }
  if (status) {
    vrijednosti.push(status);
    uslovi.push(`status = $${vrijednosti.length}`);
  }
  if (start_date_from) {
    vrijednosti.push(start_date_from);
    uslovi.push(`start_date >= $${vrijednosti.length}`);
  }
  if (start_date_to) {
    vrijednosti.push(start_date_to);
    uslovi.push(`start_date <= $${vrijednosti.length}`);
  }

  const where = uslovi.length ? `WHERE ${uslovi.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT * FROM tournaments ${where} ORDER BY start_date ASC NULLS LAST, id DESC`,
      vrijednosti
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tournaments WHERE id = $1", [req.params.id]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Turnir nije pronađen" });
    }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.post("/", authenticate, requireAdmin, upload.single("banner"), async (req, res) => {
  const { name, game, region, start_date, end_date, max_teams, prize_pool, description } = req.body;
  if (!name || !game || !max_teams) {
    return res.status(400).json({ error: "Naziv, igra i maksimalan broj timova su obavezni" });
  }
  if (!IGRE.includes(game)) {
    return res.status(400).json({ error: "Nepoznata igra" });
  }
  const banner_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const result = await pool.query(
      `INSERT INTO tournaments (name, game, region, start_date, end_date, max_teams, prize_pool, description, banner_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, game, region || null, start_date || null, end_date || null, max_teams, prize_pool || null, description || null, banner_url, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.put("/:id", authenticate, requireAdmin, upload.single("banner"), async (req, res) => {
  const { name, game, region, start_date, end_date, status, max_teams, prize_pool, description } = req.body;
  if (game && !IGRE.includes(game)) {
    return res.status(400).json({ error: "Nepoznata igra" });
  }
  if (status && !STATUSI.includes(status)) {
    return res.status(400).json({ error: "Nepoznat status" });
  }
  try {
    const postojeci = await pool.query("SELECT * FROM tournaments WHERE id = $1", [req.params.id]);
    if (!postojeci.rows[0]) {
      return res.status(404).json({ error: "Turnir nije pronađen" });
    }
    const trenutni = postojeci.rows[0];
    const banner_url = req.file ? `/uploads/${req.file.filename}` : trenutni.banner_url;

    const result = await pool.query(
      `UPDATE tournaments SET name = $1, game = $2, region = $3, start_date = $4, end_date = $5,
        status = $6, max_teams = $7, prize_pool = $8, description = $9, banner_url = $10
       WHERE id = $11 RETURNING *`,
      [
        name || trenutni.name,
        game || trenutni.game,
        region ?? trenutni.region,
        start_date || trenutni.start_date,
        end_date || trenutni.end_date,
        status || trenutni.status,
        max_teams || trenutni.max_teams,
        prize_pool ?? trenutni.prize_pool,
        description ?? trenutni.description,
        banner_url,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM tournaments WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Turnir nije pronađen" });
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

export default router;
