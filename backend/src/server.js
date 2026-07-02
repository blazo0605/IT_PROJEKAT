import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import tournamentsRoutes from "./routes/tournaments.routes.js";
import teamsRoutes from "./routes/teams.routes.js";
import registrationsRoutes from "./routes/registrations.routes.js";
import { uploadsDir } from "./middleware/upload.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentsRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/registrations", registrationsRoutes);


app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));