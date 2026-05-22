import { getSupabaseAdmin } from '@/lib/supabase'
const supabaseAdmin = getSupabaseAdmin()
import { NextResponse } from 'next/server'

// GET all players
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('players')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — save all players and assignments
export async function POST(request: Request) {
  const body = await request.json()
  const { players } = body // [{name, teams}]

  if (!players || !Array.isArray(players)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Delete existing players and start fresh
  await supabaseAdmin.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const { data, error } = await supabaseAdmin
    .from('players')
    .insert(players.map((p: { name: string; teams: string[] }) => ({
      name: p.name,
      teams: p.teams
    })))
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark setup as complete
  await supabaseAdmin
    .from('settings')
    .update({ setup_complete: true })
    .eq('id', 1)

  return NextResponse.json(data)
}