import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { runAllSeeds } from "./seed/run.js";
import app from "./app.js";

// Boot order: connect DB -> (seed in dev) -> start listening.
async function start() {
  await connectDB();

  // Seed demo data only outside production so prod keeps its real data.
  if (process.env.NODE_ENV !== "production") {
    await runAllSeeds();
  }

  app.listen(config.port, () => {
    console.log(`Lumen API running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
