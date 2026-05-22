
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
 
const API_KEY = process.env.API_FOOTBALL_KEY!
const LEAGUE_ID = 1
const SEASON = 2026
const GOOGLE_CHAT_WEBHOOK = process.env.GOOGLE_CHAT_WEBHOOK_URL!
 
async function fetchFromAPI(endpoint: string) {
  const res = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
    headers: { 'x-apisports-key': API_KEY },
    cache: 'no-store',
  })
  return res.json()
}
 
function getTeamName(apiName: string): string {
  // Map API team names to our app's team names
  const nameMap: Record<string, string> = {
    'Korea Republic': 'South Korea',
    'IR Iran': 'Iran',
    'USA': 'USA',
    'Côte d\'Ivoire': 'Ivory Coast',
    'Czech Republic': 'Czech Republic',
  }
  return nameMap[apiName] || apiName
}
 
function getOwner(teamName: string, players: { name: string; teams: string[] }[]): string | null {
  for (const player of players) {
    if (player.teams.includes(teamName)) return player.name
  }
  return null
}
 
async function sendGoogleChatNotification(message: string) {
  if (!GOOGLE_CHAT_WEBHOOK) return
  try {
    await fetch(GOOGLE_CHAT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    })
  } catch (e) {
    console.error('Google Chat notification failed:', e)
  }
}
 
export async function GET() {
  const supabase = getSupabaseAdmin()
 
  try {
    // 1. Get all players from DB
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('name, teams')
    if (playersError || !players || players.length === 0) {
      return NextResponse.json({ message: 'No players set up yet' })
    }
 
    // 2. Get today's fixtures for the World Cup
    const today = new Date().toISOString().split('T')[0]
    const fixturesData = await fetchFromAPI(
      `fixtures?league=${LEAGUE_ID}&season=${SEASON}&date=${today}`
    )
 
    const fixtures = fixturesData.response || []
    if (fixtures.length === 0) {
      return NextResponse.json({ message: `No fixtures today (${today})` })
    }
 
    const results = {
      fixturesChecked: fixtures.length,
      finesDetected: 0,
      finesSkipped: 0,
      notifications: [] as string[],
    }
 
    // 3. Process each fixture
    for (const fixture of fixtures) {
      const fixtureId = fixture.fixture.id
      const status = fixture.fixture.status.short
      const homeTeamRaw = fixture.teams.home.name
      const awayTeamRaw = fixture.teams.away.name
      const homeScore = fixture.goals.home ?? 0
      const awayScore = fixture.goals.away ?? 0
      const homeTeam = getTeamName(homeTeamRaw)
      const awayTeam = getTeamName(awayTeamRaw)
      const matchLabel = `${homeTeam} vs ${awayTeam}`
 
      // Only process finished matches or live matches
      if (!['FT', 'AET', 'PEN', '1H', '2H', 'ET', 'BT', 'LIVE'].includes(status)) continue
 
      // Get events for this fixture
      const eventsData = await fetchFromAPI(`fixtures/events?fixture=${fixtureId}`)
      const events = eventsData.response || []
 
      // Track which fine types have already triggered a pint between a pair in this game
      // Key: `${fromPlayer}|${toPlayer}` — max 1 pint per game between any two players
      const pairsFined = new Set<string>()
 
      // Helper to try insert a fine
      async function tryInsertFine(
        offTeam: string,
        oppTeam: string,
        fineType: string,
        detail: string,
        dedupeKey: string
      ) {
        const fromPlayer = getOwner(offTeam, players)
        const toPlayer = getOwner(oppTeam, players)
        if (!fromPlayer || !toPlayer || fromPlayer === toPlayer) return
 
        // Cap: 1 pint per game between any pair
        const pairKey = [fromPlayer, toPlayer].sort().join('|')
        if (pairsFined.has(pairKey)) {
          results.finesSkipped++
          return
        }
 
        // Deduplicate across runs using match_id + fine_type + off_team
        const { data: existing } = await supabase
          .from('fines')
          .select('id')
          .eq('match_id', String(fixtureId))
          .eq('fine_type', fineType)
          .eq('off_team', offTeam)
          .single()
 
        if (existing) {
          results.finesSkipped++
          return
        }
 
        // Insert fine
        const { error } = await supabase.from('fines').insert({
          from_player: fromPlayer,
          to_player: toPlayer,
          off_team: offTeam,
          opp_team: oppTeam,
          fine_type: fineType,
          match_label: matchLabel,
          detail,
          match_id: String(fixtureId),
          notified: false,
        })
 
        if (!error) {
          pairsFined.add(pairKey)
          results.finesDetected++
 
          // Send Google Chat notification
          const icon = fineType === 'red-card' ? '🟥' : fineType === 'own-goal' ? '🤦' : '💀'
          const msg = `${icon} *FINE!* ${detail}\n${matchLabel}\n*${fromPlayer}* owes *${toPlayer}* a pint 🍺`
          await sendGoogleChatNotification(msg)
          results.notifications.push(msg)
 
          // Mark as notified
          await supabase
            .from('fines')
            .update({ notified: true })
            .eq('match_id', String(fixtureId))
            .eq('fine_type', fineType)
            .eq('off_team', offTeam)
        }
      }
 
      // ── Detect RED CARDS ──
      for (const event of events) {
        if (event.type === 'Card' && event.detail === 'Red Card') {
          const offTeam = getTeamName(event.team.name)
          const oppTeam = offTeam === homeTeam ? awayTeam : homeTeam
          const detail = `${event.player.name} 🟥 ${event.time.elapsed}'`
          await tryInsertFine(offTeam, oppTeam, 'red-card', detail, `${fixtureId}-red-${event.player.id}`)
        }
      }
 
      // ── Detect OWN GOALS ──
      for (const event of events) {
        if (event.type === 'Goal' && event.detail === 'Own Goal') {
          const scoringTeam = getTeamName(event.team.name) // team credited with the OG
          // The team that conceded the OG is the offending team
          const offTeam = scoringTeam === homeTeam ? awayTeam : homeTeam
          const oppTeam = scoringTeam
          const detail = `${event.player.name} ⚽ OG ${event.time.elapsed}'`
          await tryInsertFine(offTeam, oppTeam, 'own-goal', detail, `${fixtureId}-og-${event.player.id}`)
        }
      }
 
      // ── Detect HAMMERINGS (lost by 4+) — only on finished matches ──
      if (['FT', 'AET', 'PEN'].includes(status)) {
        const margin = Math.abs(homeScore - awayScore)
        if (margin >= 4) {
          const offTeam = homeScore < awayScore ? homeTeam : awayTeam
          const oppTeam = homeScore < awayScore ? awayTeam : homeTeam
          const detail = `${offTeam} lost ${homeScore}–${awayScore} (by ${margin})`
          await tryInsertFine(offTeam, oppTeam, 'hammered', detail, `${fixtureId}-hammered`)
        }
      }
    }
 
    return NextResponse.json({ success: true, ...results })
  } catch (error) {
    console.error('Poll error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}