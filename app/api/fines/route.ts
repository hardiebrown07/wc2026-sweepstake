import { getSupabaseAdmin } from '@/lib/supabase'
const supabaseAdmin = getSupabaseAdmin()
import { NextResponse } from 'next/server'

// GET all fines
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('fines')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}