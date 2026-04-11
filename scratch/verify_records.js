
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking records for company mismatch...');
  
  // Checking asset sn004
  const { data: assetData, error: assetError } = await supabase
    .from('assets')
    .select('serial_number, company_id, companies(name)')
    .eq('serial_number', 'sn004')
    .single();

  if (assetError) {
    if (assetError.code === 'PGRST116') {
      console.log('Asset sn004 not found (or hidden by RLS)');
    } else {
      console.error('Error checking asset:', assetError.message);
    }
  } else {
    console.log(`Asset sn004: Company ID = ${assetData.company_id} (${assetData.companies?.name})`);
  }

  // Checking locations MCI 1 and MCI 2
  const { data: locData, error: locError } = await supabase
    .from('locations')
    .select('name, company_id, companies(name)')
    .in('name', ['MCI 1', 'MCI 2', 'MCI1', 'MCI2']);

  if (locError) {
    console.error('Error checking locations:', locError.message);
  } else if (locData) {
    locData.forEach(loc => {
      console.log(`Location ${loc.name}: Company ID = ${loc.company_id} (${loc.companies?.name})`);
    });
  }
}

check();
