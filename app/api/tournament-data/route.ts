import { NextResponse } from 'next/server'

const API_KEY = process.env.API_FOOTBALL_KEY!

async function fetchFromAPI(endpoint: string) {
  const res = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
    headers: { 'x-apisports-key': API_KEY },
    cache: 'no-store',
  })
  return res.json()
}

const NAME_MAP: Record<string, string> = {
  'Korea Republic': 'South Korea',
  'IR Iran': 'Iran',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Wales': 'Wales',
}

function mapName(n: string) { return NAME_MAP[n] || n }

const FLAGS: Record<string, string> = {
  'Argentina':'🇦🇷','France':'🇫🇷','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Brazil':'🇧🇷','Spain':'🇪🇸',
  'Germany':'🇩🇪','Portugal':'🇵🇹','Netherlands':'🇳🇱','Belgium':'🇧🇪','Croatia':'🇭🇷',
  'Morocco':'🇲🇦','Uruguay':'🇺🇾','USA':'🇺🇸','Mexico':'🇲🇽','Denmark':'🇩🇰',
  'Japan':'🇯🇵','South Korea':'🇰🇷','Senegal':'🇸🇳','Poland':'🇵🇱','Switzerland':'🇨🇭',
  'Australia':'🇦🇺','Ecuador':'🇪🇨','Tunisia':'🇹🇳','Canada':'🇨🇦','Iran':'🇮🇷',
  'Saudi Arabia':'🇸🇦','Ghana':'🇬🇭','Serbia':'🇷🇸','Costa Rica':'🇨🇷','Cameroon':'🇨🇲',
  'Qatar':'🇶🇦','Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  // 2026 additions
  'Colombia':'🇨🇴','Austria':'🇦🇹','Turkey':'🇹🇷','Egypt':'🇪🇬','Hungary':'🇭🇺',
  'Ukraine':'🇺🇦','Nigeria':'🇳🇬','Ivory Coast':'🇨🇮','Chile':'🇨🇱','Paraguay':'🇵🇾',
  'Venezuela':'🇻🇪','Peru':'🇵🇪','Bolivia':'🇧🇴','Slovakia':'🇸🇰','Czech Republic':'🇨🇿',
  'Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Algeria':'🇩🇿','Mali':'🇲🇱','Panama':'🇵🇦','New Zealand':'🇳🇿',
}

function getFlag(name: string) { return FLAGS[name] || '🏳️' }

// Knockout fixture IDs for 2022
const KO_2022 = {
  r16: [976533,976642,976643,976534,977344,977705,977345,977706],
  qf:  [978072,977794,978088,978036],
  sf:  [978279,978488],
  third: [979138],
  final: [979139],
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const season = searchParams.get('season') || '2022'
  const league = 1

  try {
    // ── STANDINGS (groups) ──
    const standingsData = await fetchFromAPI(`standings?league=${league}&season=${season}`)
    const standingsRaw = standingsData.response?.[0]?.league?.standings || []

    const groups = standingsRaw.map((group: any[]) => {
      return group.map((entry: any) => ({
        name: mapName(entry.team.name),
        flag: getFlag(mapName(entry.team.name)),
        p:   entry.all.played,
        w:   entry.all.win,
        d:   entry.all.draw,
        l:   entry.all.lose,
        gf:  entry.all.goals.for,
        ga:  entry.all.goals.against,
        gd:  entry.goalsDiff,
        pts: entry.points,
        rank: entry.rank,
      }))
    })

    // ── KNOCKOUT FIXTURES ──
    // Fetch all KO fixture IDs in one call using the season + round
    const koFixtureIds = season === '2022'
      ? [...KO_2022.r16, ...KO_2022.qf, ...KO_2022.sf, ...KO_2022.third, ...KO_2022.final]
      : []

    // For 2022 fetch fixtures by round
    const rounds = ['Round of 16', 'Quarter-finals', 'Semi-finals', '3rd Place Final', 'Final']
    const bracketFixtures: any[] = []

    if (season === '2022') {
      for (const round of rounds) {
        const roundData = await fetchFromAPI(
          `fixtures?league=${league}&season=${season}&round=${encodeURIComponent(round)}`
        )
        const fixtures = roundData.response || []
        fixtures.forEach((f: any) => {
          bracketFixtures.push({
            id: f.fixture.id,
            round: f.league.round,
            home: mapName(f.teams.home.name),
            homeFlag: getFlag(mapName(f.teams.home.name)),
            homeScore: f.goals.home,
            away: mapName(f.teams.away.name),
            awayFlag: getFlag(mapName(f.teams.away.name)),
            awayScore: f.goals.away,
            winner: f.teams.home.winner ? mapName(f.teams.home.name) : f.teams.away.winner ? mapName(f.teams.away.name) : null,
            status: f.fixture.status.short,
            penHome: f.score.penalty.home,
            penAway: f.score.penalty.away,
          })
        })
      }
    } else {
      // For 2026 fetch upcoming/live KO fixtures
      for (const round of rounds) {
        const roundData = await fetchFromAPI(
          `fixtures?league=${league}&season=${season}&round=${encodeURIComponent(round)}`
        )
        const fixtures = roundData.response || []
        fixtures.forEach((f: any) => {
          bracketFixtures.push({
            id: f.fixture.id,
            round: f.league.round,
            home: mapName(f.teams.home.name),
            homeFlag: getFlag(mapName(f.teams.home.name)),
            homeScore: f.goals.home,
            away: mapName(f.teams.away.name),
            awayFlag: getFlag(mapName(f.teams.away.name)),
            awayScore: f.goals.away,
            winner: f.teams.home.winner ? mapName(f.teams.home.name) : f.teams.away.winner ? mapName(f.teams.away.name) : null,
            status: f.fixture.status.short,
            penHome: f.score.penalty.home,
            penAway: f.score.penalty.away,
          })
        })
      }
    }

    return NextResponse.json({ groups, bracket: bracketFixtures })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
