const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = Number(process.env.PORT || 3000);

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "hello",
  password: process.env.DB_PASSWORD || "hello123",
  database: process.env.DB_NAME || "hello_docker",
});

async function initDb(retries = 20) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          content VARCHAR(280) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`Database not ready yet, retrying... (${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok" });
});

app.get("/api/messages", async (_req, res) => {
  const result = await pool.query(
    `
      SELECT id, name, content, created_at
      FROM messages
      ORDER BY id DESC
      LIMIT 20
    `,
  );
  res.json(result.rows);
});

app.post("/api/messages", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const content = String(req.body.content || "").trim();

  if (!name || !content) {
    return res.status(400).json({ error: "name and content are required" });
  }

  if (name.length > 50 || content.length > 280) {
    return res.status(400).json({ error: "message is too long" });
  }

  const result = await pool.query(
    `
      INSERT INTO messages (name, content)
      VALUES ($1, $2)
      RETURNING id, name, content, created_at
    `,
    [name, content],
  );

  return res.status(201).json(result.rows[0]);
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "internal server error" });
});

async function start() {
  await initDb();

  const server = app.listen(port, () => {
    console.log(`Backend API listening on http://localhost:${port}`);
  });

  const shutdown = async () => {
    console.log("Shutting down...");
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
