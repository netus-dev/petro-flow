
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

async function testJoin() {
  console.log("Testing join permutations for functional_principles...");

  // Permutation 1: functional_principle_types(code)
  const { data: p1, error: e1 } = await supabase
    .from('assets')
    .select('serial_number, functional_principles:function_principle_id ( id, name, functional_principle_types(code) )')
    .eq('serial_number', 'sn004')
    .single();
  console.log("P1 results:", JSON.stringify(p1, null, 2));
  if (e1) console.error("P1 error:", e1);

  // Permutation 2: type(code)
  const { data: p2, error: e2 } = await supabase
    .from('assets')
    .select('serial_number, functional_principles:function_principle_id ( id, name, type(code) )')
    .eq('serial_number', 'sn004')
    .single();
  console.log("P2 results:", JSON.stringify(p2, null, 2));
  if (e2) console.error("P2 error:", e2);

  // Permutation 3: Explicit relationship with hint
  const { data: p3, error: e3 } = await supabase
    .from('assets')
    .select('serial_number, functional_principles:function_principle_id ( id, name, functional_principle_types!fk_functional_principle_type(code) )')
    .eq('serial_number', 'sn004')
    .single();
  console.log("P3 results:", JSON.stringify(p3, null, 2));
  if (e3) console.error("P3 error:", e3);
  
  // Permutation 4: Alias + hint
  const { data: p4, error: e4 } = await supabase
    .from('assets')
    .select('serial_number, functional_principles:function_principle_id ( id, name, type_ref:functional_principle_types!fk_functional_principle_type(code) )')
    .eq('serial_number', 'sn004')
    .single();
  console.log("P4 results:", JSON.stringify(p4, null, 2));
  if (e4) console.error("P4 error:", e4);
}

testJoin();
