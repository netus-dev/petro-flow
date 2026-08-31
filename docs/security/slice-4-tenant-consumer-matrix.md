# Slice 4 Tenant Consumer Matrix

The signed `petro_company_context` cookie and `createTenantClient()` are the
web business-data boundary. The browser client cannot read that cookie, so its
runtime object exposes only `auth` and the authentication-only
`get_user_profile` RPC. It does not forward the Supabase client surface.

| Consumer | Current boundary | Slice 4 disposition | Next slice |
| --- | --- | --- | --- |
| Catalog Server Components and Server Actions | `createTenantClient()` | Migrated and covered by server tests | None identified |
| Authentication and company preselection | Server `createClient()` or browser auth client | Preserved; preselection remains the only non-tenant flow | None |
| Trazabilidad browser repository | Browser `createClient()` | Fail-closed: table queries throw before network access | Move reads and mutations to Server Components/Actions |
| Lookahead browser datasource | Browser `createClient()` | Fail-closed: table queries throw before network access | Move reads and mutations to Server Components/Actions |
| Access-control repository | Generic server `createClient()` | Not migrated in this slice; remains an unrestricted server-client gap, not a browser fallback | Define an explicit platform-admin/server authorization boundary |

Missing, invalid, stale, mismatched, or unauthorized company context must not
be replaced with a caller-provided header. The server tenant client returns
`null` unless authorization renewal succeeds. Browser access to `from`, `rpc`
outside `get_user_profile`, `storage`, `functions`, `channel`, and `schema`
fails before network access.

This matrix is intentionally not a claim of complete application security;
database RLS and each future consumer migration still require independent
verification.
