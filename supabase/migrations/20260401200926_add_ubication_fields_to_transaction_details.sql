-- Baseline reconciliation marker for the remote migration history.
--
-- The remote schema already contains the ubication-related movement shape, and
-- its canonical local representation is applied by the later movement schema
-- migration. Do not replay or duplicate that DDL here.
select 1;
