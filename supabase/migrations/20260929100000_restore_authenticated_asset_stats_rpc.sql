-- Restore authenticated access for the Trazabilidad dashboard stats RPC while
-- keeping its existing SECURITY DEFINER and tenant logic unchanged.
grant execute on function public.get_asset_stats_by_functional_principle(uuid)
  to authenticated;
