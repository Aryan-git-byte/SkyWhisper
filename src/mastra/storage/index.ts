import { LibSQLStore } from "@mastra/libsql";

// Use SQLite instead of PostgreSQL
export const sharedPostgresStorage = new LibSQLStore({
  url: "file:./mastra.db"
});