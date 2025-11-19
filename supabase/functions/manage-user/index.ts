// Supabase Edge Function - manage-user (GET, PUT, DELETE)
// @ts-nocheck
import { serve } from 'std/server'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const secret = req.headers.get('x-service-role')
    if (!secret || secret !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    const url = new URL(req.url)
    const parts = url.pathname.split('/')
    const id = parts[parts.length - 1]
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })

    if (req.method === 'GET') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}&select=*`, {
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
      })
      const rows = await res.json()
      return new Response(JSON.stringify(rows[0] || null), { headers: { 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      // only allow safe fields
      const safe = {
        username: body.username,
        email: body.email,
        role: body.role,
        metadata: body.metadata
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify(safe)
      })
      const data = await res.json()
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
    }

    if (req.method === 'DELETE') {
      await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
        method: 'DELETE',
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
      })
      return new Response(JSON.stringify({ message: 'deleted' }))
    }

    return new Response(null, { status: 405 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
