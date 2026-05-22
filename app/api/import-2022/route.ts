import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const API_KEY = process.env.API_FOOTBALL_KEY!

// All 64 fixture IDs from the 2022 World Cup
const FIXTURE_IDS = [
  855736, 855735, 855734, 866681, 855737, 855738, 855739, 871850,
  855740, 855741, 871851, 855742, 855743, 855744, 855745, 855746,
  866682, 855747, 855748, 855749, 871852, 855750, 855751, 855752,
  871853, 855753, 855754, 855755, 855756, 855757, 855758, 855759,
  855760, 855761, 855762, 866683, 871854, 855763, 855765, 855764,
  855766, 855767, 855768, 871855, 855769, 855770, 855772, 855771,
  976533, 976642, 976643, 976534, 977344, 977705, 977345, 977706,
  978072, 977794, 978088, 978036, 978279, 978488, 979138, 979139,
]

// API team name → our app team name
const NAME_MAP: Record<string, string> = {
  'Korea Republic': 'South Korea',
  'IR Iran': 'Iran',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Wales': 'Wales',
  'Qatar': 'Qatar',
  'Ecuador': 'Ecuador',
  'Senegal': 'Senegal',
  'Netherlands': 'Netherlands',
  'England': 'England',
  'USA': 'USA',
  'Iran': 'Iran',
  'Argentina': 'Argentina',
  'Saudi Arabia': 'Saudi Arabia',
  'Mexico': 'Mexico',
  'Poland': 'Poland',
  'France': 'France',
  'Australia': 'Australia',
  'Tunisia': 'Tunisia',
  'Denmark': 'Denmark',
  'Japan': 'Japan',
  'Costa Rica': 'Costa Rica',
  'Spain': 'Spain',
  'Germany': 'Germany',
  'Morocco': 'Morocco',
  'Croatia': 'Croatia',
  'Belgium': 'Belgium',
  'Canada': 'Canada',
  'Brazil': 'Brazil',
  'Switzerland': 'Switzerland',
  'Cameroon': 'Cameroon',
  'Serbia': 'Serbia',
  'Portugal': 'Portugal',
  'South Korea': 'South Korea',
  'Uruguay': 'Uruguay',
  'Ghana': 'Ghana',
}

function mapName(apiName: string): string {
  return NAME_MAP[apiName] || apiName
}

