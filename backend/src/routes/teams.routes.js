import express from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teams ORDER BY name ASC");
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teams WHERE id = $1", [req.params.id]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Tim nije pronađen" });
    }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.post("/", authenticate, upload.single("logo"), async (req, res) => {
  const { name, tag, region } = req.body;
  if (!name || !tag) {
    return res.status(400).json({ error: "Naziv i tag tima su obavezni" });
  }
  const logo_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const result = await pool.query(
      `INSERT INTO teams (name, tag, region, logo_url, captain_user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, tag, region || null, logo_url, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.put("/:id", authenticate, upload.single("logo"), async (req, res) => {
  const { name, tag, region } = req.body;
  try {
    const postojeci = await pool.query("SELECT * FROM teams WHERE id = $1", [req.params.id]);
    if (!postojeci.rows[0]) {
      return res.status(404).json({ error: "Tim nije pronađen" });
    }
    const tim = postojeci.rows[0];
    if (tim.captain_user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Samo kapiten tima ili admin mogu izmijeniti tim" });
    }
    const logo_url = req.file ? `/uploads/${req.file.filename}` : tim.logo_url;
    const result = await pool.query(
      `UPDATE teams SET name = $1, tag = $2, region = $3, logo_url = $4 WHERE id = $5 RETURNING *`,
      [name || tim.name, tag || tim.tag, region ?? tim.region, logo_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const postojeci = await pool.query("SELECT * FROM teams WHERE id = $1", [req.params.id]);
    if (!postojeci.rows[0]) {
      return res.status(404).json({ error: "Tim nije pronađen" });
    }
    const tim = postojeci.rows[0];
    if (tim.captain_user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Samo kapiten tima ili admin mogu obrisati tim" });
    }
    await pool.query("DELETE FROM teams WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

export default router;
