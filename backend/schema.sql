CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  game VARCHAR(20) NOT NULL CHECK (game IN ('CS2', 'CS1.6')),
  region VARCHAR(50),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  max_teams INTEGER NOT NULL,
  prize_pool NUMERIC(10, 2),
  description TEXT,
  banner_url VARCHAR(255),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  tag VARCHAR(10) NOT NULL,
  logo_url VARCHAR(255),
  region VARCHAR(50),
  captain_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
  team_id INTEGER NOT NULL REFERENCES teams(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (tournament_id, team_id)
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
  round INTEGER NOT NULL,
  team_a_id INTEGER REFERENCES teams(id),
  team_b_id INTEGER REFERENCES teams(id),
  score_a INTEGER,
  score_b INTEGER,
  winner_id INTEGER REFERENCES teams(id),
  next_match_id INTEGER REFERENCES matches(id),
  scheduled_at TIMESTAMP
);