-- Baseline reconciliation marker for the remote migration history.
--
-- The remote get_asset_stats RPC is already represented by the later local
-- operational-schema migration. Do not recreate or replace that function here.
select 1;
