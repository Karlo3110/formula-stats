-- CreateTable
CREATE TABLE "f1_events" (
    "id" UUID NOT NULL,
    "season" INTEGER NOT NULL,
    "round_number" INTEGER NOT NULL,
    "event_name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "event_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "f1_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "f1_session_results" (
    "id" UUID NOT NULL,
    "season" INTEGER NOT NULL,
    "round_number" INTEGER NOT NULL,
    "session" TEXT NOT NULL,
    "position" INTEGER,
    "driver_number" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "f1_session_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "f1_track_maps" (
    "id" UUID NOT NULL,
    "season" INTEGER NOT NULL,
    "round_number" INTEGER NOT NULL,
    "session" TEXT NOT NULL,
    "points" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "f1_track_maps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "f1_events_season_round_number_key" ON "f1_events"("season", "round_number");

-- CreateIndex
CREATE INDEX "f1_session_results_season_round_number_session_idx" ON "f1_session_results"("season", "round_number", "session");

-- CreateIndex
CREATE UNIQUE INDEX "f1_session_results_season_round_number_session_driver_number_key" ON "f1_session_results"("season", "round_number", "session", "driver_number");

-- CreateIndex
CREATE UNIQUE INDEX "f1_track_maps_season_round_number_session_key" ON "f1_track_maps"("season", "round_number", "session");
