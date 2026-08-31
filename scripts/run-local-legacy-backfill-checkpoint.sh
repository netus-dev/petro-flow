#!/usr/bin/env bash
set -euo pipefail

db_url=$(supabase status -o env | rg '^DB_URL=' | cut -d= -f2- | tr -d '"')
psql "$db_url" -v ON_ERROR_STOP=1 \
  -f supabase/tests/rbac_legacy_backfill_projection_checkpoint.sql
