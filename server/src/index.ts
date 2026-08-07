import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { runAllSeeds } from "./seed/run.js";
import app from "./app.js";

async function start() {
  await connectDB();

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
