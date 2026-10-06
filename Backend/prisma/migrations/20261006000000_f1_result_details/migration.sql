-- AlterTable: richer race classification (grid, laps, time, driver media).
-- Existing rows keep detail_version 0 and are re-fetched on next read.
ALTER TABLE "f1_session_results"
    ADD COLUMN "grid_position" INTEGER,
    ADD COLUMN "laps" INTEGER,
    ADD COLUMN "time_seconds" DOUBLE PRECISION,
    ADD COLUMN "team_color" TEXT,
    ADD COLUMN "headshot_url" TEXT,
    ADD COLUMN "country_code" TEXT,
    ADD COLUMN "detail_version" INTEGER NOT NULL DEFAULT 0;
