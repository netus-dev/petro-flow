#!/bin/bash
source .env.local

curl -s -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/assets?select=serial_number,functional_principles:function_principle_id(*,type:functional_principle_types!fk_functional_principle_type(code))&limit=2"
