begin;
select plan(4);
select has_table('public', 'hourmeter_maintenance_thresholds', 'threshold table exists');
select has_index('public', 'hourmeter_maintenance_thresholds', 'hourmeter_threshold_lookup', 'lookup index exists');
select col_is_pk('public', 'hourmeter_maintenance_thresholds', 'id', 'id is primary key');
select col_not_null('public', 'hourmeter_maintenance_thresholds', 'threshold_hours', 'threshold is required');
select * from finish(); rollback;
