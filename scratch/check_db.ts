import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function check() {
  const { data, error } = await supabase.from("transaction_certificates").select("*").limit(1);
  console.log("transaction_certificates:", error ? error.message : data);
  
  const { data: d2, error: e2 } = await supabase.from("transactions").select("*").limit(1);
  console.log("transactions:", e2 ? e2.message : d2);
}

check();
