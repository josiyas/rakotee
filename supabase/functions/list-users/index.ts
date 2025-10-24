// Supabase Edge Function (TypeScript) - list-users
// This function expects a server-side call (do NOT expose SUPABASE_SERVICE_ROLE_KEY to clients).

import { serve } from 'std/server'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    // Basic protection: require a header with a signed token or request from trusted source
    const secret = req.headers.get('x-service-role')
    if (!secret || secret !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''

    const offset = (page - 1) * limit
    let query = `?select=id,username,email,role,created_at&order=created_at.desc&offset=${offset}&limit=${limit}`
    if (search) {
      // simple search by email or username
      // PostgREST filter example: or=(email.ilike.*value*,username.ilike.*value*)
      const s = encodeURIComponent(`%${search}%`)
      query = `?select=id,username,email,role,created_at&or=(email.ilike.*${s}*,username.ilike.*${s}*)&order=created_at.desc&offset=${offset}&limit=${limit}`
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users${query}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    })
    const users = await res.json()
    // total count header from PostgREST requires head or content-range; for simplicity we'll return the page
    return new Response(JSON.stringify({ users, page }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
