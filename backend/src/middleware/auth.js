import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Čita "Authorization: Bearer <token>", provjeri ga, zakači req.user
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Nema tokena" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role }
    next();
  } catch {
    return res.status(401).json({ error: "Token nevažeći" });
  }
}

// Koristi se POSLIJE authenticate na admin rutama
export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Samo za admina" });
  }
  next();
}