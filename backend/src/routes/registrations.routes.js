import express from "express";
import { pool } from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const STATUSI = ["pending", "approved", "rejected"];

router.get("/tournament/:tournamentId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT registrations.*, teams.name AS team_name, teams.tag AS team_tag, teams.logo_url AS team_logo_url
       FROM registrations
       JOIN teams ON teams.id = registrations.team_id
       WHERE registrations.tournament_id = $1
       ORDER BY registrations.registered_at ASC`,
      [req.params.tournamentId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { tournament_id, team_id } = req.body;
  if (!tournament_id || !team_id) {
    return res.status(400).json({ error: "Turnir i tim su obavezni" });
  }
  try {
    const tim = await pool.query("SELECT * FROM teams WHERE id = $1", [team_id]);
    if (!tim.rows[0]) {
      return res.status(404).json({ error: "Tim nije pronađen" });
    }
    if (tim.rows[0].captain_user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Samo kapiten tima može prijaviti tim na turnir" });
    }
    const turnir = await pool.query("SELECT * FROM tournaments WHERE id = $1", [tournament_id]);
    if (!turnir.rows[0]) {
      return res.status(404).json({ error: "Turnir nije pronađen" });
    }
    const result = await pool.query(
      `INSERT INTO registrations (tournament_id, team_id) VALUES ($1, $2) RETURNING *`,
      [tournament_id, team_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Tim je već prijavljen na ovaj turnir" });
    }
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!STATUSI.includes(status)) {
    return res.status(400).json({ error: "Nepoznat status prijave" });
  }
  try {
    const result = await pool.query(
      "UPDATE registrations SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Prijava nije pronađena" });
    }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

export default router;