async function fetchEvents(fixtureId: number) {
  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`,
    { headers: { 'x-apisports-key': API_KEY }, cache: 'no-store' }
  )
  const data = await res.json()
  return data.response || []
}

export async function GET() {
  const supabase = getSupabaseAdmin()

  // Get players
  const { data: players } = await supabase.from('players').select('name, teams')
  if (!players || players.length === 0) {
    return NextResponse.json({ error: 'No players set up. Complete setup first.' }, { status: 400 })
  }

  function getOwner(teamName: string): string | null {
    for (const p of (players || [])) {
        if (p.teams.includes(teamName)) return p.name
    }
    return null
  }

  // Clear existing 2022 fines to avoid duplication on re-run
  await supabase.from('fines').delete().like('match_id', '%')

  const results = {
    fixturesProcessed: 0,
    finesInserted: 0,
    errors: [] as string[],
  }

  // Fixture data (scores + teams) — already fetched, hardcode from API response
  const FIXTURES: Record<number, { home: string; away: string; homeScore: number; awayScore: number; status: string; round: string; date: string }> = {
    855736: { home:'Qatar',       away:'Ecuador',     homeScore:0, awayScore:2, status:'FT', round:'Group Stage - 1', date:'2022-11-20' },
    855735: { home:'England',     away:'Iran',        homeScore:6, awayScore:2, status:'FT', round:'Group Stage - 1', date:'2022-11-21' },
    855734: { home:'Senegal',     away:'Netherlands', homeScore:0, awayScore:2, status:'FT', round:'Group Stage - 1', date:'2022-11-21' },
    866681: { home:'USA',         away:'Wales',       homeScore:1, awayScore:1, status:'FT', round:'Group Stage - 1', date:'2022-11-21' },
    855737: { home:'Argentina',   away:'Saudi Arabia',homeScore:1, awayScore:2, status:'FT', round:'Group Stage - 1', date:'2022-11-22' },
    855738: { home:'Denmark',     away:'Tunisia',     homeScore:0, awayScore:0, status:'FT', round:'Group Stage - 1', date:'2022-11-22' },
    855739: { home:'Mexico',      away:'Poland',      homeScore:0, awayScore:0, status:'FT', round:'Group Stage - 1', date:'2022-11-22' },
    871850: { home:'France',      away:'Australia',   homeScore:4, awayScore:1, status:'FT', round:'Group Stage - 1', date:'2022-11-22' },
    855740: { home:'Morocco',     away:'Croatia',     homeScore:0, awayScore:0, status:'FT', round:'Group Stage - 1', date:'2022-11-23' },
    855741: { home:'Germany',     away:'Japan',       homeScore:1, awayScore:2, status:'FT', round:'Group Stage - 1', date:'2022-11-23' },
    871851: { home:'Spain',       away:'Costa Rica',  homeScore:7, awayScore:0, status:'FT', round:'Group Stage - 1', date:'2022-11-23' },
    855742: { home:'Belgium',     away:'Canada',      homeScore:1, awayScore:0, status:'FT', round:'Group Stage - 1', date:'2022-11-23' },
    855743: { home:'Switzerland', away:'Cameroon',    homeScore:1, awayScore:0, status:'FT', round:'Group Stage - 1', date:'2022-11-24' },
    855744: { home:'Uruguay',     away:'South Korea', homeScore:0, awayScore:0, status:'FT', round:'Group Stage - 1', date:'2022-11-24' },
    855745: { home:'Portugal',    away:'Ghana',       homeScore:3, awayScore:2, status:'FT', round:'Group Stage - 1', date:'2022-11-24' },
    855746: { home:'Brazil',      away:'Serbia',      homeScore:2, awayScore:0, status:'FT', round:'Group Stage - 1', date:'2022-11-24' },
    866682: { home:'Wales',       away:'Iran',        homeScore:0, awayScore:2, status:'FT', round:'Group Stage - 2', date:'2022-11-25' },
    855747: { home:'Qatar',       away:'Senegal',     homeScore:1, awayScore:3, status:'FT', round:'Group Stage - 2', date:'2022-11-25' },
    855748: { home:'Netherlands', away:'Ecuador',     homeScore:1, awayScore:1, status:'FT', round:'Group Stage - 2', date:'2022-11-25' },
    855749: { home:'England',     away:'USA',         homeScore:0, awayScore:0, status:'FT', round:'Group Stage - 2', date:'2022-11-25' },
    871852: { home:'Tunisia',     away:'Australia',   homeScore:0, awayScore:1, status:'FT', round:'Group Stage - 2', date:'2022-11-26' },
    855750: { home:'Poland',      away:'Saudi Arabia',homeScore:2, awayScore:0, status:'FT', round:'Group Stage - 2', date:'2022-11-26' },
    855751: { home:'France',      away:'Denmark',     homeScore:2, awayScore:1, status:'FT', round:'Group Stage - 2', date:'2022-11-26' },
    855752: { home:'Argentina',   away:'Mexico',      homeScore:2, awayScore:0, status:'FT', round:'Group Stage - 2', date:'2022-11-26' },
    871853: { home:'Japan',       away:'Costa Rica',  homeScore:0, awayScore:1, status:'FT', round:'Group Stage - 2', date:'2022-11-27' },
    855753: { home:'Belgium',     away:'Morocco',     homeScore:0, awayScore:2, status:'FT', round:'Group Stage - 2', date:'2022-11-27' },
    855754: { home:'Croatia',     away:'Canada',      homeScore:4, awayScore:1, status:'FT', round:'Group Stage - 2', date:'2022-11-27' },
    855755: { home:'Spain',       away:'Germany',     homeScore:1, awayScore:1, status:'FT', round:'Group Stage - 2', date:'2022-11-27' },
    855756: { home:'Cameroon',    away:'Serbia',      homeScore:3, awayScore:3, status:'FT', round:'Group Stage - 2', date:'2022-11-28' },
    855757: { home:'South Korea', away:'Ghana',       homeScore:2, awayScore:3, status:'FT', round:'Group Stage - 2', date:'2022-11-28' },
    855758: { home:'Brazil',      away:'Switzerland', homeScore:1, awayScore:0, status:'FT', round:'Group Stage - 2', date:'2022-11-28' },
    855759: { home:'Portugal',    away:'Uruguay',     homeScore:2, awayScore:0, status:'FT', round:'Group Stage - 2', date:'2022-11-28' },
    855760: { home:'Netherlands', away:'Qatar',       homeScore:2, awayScore:0, status:'FT', round:'Group Stage - 3', date:'2022-11-29' },
    855761: { home:'Ecuador',     away:'Senegal',     homeScore:1, awayScore:2, status:'FT', round:'Group Stage - 3', date:'2022-11-29' },
    855762: { home:'Iran',        away:'USA',         homeScore:0, awayScore:1, status:'FT', round:'Group Stage - 3', date:'2022-11-29' },
    866683: { home:'Wales',       away:'England',     homeScore:0, awayScore:3, status:'FT', round:'Group Stage - 3', date:'2022-11-29' },
    871854: { home:'Australia',   away:'Denmark',     homeScore:1, awayScore:0, status:'FT', round:'Group Stage - 3', date:'2022-11-30' },
    855763: { home:'Tunisia',     away:'France',      homeScore:1, awayScore:0, status:'FT', round:'Group Stage - 3', date:'2022-11-30' },
    855765: { home:'Saudi Arabia',away:'Mexico',      homeScore:1, awayScore:2, status:'FT', round:'Group Stage - 3', date:'2022-11-30' },
    855764: { home:'Poland',      away:'Argentina',   homeScore:0, awayScore:2, status:'FT', round:'Group Stage - 3', date:'2022-11-30' },
    855766: { home:'Croatia',     away:'Belgium',     homeScore:0, awayScore:0, status:'FT', round:'Group Stage - 3', date:'2022-12-01' },
    855767: { home:'Canada',      away:'Morocco',     homeScore:1, awayScore:2, status:'FT', round:'Group Stage - 3', date:'2022-12-01' },
    855768: { home:'Japan',       away:'Spain',       homeScore:2, awayScore:1, status:'FT', round:'Group Stage - 3', date:'2022-12-01' },
    871855: { home:'Costa Rica',  away:'Germany',     homeScore:2, awayScore:4, status:'FT', round:'Group Stage - 3', date:'2022-12-01' },
    855769: { home:'South Korea', away:'Portugal',    homeScore:2, awayScore:1, status:'FT', round:'Group Stage - 3', date:'2022-12-02' },
    855770: { home:'Ghana',       away:'Uruguay',     homeScore:0, awayScore:2, status:'FT', round:'Group Stage - 3', date:'2022-12-02' },
    855772: { home:'Serbia',      away:'Switzerland', homeScore:2, awayScore:3, status:'FT', round:'Group Stage - 3', date:'2022-12-02' },
    855771: { home:'Cameroon',    away:'Brazil',      homeScore:1, awayScore:0, status:'FT', round:'Group Stage - 3', date:'2022-12-02' },
    976533: { home:'Netherlands', away:'USA',         homeScore:3, awayScore:1, status:'FT', round:'Round of 16',    date:'2022-12-03' },
    976642: { home:'Argentina',   away:'Australia',   homeScore:2, awayScore:1, status:'FT', round:'Round of 16',    date:'2022-12-03' },
    976643: { home:'France',      away:'Poland',      homeScore:3, awayScore:1, status:'FT', round:'Round of 16',    date:'2022-12-04' },
    976534: { home:'England',     away:'Senegal',     homeScore:3, awayScore:0, status:'FT', round:'Round of 16',    date:'2022-12-04' },
    977344: { home:'Japan',       away:'Croatia',     homeScore:1, awayScore:1, status:'PEN',round:'Round of 16',    date:'2022-12-05' },
    977705: { home:'Brazil',      away:'South Korea', homeScore:4, awayScore:1, status:'FT', round:'Round of 16',    date:'2022-12-05' },
    977345: { home:'Morocco',     away:'Spain',       homeScore:0, awayScore:0, status:'PEN',round:'Round of 16',    date:'2022-12-06' },
    977706: { home:'Portugal',    away:'Switzerland', homeScore:6, awayScore:1, status:'FT', round:'Round of 16',    date:'2022-12-06' },
    978072: { home:'Croatia',     away:'Brazil',      homeScore:1, awayScore:1, status:'PEN',round:'Quarter-finals', date:'2022-12-09' },
    977794: { home:'Netherlands', away:'Argentina',   homeScore:2, awayScore:2, status:'PEN',round:'Quarter-finals', date:'2022-12-09' },
    978088: { home:'Morocco',     away:'Portugal',    homeScore:1, awayScore:0, status:'FT', round:'Quarter-finals', date:'2022-12-10' },
    978036: { home:'England',     away:'France',      homeScore:1, awayScore:2, status:'FT', round:'Quarter-finals', date:'2022-12-10' },
    978279: { home:'Argentina',   away:'Croatia',     homeScore:3, awayScore:0, status:'FT', round:'Semi-finals',    date:'2022-12-13' },
    978488: { home:'France',      away:'Morocco',     homeScore:2, awayScore:0, status:'FT', round:'Semi-finals',    date:'2022-12-14' },
    979138: { home:'Croatia',     away:'Morocco',     homeScore:2, awayScore:1, status:'FT', round:'3rd Place Final',date:'2022-12-17' },
    979139: { home:'Argentina',   away:'France',      homeScore:3, awayScore:3, status:'PEN',round:'Final',          date:'2022-12-18' },
  }

  // Process each fixture
  for (const fixtureId of FIXTURE_IDS) {
    const fix = FIXTURES[fixtureId]
    if (!fix) continue

    const homeTeam = mapName(fix.home)
    const awayTeam = mapName(fix.away)
    const matchLabel = `${homeTeam} vs ${awayTeam} (${fix.round})`
    const pairsFined = new Set<string>()

    async function tryInsert(offTeam: string, oppTeam: string, fineType: string, detail: string) {
      const fromPlayer = getOwner(offTeam)
      const toPlayer = getOwner(oppTeam)
      if (!fromPlayer || !toPlayer || fromPlayer === toPlayer) return

      const pairKey = [fromPlayer, toPlayer].sort().join('|') + `|${fixtureId}`
      if (pairsFined.has(pairKey)) return
      pairsFined.add(pairKey)

      const { error } = await supabase.from('fines').insert({
        from_player: fromPlayer,
        to_player: toPlayer,
        off_team: offTeam,
        opp_team: oppTeam,
        fine_type: fineType,
        match_label: matchLabel,
        detail,
        match_id: `2022-${fixtureId}`,
        notified: true,
      })
      if (!error) results.finesInserted++
      else results.errors.push(`Fine insert error: ${error.message}`)
    }

    // Fetch events from API
    try {
      const events = await fetchEvents(fixtureId)

      // Red cards
      for (const ev of events) {
        if (ev.type === 'Card' && ev.detail === 'Red Card') {
          const offTeam = mapName(ev.team.name)
          const oppTeam = offTeam === homeTeam ? awayTeam : homeTeam
          await tryInsert(offTeam, oppTeam, 'red-card', `${ev.player.name} 🟥 ${ev.time.elapsed}'`)
        }
      }

      // Own goals
      for (const ev of events) {
        if (ev.type === 'Goal' && ev.detail === 'Own Goal') {
          const beneficiary = mapName(ev.team.name)
          const offTeam = beneficiary === homeTeam ? awayTeam : homeTeam
          await tryInsert(offTeam, beneficiary, 'own-goal', `${ev.player.name} ⚽ OG ${ev.time.elapsed}'`)
        }
      }
    } catch (e) {
      results.errors.push(`Events fetch error for ${fixtureId}: ${String(e)}`)
    }

    // Hammerings (lost by 4+) — from fixture data
    if (['FT', 'AET', 'PEN'].includes(fix.status)) {
      const margin = Math.abs(fix.homeScore - fix.awayScore)
      if (margin >= 4) {
        const offTeam = fix.homeScore < fix.awayScore ? homeTeam : awayTeam
        const oppTeam = fix.homeScore < fix.awayScore ? awayTeam : homeTeam
        await tryInsert(offTeam, oppTeam, 'hammered',
          `${offTeam} lost ${fix.homeScore}–${fix.awayScore} (by ${margin})`)
      }
    }

    results.fixturesProcessed++

    // Small delay to be kind to the API rate limits
    await new Promise(r => setTimeout(r, 150))
  }

  return NextResponse.json({ success: true, ...results })
}