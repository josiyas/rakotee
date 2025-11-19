// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
// prefer a non-reserved secret name for CLI compatibility, fall back to the
// conventional SUPABASE_SERVICE_ROLE_KEY if present in the dashboard
const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      })
    }

    if (req.method === 'POST') {
      const { email, password, username } = await req.json()

      switch (path) {
        case 'register': {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
          })

          if (authError) throw authError

          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            username,
            email
          })

          if (profileError) throw profileError

          return new Response(JSON.stringify({ message: 'Registration successful' }), {
            headers: { 'Content-Type': 'application/json' }
          })
        }

        case 'login': {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          })
        }

        default:
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})