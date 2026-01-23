/*
 *   Copyright (c) 2025 Laith Alkhaddam aka Iconical or Sleepyico.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
/**
 * Drizzle Kit Configuration
 *
 * This config is used by drizzle-kit for database migrations and schema push.
 *
 * Note: We explicitly load .env.local because that's where Next.js stores
 * environment variables locally. The default dotenv/config only loads .env.
 */
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local for local development (Next.js convention)
// Falls back to .env if .env.local doesn't exist
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/dbSchema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
