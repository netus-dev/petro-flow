require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('assets').select(`
    serial_number,
    functional_principles:function_principle_id (
      id,
      functional_principle_types ( code )
    )
  `).eq('serial_number', 'sn004').single();
  console.log(JSON.stringify({ data, error }, null, 2));
}
run();
