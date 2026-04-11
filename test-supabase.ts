import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data } = await supabase.from('assets').select(`
    serial_number,
    functional_principles:function_principle_id ( *, type:functional_principle_types!fk_functional_principle_type(code) )
  `).eq('serial_number', 'SN004').single();
  
  console.log(JSON.stringify(data, null, 2));
}

run();
